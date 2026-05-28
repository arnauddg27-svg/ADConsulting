import { dashboardConfig } from "./bigquery.js";

const FORBIDDEN = /\b(INSERT|UPDATE|DELETE|MERGE|DROP|CREATE|ALTER|TRUNCATE|GRANT|REVOKE|CALL|EXPORT|LOAD|DECLARE|BEGIN|EXECUTE)\b/i;

// Strip a single surrounding markdown code fence (```sql ... ```). BigQuery can't parse
// fences, so callers normalize before validation AND execution. SQL comments are left
// intact — BigQuery handles them fine.
export function normalizeSql(sql) {
  let s = String(sql || "").trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "").trim();
  }
  return s;
}

// Remove SQL comments so the start/keyword heuristics see the real statement. Used only
// for validation — the executed SQL keeps its comments.
function stripComments(sql) {
  return sql.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/--[^\n]*/g, " ");
}

export function preCheckSql(sql) {
  const normalized = normalizeSql(sql);
  if (!normalized) return { ok: false, reason: "Empty SQL." };
  // Evaluate the start/keyword/statement heuristics against the comment-free code so a
  // leading "-- explanation" line (which Claude often adds) doesn't trip the SELECT check.
  const code = stripComments(normalized).trim();
  if (!code) return { ok: false, reason: "Empty SQL." };
  const body = code.replace(/;+\s*$/, "");
  if (body.includes(";")) return { ok: false, reason: "Only a single statement is allowed." };
  if (!/^\s*(WITH|SELECT)\b/i.test(body)) return { ok: false, reason: "Query must start with SELECT or WITH." };
  if (FORBIDDEN.test(body)) return { ok: false, reason: "Query contains a forbidden keyword; only read-only SELECT queries are allowed." };
  return { ok: true };
}

export function evaluateDryRun(stats, config) {
  const { statementType, referencedTables = [], totalBytesProcessed = 0 } = stats || {};
  if (statementType !== "SELECT") {
    return { ok: false, reason: `Only SELECT statements are allowed (got ${statementType || "unknown"}).` };
  }
  for (const t of referencedTables) {
    if (t.projectId !== config.projectId) {
      return { ok: false, reason: `Table ${t.projectId}.${t.datasetId}.${t.tableId} is outside the allowed project.` };
    }
    if (!config.allowedDatasets.includes(t.datasetId)) {
      return { ok: false, reason: `Dataset ${t.datasetId} is not queryable. Allowed: ${config.allowedDatasets.join(", ")}.` };
    }
  }
  const bytes = Number(totalBytesProcessed) || 0;
  if (bytes > config.maxBytesScanned) {
    return {
      ok: false,
      reason: `Query would scan ${(bytes / 1e9).toFixed(2)} GB, over the ${(config.maxBytesScanned / 1e9).toFixed(2)} GB limit. Narrow it (filter by date/community, select fewer columns, or aggregate).`,
    };
  }
  return { ok: true, bytes };
}

export function guardConfig() {
  const cfg = dashboardConfig();
  const staging = cfg.rawDataset.replace(/_raw$/, "_staging");
  // Curated views are built on upstream source datasets (e.g. the "Centralized" Google
  // Sheet external table). BigQuery's dry run reports those upstream datasets in
  // referencedTables, so they must be allowlisted or every view that reads the sheet is
  // rejected. ASK_SOURCE_DATASETS is a comma-separated override; defaults to "Centralized".
  const sourceDatasets = (process.env.ASK_SOURCE_DATASETS || "Centralized")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    projectId: cfg.projectId,
    allowedDatasets: Array.from(new Set([cfg.rawDataset, staging, cfg.dataset, ...sourceDatasets])),
    maxBytesScanned: Number(process.env.ASK_MAX_BYTES_SCANNED) || 2 * 1024 ** 3,
  };
}
