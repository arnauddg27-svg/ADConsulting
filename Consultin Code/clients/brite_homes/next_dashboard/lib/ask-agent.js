import { preCheckSql, evaluateDryRun } from "./sql-guard.js";

function compactValue(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === "object") {
    if ("value" in v) return compactValue(v.value);
    const s = JSON.stringify(v);
    return s.length > 200 ? `${s.slice(0, 200)}…` : s;
  }
  if (typeof v === "string" && v.length > 200) return `${v.slice(0, 200)}…`;
  return v;
}

function compactRow(row) {
  const out = {};
  for (const k of Object.keys(row)) out[k] = compactValue(row[k]);
  return out;
}

export async function runGuardedSql(sql, { dryRunFn, queryFn, config, rowCap = 50 }) {
  const pre = preCheckSql(sql);
  if (!pre.ok) return { ok: false, error: pre.reason };

  let stats;
  try {
    stats = await dryRunFn(sql);
  } catch (e) {
    return { ok: false, error: `Query failed validation: ${e.message}` };
  }

  const evaluation = evaluateDryRun(stats, config);
  if (!evaluation.ok) return { ok: false, error: evaluation.reason };

  let fetched;
  try {
    fetched = await queryFn(sql, { maxBytes: config.maxBytesScanned, maxResults: rowCap + 1 });
  } catch (e) {
    return { ok: false, error: `Query failed to run: ${e.message}` };
  }

  const truncated = fetched.length > rowCap;
  const rows = fetched.slice(0, rowCap).map(compactRow);
  const columns = rows.length ? Object.keys(rows[0]) : [];
  return { ok: true, columns, rows, rowCount: rows.length, bytesProcessed: evaluation.bytes, truncated };
}

export const SQL_TOOL_DEFINITION = {
  name: "run_sql",
  description:
    "Run a single read-only BigQuery Standard SQL SELECT against the Brite Homes warehouse and get the rows back. " +
    "Prefer the PREFERRED marts dataset. Always fully-qualify tables as `project.dataset.table`. " +
    "The query is validated: only SELECT is allowed, only the Brite Homes datasets are queryable, and large scans are rejected.",
  input_schema: {
    type: "object",
    properties: {
      sql: { type: "string", description: "The BigQuery Standard SQL SELECT statement to run." },
      purpose: { type: "string", description: "One short sentence: what this query is for." },
    },
    required: ["sql"],
  },
};

export function buildSystemPrompt(schemaText) {
  return [
    "You are the Brite Homes warehouse data analyst. You answer operations questions for a homebuilder by querying their BigQuery warehouse.",
    "",
    "How to work:",
    "- Use the run_sql tool to get real data. Never invent numbers, rows, table names, or columns.",
    "- Prefer the PREFERRED marts dataset and its KPI views — they encode the business logic (margins, cycle times, exception rules) and match the dashboard exactly. Only drop to the raw dataset for row-level detail the marts don't expose.",
    "- Fully-qualify every table as `project.dataset.table` using the catalog below.",
    "- BigQuery Standard SQL only. One statement per query. Read-only (SELECT/WITH).",
    "- Start narrow: filter by date/community and select only the columns you need to keep scans small. If a query is rejected for scanning too much, add filters or aggregate.",
    "- You may run several queries to explore and refine, but be economical.",
    "",
    "How to answer:",
    "- Lead with the direct answer and the key numbers, then briefly note which table(s) you used.",
    "- Call out data-freshness or data-quality caveats when they materially affect the answer.",
    "- Use plain language for an operations leader. Include job IDs, addresses, cities, and dollar amounts when relevant.",
    "",
    "Warehouse schema catalog:",
    schemaText,
  ].join("\n");
}
