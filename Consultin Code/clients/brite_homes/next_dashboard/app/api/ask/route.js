import { NextResponse } from "next/server";
import { createBigQueryClient } from "@/lib/bigquery.js";
import { createAnthropicClient, resolveModel } from "@/lib/anthropic.js";
import { guardConfig } from "@/lib/sql-guard.js";
import { getSchemaCatalog } from "@/lib/warehouse-schema.js";
import { runAskAgent, runGuardedSql } from "@/lib/ask-agent.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGES = 40;
const MAX_LEN = 1200;

function validate(messages) {
  if (!Array.isArray(messages) || !messages.length) return "messages must be a non-empty array.";
  if (messages.length > MAX_MESSAGES) return `Too many messages (max ${MAX_MESSAGES}).`;
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) return "Each message needs role 'user' or 'assistant'.";
    if (typeof m.content !== "string" || !m.content.trim()) return "Each message needs non-empty string content.";
    // Only cap user input — assistant answers replayed as history can legitimately exceed this.
    if (m.role === "user" && m.content.length > MAX_LEN) return `Keep each question under ${MAX_LEN} characters.`;
  }
  if (messages[messages.length - 1].role !== "user") return "The last message must be from the user.";
  return null;
}

function createStreamModel(anthropic, model) {
  return async ({ system, messages, tools, onText }) => {
    const stream = anthropic.messages.stream({
      model,
      max_tokens: 2048,
      system,
      messages,
      ...(tools && tools.length ? { tools } : {}),
    });
    stream.on("text", (delta) => onText(delta));
    const final = await stream.finalMessage();
    return { content: final.content, stop_reason: final.stop_reason };
  };
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const messages = body?.messages;
  const invalid = validate(messages);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  let anthropic;
  let model;
  let bq;
  let config;
  let schemaText;
  try {
    anthropic = createAnthropicClient();
    model = resolveModel();
    bq = createBigQueryClient();
    config = guardConfig();
    schemaText = await getSchemaCatalog(bq);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  const dryRunFn = async (sql) => {
    const [job] = await bq.createQueryJob({ query: sql, dryRun: true, useLegacySql: false });
    const q = job.metadata.statistics.query || {};
    return {
      statementType: q.statementType,
      referencedTables: q.referencedTables || [],
      totalBytesProcessed: Number(job.metadata.statistics.totalBytesProcessed || q.totalBytesProcessed || 0),
    };
  };
  const queryFn = async (sql, { maxBytes, maxResults }) => {
    const [job] = await bq.createQueryJob({
      query: sql,
      useLegacySql: false,
      maximumBytesBilled: String(maxBytes),
      jobTimeoutMs: Number(process.env.ASK_QUERY_TIMEOUT_MS) || 30000,
    });
    const [rows] = await job.getQueryResults({ maxResults });
    return rows;
  };
  const runSql = (sql) =>
    runGuardedSql(sql, { dryRunFn, queryFn, config, rowCap: Number(process.env.ASK_RESULT_ROW_CAP) || 50 });
  const streamModel = createStreamModel(anthropic, model);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        await runAskAgent({
          messages,
          schemaText,
          streamModel,
          runSql,
          model,
          maxQueries: Number(process.env.ASK_MAX_QUERIES) || 5,
          maxTotalBytes: Number(process.env.ASK_MAX_TOTAL_BYTES) || 6 * 1024 ** 3,
          onEvent: send,
        });
      } catch (e) {
        send({ type: "error", message: e.message || "The assistant failed." });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
