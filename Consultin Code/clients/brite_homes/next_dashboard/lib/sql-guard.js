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
