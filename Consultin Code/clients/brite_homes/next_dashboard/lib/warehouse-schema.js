import { dashboardConfig } from "./bigquery.js";

const CACHE_KEY = "__briteHomesAskSchemaCache";
const QUERY_TIMEOUT_MS = Number(process.env.ASK_SCHEMA_QUERY_TIMEOUT_MS) || 20000;
const VALUE_LIST_BYTE_CAP = 512 * 1024 * 1024; // 512MB per value-list probe

// Low-cardinality, high-signal columns whose distinct values help the model map fuzzy
// user terms (e.g. "coed", "palm coast") to exact warehouse values without exploration.
const VALUE_LIST_COLUMNS = new Set([
  "job_type",
  "current_stage",
  "derived_lifecycle_status",
  "lifecycle_status",
  "status",
  "lease_status",
  "margin_status",
  "priority",
  "exception_type",
  // Geographic filters — low cardinality for this client; the >50-distinct guard skips any
  // that turn out high-cardinality (e.g. community/project names).
  "city",
  "address_city",
  "area_name",
]);

function cache() {
  if (!globalThis[CACHE_KEY]) globalThis[CACHE_KEY] = { text: null, at: 0, pending: null };
  return globalThis[CACHE_KEY];
}

export function buildCatalogText({ tables, columns }, { rawDataset, stagingDataset, martsDataset }) {
  const colsByTable = new Map();
  for (const c of columns) {
    const key = `${c.table_schema}.${c.table_name}`;
    if (!colsByTable.has(key)) colsByTable.set(key, []);
    colsByTable.get(key).push(`${c.column_name} ${c.data_type}`);
  }
  const order = [
    { ds: martsDataset, label: "PREFERRED — curated marts & KPI views (numbers match the dashboard)" },
    { ds: stagingDataset, label: "staging (intermediate; usually skip)" },
    { ds: rawDataset, label: "raw (row-level detail; use only when marts lack the field)" },
  ];
  const lines = [];
  for (const { ds, label } of order) {
    const dsTables = tables.filter((t) => t.table_schema === ds);
    if (!dsTables.length) continue;
    lines.push(`## Dataset ${ds} — ${label}`);
    for (const t of dsTables) {
      const cols = colsByTable.get(`${ds}.${t.table_name}`) || [];
      lines.push(`- ${ds}.${t.table_name} (${t.table_type}): ${cols.join(", ")}`);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

// Pure formatter for the discovered enum-like value lists.
export function buildValueListText(valueRows) {
  if (!valueRows || !valueRows.length) return "";
  const lines = [
    "## Known values for key low-cardinality fields",
    "Use these EXACT values when filtering. Map fuzzy user terms to them (e.g. \"coed\"/\"CO'd\" -> a job_type containing \"SFR Completed (not closed)\").",
  ];
  for (const r of valueRows) {
    lines.push(`- ${r.dataset}.${r.table}.${r.column}: ${r.values.join(" | ")}`);
  }
  return lines.join("\n");
}

async function fetchValueLists(client, cfg, columns) {
  // Probe only curated surfaces (marts dataset + the staging enriched table) for the
  // enum-like columns, deduped and capped. Each probe is byte/time-guarded and best-effort.
  // Prioritize the highest-value tables so their enum columns are always covered before the cap
  // (otherwise alphabetical exception tables can exhaust the budget before dim_job_conformed).
  const PRIORITY_TABLES = ["dim_job_conformed", "stg_centralized_data_enriched", "mart_audit_pl", "job_cross_domain_summary"];
  const rank = (t) => {
    const i = PRIORITY_TABLES.indexOf(t);
    return i === -1 ? PRIORITY_TABLES.length : i;
  };
  const candidates = columns
    .filter((c) => VALUE_LIST_COLUMNS.has(c.column_name) && (c.table_schema === cfg.dataset || c.table_name === "stg_centralized_data_enriched"))
    .sort((a, b) => rank(a.table_name) - rank(b.table_name));
  const seen = new Set();
  const targets = [];
  for (const c of candidates) {
    const key = `${c.table_schema}.${c.table_name}.${c.column_name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    targets.push(c);
    if (targets.length >= 30) break;
  }

  const results = await Promise.all(
    targets.map(async (c) => {
      try {
        const [rows] = await client.query({
          query:
            `SELECT CAST(\`${c.column_name}\` AS STRING) AS v, COUNT(*) AS n ` +
            `FROM \`${cfg.projectId}.${c.table_schema}.${c.table_name}\` ` +
            `WHERE \`${c.column_name}\` IS NOT NULL GROUP BY 1 ORDER BY n DESC LIMIT 51`,
          maximumBytesBilled: String(VALUE_LIST_BYTE_CAP),
          jobTimeoutMs: QUERY_TIMEOUT_MS,
        });
        if (!rows.length || rows.length > 50) return null; // empty or not actually an enum
        return {
          dataset: c.table_schema,
          table: c.table_name,
          column: c.column_name,
          values: rows.map((r) => String(r.v)).filter(Boolean),
        };
      } catch {
        return null; // best-effort; a probe failure must not break the catalog
      }
    }),
  );
  return results.filter(Boolean);
}

async function buildCatalog(client) {
  const cfg = dashboardConfig();
  const stagingDataset = cfg.rawDataset.replace(/_raw$/, "_staging");
  const datasets = Array.from(new Set([cfg.dataset, stagingDataset, cfg.rawDataset]));

  const tables = [];
  const columns = [];
  let martsTableCount = 0;

  await Promise.all(
    datasets.map(async (ds) => {
      try {
        const [t] = await client.query({
          query: `SELECT table_schema, table_name, table_type FROM \`${cfg.projectId}.${ds}.INFORMATION_SCHEMA.TABLES\``,
          jobTimeoutMs: QUERY_TIMEOUT_MS,
        });
        const [c] = await client.query({
          query: `SELECT table_schema, table_name, column_name, data_type FROM \`${cfg.projectId}.${ds}.INFORMATION_SCHEMA.COLUMNS\` ORDER BY table_name, ordinal_position`,
          jobTimeoutMs: QUERY_TIMEOUT_MS,
        });
        tables.push(...t);
        columns.push(...c);
        if (ds === cfg.dataset) martsTableCount = t.length;
      } catch (e) {
        // The marts dataset is required; a failure there must NOT be cached as an empty
        // catalog (which would make the model hallucinate tables for an hour).
        if (ds === cfg.dataset) throw e;
        // staging/raw may legitimately not exist — skip them.
      }
    }),
  );

  if (!martsTableCount) {
    throw new Error("Schema introspection returned no marts tables; refusing to cache an empty catalog.");
  }

  const catalog = buildCatalogText(
    { tables, columns },
    { rawDataset: cfg.rawDataset, stagingDataset, martsDataset: cfg.dataset },
  );

  let valueText = "";
  try {
    valueText = buildValueListText(await fetchValueLists(client, cfg, columns));
  } catch {
    valueText = ""; // value lists are an enhancement, never a hard dependency
  }

  return valueText ? `${catalog}\n\n${valueText}` : catalog;
}

export async function getSchemaCatalog(client, { ttlMs = Number(process.env.ASK_SCHEMA_TTL_MS) || 3600000 } = {}) {
  const state = cache();
  if (state.text && Date.now() - state.at < ttlMs) return state.text;
  // Coalesce concurrent cold builds onto a single in-flight promise (no stampede).
  if (state.pending) return state.pending;

  state.pending = buildCatalog(client)
    .then((text) => {
      state.text = text;
      state.at = Date.now();
      return text;
    })
    .catch((error) => {
      // On failure, serve the last good catalog if we have one; otherwise surface the error
      // (route returns 500). Never overwrite a good catalog with an empty/failed one.
      if (state.text) return state.text;
      throw error;
    })
    .finally(() => {
      state.pending = null;
    });

  return state.pending;
}
