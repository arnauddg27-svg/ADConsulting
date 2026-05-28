import { preCheckSql, evaluateDryRun, normalizeSql } from "./sql-guard.js";
import { DOMAIN_CONTEXT } from "./domain-context.js";

function compactValue(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === "bigint") {
    const n = Number(v);
    return Number.isSafeInteger(n) ? n : v.toString();
  }
  if (typeof v === "object") {
    const ctor = (v.constructor && v.constructor.name) || "";
    // BigQuery temporal wrappers (BigQueryDate/Timestamp/Datetime/Time) and simple {value} wrappers.
    if ("value" in v && (Object.keys(v).length === 1 || /^BigQuery/.test(ctor))) return compactValue(v.value);
    // NUMERIC / BIGNUMERIC arrive as big.js instances — render as a clean number string.
    if (ctor === "Big" || typeof v.toFixed === "function") return v.toString();
    if (Array.isArray(v)) return v.slice(0, 25).map(compactValue);
    // Generic STRUCT/RECORD — recurse (bounded) instead of dumping JSON internals.
    const out = {};
    for (const k of Object.keys(v).slice(0, 40)) out[k] = compactValue(v[k]);
    return out;
  }
  if (typeof v === "number" && Number.isInteger(v) && !Number.isSafeInteger(v)) return String(v);
  if (typeof v === "string" && v.length > 200) return `${v.slice(0, 200)}…`;
  return v;
}

function compactRow(row) {
  const out = {};
  for (const k of Object.keys(row)) out[k] = compactValue(row[k]);
  return out;
}

export async function runGuardedSql(sql, { dryRunFn, queryFn, config, rowCap = 50 }) {
  const cleaned = normalizeSql(sql); // strip markdown fences; keep comments (BigQuery handles them)
  const pre = preCheckSql(cleaned);
  if (!pre.ok) return { ok: false, error: pre.reason };

  let stats;
  try {
    stats = await dryRunFn(cleaned);
  } catch (e) {
    return { ok: false, error: `Query failed validation: ${e.message}` };
  }

  const evaluation = evaluateDryRun(stats, config);
  if (!evaluation.ok) return { ok: false, error: evaluation.reason };

  let fetched;
  try {
    fetched = await queryFn(cleaned, { maxBytes: config.maxBytesScanned, maxResults: rowCap + 1 });
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
    "- Use table and column names EXACTLY as they appear in the catalog below. Do not guess conventional names — e.g. this warehouse uses `address`, `address_city`, `address_state` (there is no `property_address`).",
    "- If a query fails with \"Unrecognized name\", do NOT repeat the same guess. Re-read the catalog, or confirm the real columns cheaply (INFORMATION_SCHEMA scans are free): SELECT column_name FROM `project.dataset.INFORMATION_SCHEMA.COLUMNS` WHERE table_name = 'the_table'.",
    "- Prefer the PREFERRED marts dataset and its KPI views — they encode the business logic (margins, cycle times, exception rules) and match the dashboard exactly. Use the staging or raw tables when they hold detail the marts don't expose (e.g. per-job stage / milestone fields).",
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
    "Domain knowledge (definitions and synonyms for how Brite Homes models its data — rely on these so you don't have to rediscover vocabulary):",
    DOMAIN_CONTEXT,
    "",
    "Warehouse schema catalog:",
    schemaText,
  ].join("\n");
}

export async function runAskAgent({
  messages,
  schemaText,
  streamModel,
  runSql,
  model,
  maxQueries = 5,
  maxTotalBytes = 6 * 1024 ** 3,
  onEvent,
  signal,
}) {
  const system = buildSystemPrompt(schemaText);
  const convo = messages.map((m) => ({ role: m.role, content: m.content }));
  let queriesRun = 0;
  let totalBytesProcessed = 0;
  let sawText = false;
  let lastError = null;
  const maxTurns = maxQueries + 4; // extra turns so cheap exploration doesn't starve real queries

  const emitText = (t) => {
    if (t && t.trim()) sawText = true;
    onEvent({ type: "text", text: t });
  };

  // Always produce a user-facing answer, even if every query failed.
  const finish = () => {
    if (!sawText) {
      onEvent({
        type: "text",
        text: lastError
          ? `I couldn't complete a working query for that. The last issue was: ${lastError} Try rephrasing, or ask about a specific table or metric.`
          : "I wasn't able to produce an answer for that. Try rephrasing or asking about a specific metric.",
      });
    }
    onEvent({ type: "done", model, queriesRun, totalBytesProcessed });
    return { queriesRun, totalBytesProcessed };
  };

  for (let turn = 0; turn < maxTurns; turn++) {
    // Stop doing paid work (Claude + BigQuery) if the client disconnected / aborted.
    if (signal?.aborted) {
      onEvent({ type: "done", model, queriesRun, totalBytesProcessed, aborted: true });
      return { queriesRun, totalBytesProcessed };
    }
    const budgetExhausted = queriesRun >= maxQueries || totalBytesProcessed >= maxTotalBytes;
    onEvent({ type: "status", text: budgetExhausted ? "writing answer" : "thinking" });

    // Always pass the tool definition (keeps the message thread valid for the API);
    // forceAnswer tells the model layer to disallow further tool calls on the final turn.
    const result = await streamModel({
      system,
      messages: convo,
      tools: [SQL_TOOL_DEFINITION],
      forceAnswer: budgetExhausted,
      signal,
      onText: emitText,
    });
    convo.push({ role: "assistant", content: result.content });

    // A turn that hit the output-token limit may contain a partial/invalid tool_use — never
    // execute it. Finish with whatever was produced plus a clear note.
    if (result.stop_reason === "max_tokens") {
      onEvent({
        type: "text",
        text: sawText
          ? "\n\n_(Response was cut off — ask a more specific question for the full result.)_"
          : "My response was cut off before I could answer. Please ask a more specific question.",
      });
      onEvent({ type: "done", model, queriesRun, totalBytesProcessed });
      return { queriesRun, totalBytesProcessed };
    }

    const toolUses = budgetExhausted ? [] : (result.content || []).filter((b) => b.type === "tool_use");
    if (!toolUses.length) return finish();

    const toolResults = [];
    for (const tu of toolUses) {
      const sql = String(tu.input?.sql || "");
      onEvent({ type: "tool_use", id: tu.id, sql, purpose: String(tu.input?.purpose || "") });
      if (queriesRun >= maxQueries || totalBytesProcessed >= maxTotalBytes) {
        const message = "Query budget reached for this question; this query was not run. Answer using the data already gathered.";
        onEvent({ type: "tool_result", id: tu.id, error: message });
        toolResults.push({ type: "tool_result", tool_use_id: tu.id, is_error: true, content: message });
        continue;
      }
      const res = await runSql(sql);
      if (res.ok) {
        totalBytesProcessed += Number(res.bytesProcessed || 0);
        // Only queries that actually scanned data count against the budget, so cheap
        // metadata/INFORMATION_SCHEMA lookups and validation rejections don't starve real analysis.
        if (Number(res.bytesProcessed || 0) > 0) queriesRun += 1;
        onEvent({ type: "tool_result", id: tu.id, columns: res.columns, rows: res.rows, rowCount: res.rowCount, bytesProcessed: res.bytesProcessed, truncated: res.truncated });
        toolResults.push({
          type: "tool_result",
          tool_use_id: tu.id,
          content: JSON.stringify({ columns: res.columns, rows: res.rows, rowCount: res.rowCount, truncated: res.truncated }),
        });
      } else {
        lastError = res.error;
        onEvent({ type: "tool_result", id: tu.id, error: res.error });
        toolResults.push({ type: "tool_result", tool_use_id: tu.id, is_error: true, content: res.error });
      }
    }
    convo.push({ role: "user", content: toolResults });
  }

  return finish();
}
