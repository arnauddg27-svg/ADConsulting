import { dashboardConfig } from "./bigquery.js";

const FORBIDDEN = /\b(INSERT|UPDATE|DELETE|MERGE|DROP|CREATE|ALTER|TRUNCATE|GRANT|REVOKE|CALL|EXPORT|LOAD|DECLARE|BEGIN|EXECUTE)\b/i;

export function preCheckSql(sql) {
  const trimmed = String(sql || "").trim();
  if (!trimmed) return { ok: false, reason: "Empty SQL." };
  const body = trimmed.replace(/;+\s*$/, "");
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
  return {
    projectId: cfg.projectId,
    allowedDatasets: Array.from(new Set([cfg.rawDataset, staging, cfg.dataset])),
    maxBytesScanned: Number(process.env.ASK_MAX_BYTES_SCANNED) || 2 * 1024 ** 3,
  };
}
