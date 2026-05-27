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
