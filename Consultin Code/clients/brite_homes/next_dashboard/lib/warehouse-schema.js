import { dashboardConfig } from "./bigquery.js";

const CACHE_KEY = "__briteHomesAskSchemaCache";

function cache() {
  if (!globalThis[CACHE_KEY]) globalThis[CACHE_KEY] = { text: null, at: 0 };
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

export async function getSchemaCatalog(client, { ttlMs = Number(process.env.ASK_SCHEMA_TTL_MS) || 3600000 } = {}) {
  const state = cache();
  if (state.text && Date.now() - state.at < ttlMs) return state.text;

  const cfg = dashboardConfig();
  const stagingDataset = cfg.rawDataset.replace(/_raw$/, "_staging");
  const datasets = Array.from(new Set([cfg.dataset, stagingDataset, cfg.rawDataset]));

  const tables = [];
  const columns = [];
  await Promise.all(
    datasets.map(async (ds) => {
      try {
        const [t] = await client.query({
          query: `SELECT table_schema, table_name, table_type FROM \`${cfg.projectId}.${ds}.INFORMATION_SCHEMA.TABLES\``,
        });
        const [c] = await client.query({
          query: `SELECT table_schema, table_name, column_name, data_type FROM \`${cfg.projectId}.${ds}.INFORMATION_SCHEMA.COLUMNS\` ORDER BY table_name, ordinal_position`,
        });
        tables.push(...t);
        columns.push(...c);
      } catch {
        // dataset may not exist (e.g. no staging) — skip it
      }
    }),
  );

  const text = buildCatalogText({ tables, columns }, {
    rawDataset: cfg.rawDataset,
    stagingDataset,
    martsDataset: cfg.dataset,
  });
  state.text = text;
  state.at = Date.now();
  return text;
}
