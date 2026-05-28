import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createBigQueryClient } from "@/lib/bigquery.js";
import { createAnthropicClient, resolveModel } from "@/lib/anthropic.js";
import { guardConfig } from "@/lib/sql-guard.js";
import { getSchemaCatalog } from "@/lib/warehouse-schema.js";
import { runAskAgent, runGuardedSql } from "@/lib/ask-agent.js";
import { checkRateLimit } from "@/lib/rate-limit.js";
import { logEvent } from "@/lib/ask-log.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGES = 40;
const MAX_LEN = 1200;
const MAX_ATTACH_BYTES_PER_FILE = Number(process.env.ASK_MAX_FILE_BYTES) || 10 * 1024 * 1024; // 10 MB
const MAX_ATTACH_BYTES_PER_MESSAGE = Number(process.env.ASK_MAX_ATTACH_BYTES) || 25 * 1024 * 1024; // 25 MB
const ALLOWED_IMAGE_MEDIA = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]);

// base64 expands bytes by ~4/3; this is the exact decoded length given a valid base64 string
// (we don't strictly need padding-perfect accuracy — close enough to enforce a size budget).
function base64DecodedBytes(s) {
  return Math.ceil((String(s || "").length * 3) / 4);
}

function validateBlock(b) {
  if (!b || typeof b !== "object") return "Each content block must be an object.";
  if (b.type === "text") {
    if (typeof b.text !== "string") return "A text block must have a string 'text'.";
    return null;
  }
  if (b.type === "image") {
    if (!b.source || b.source.type !== "base64") return "An image block needs source.type='base64'.";
    if (!ALLOWED_IMAGE_MEDIA.has(b.source.media_type)) return `Unsupported image media_type: ${b.source.media_type}.`;
    if (base64DecodedBytes(b.source.data) > MAX_ATTACH_BYTES_PER_FILE)
      return `An image exceeds the ${Math.round(MAX_ATTACH_BYTES_PER_FILE / (1024 * 1024))} MB per-file cap.`;
    return null;
  }
  if (b.type === "document") {
    if (!b.source || b.source.type !== "base64") return "A document block needs source.type='base64'.";
    if (b.source.media_type !== "application/pdf") return "Only PDF documents are allowed.";
    if (base64DecodedBytes(b.source.data) > MAX_ATTACH_BYTES_PER_FILE)
      return `A PDF exceeds the ${Math.round(MAX_ATTACH_BYTES_PER_FILE / (1024 * 1024))} MB per-file cap.`;
    return null;
  }
  return `Unsupported content block type: ${b.type}.`;
}

function validate(messages) {
  if (!Array.isArray(messages) || !messages.length) return "messages must be a non-empty array.";
  if (messages.length > MAX_MESSAGES) return `Too many messages (max ${MAX_MESSAGES}).`;
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant")) return "Each message needs role 'user' or 'assistant'.";
    if (typeof m.content === "string") {
      if (!m.content.trim()) return "Each message needs non-empty content.";
      if (m.role === "user" && m.content.length > MAX_LEN) return `Keep each question under ${MAX_LEN} characters.`;
    } else if (Array.isArray(m.content)) {
      if (!m.content.length) return "Each message needs non-empty content.";
      let attachBytes = 0;
      let hasText = false;
      for (const b of m.content) {
        const err = validateBlock(b);
        if (err) return err;
        if (b.type === "text") hasText = true;
        if (b.type === "image" || b.type === "document") attachBytes += base64DecodedBytes(b.source.data);
      }
      if (!hasText) return "A message with attachments must include a text question.";
      if (attachBytes > MAX_ATTACH_BYTES_PER_MESSAGE)
        return `Attachments exceed the ${Math.round(MAX_ATTACH_BYTES_PER_MESSAGE / (1024 * 1024))} MB per-message cap.`;
      if (m.role === "user") {
        const userText = m.content.filter((b) => b.type === "text").map((b) => b.text || "").join("\n");
        if (userText.length > MAX_LEN) return `Keep each question under ${MAX_LEN} characters.`;
      }
    } else {
      return "Each message's content must be a string or an array of content blocks.";
    }
  }
  if (messages[messages.length - 1].role !== "user") return "The last message must be from the user.";
  return null;
}

function clientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0].trim() : "") || request.headers.get("x-real-ip") || "local";
}

function createStreamModel(anthropic, model) {
  return async ({ system, messages, tools, forceAnswer, signal, onText }) => {
    const stream = anthropic.messages.stream(
      {
        model,
        max_tokens: 4096,
        // Cache the large, stable prefix (domain glossary + schema catalog) so it isn't
        // re-billed on every turn of a multi-query question.
        system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
        messages,
        ...(tools && tools.length ? { tools } : {}),
        // On the final turn, keep the tool defined (so the tool-use history stays valid)
        // but forbid further tool calls so the model must write the answer.
        ...(forceAnswer ? { tool_choice: { type: "none" } } : {}),
      },
      signal ? { signal } : undefined,
    );
    stream.on("text", (delta) => onText(delta));
    const final = await stream.finalMessage();
    return { content: final.content, stop_reason: final.stop_reason };
  };
}

export async function POST(request) {
  const requestId = randomUUID();
  const ip = clientIp(request);

  const limit = checkRateLimit(ip);
  if (!limit.ok) {
    logEvent({ kind: "rate_limited", requestId, ip });
    return NextResponse.json({ error: limit.reason }, { status: limit.status || 429 });
  }

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      limit.release();
      return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
    }

    const messages = body?.messages;
    const invalid = validate(messages);
    if (invalid) {
      limit.release();
      return NextResponse.json({ error: invalid }, { status: 400 });
    }

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
      limit.release();
      logEvent({ kind: "error", requestId, phase: "init", error: e.message });
      return NextResponse.json({ error: e.message }, { status: 500 });
    }

    const signal = request.signal;

    const dryRunFn = async (sql) => {
      const [job] = await bq.createQueryJob({ query: sql, dryRun: true, useLegacySql: false });
      const q = job.metadata.statistics.query || {};
      return {
        statementType: q.statementType,
        referencedTables: q.referencedTables || [],
        referencedRoutines: q.referencedRoutines || [],
        ddlOperationPerformed: q.ddlOperationPerformed || null,
        ddlTargetTable: q.ddlTargetTable || null,
        ddlTargetRoutine: q.ddlTargetRoutine || null,
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
      // Cancel the BigQuery job if the client disconnects so we stop paying for it.
      if (signal) {
        if (signal.aborted) job.cancel().catch(() => {});
        else signal.addEventListener("abort", () => job.cancel().catch(() => {}), { once: true });
      }
      const [rows] = await job.getQueryResults({ maxResults });
      return rows;
    };
    const runSql = async (sql) => {
      const t0 = Date.now();
      const res = await runGuardedSql(sql, { dryRunFn, queryFn, config, rowCap: Number(process.env.ASK_RESULT_ROW_CAP) || 50 });
      logEvent({
        kind: "query",
        requestId,
        ok: res.ok,
        bytes: res.bytesProcessed || 0,
        rows: res.rowCount ?? null,
        ms: Date.now() - t0,
        sql: String(sql).slice(0, 600),
        error: res.ok ? undefined : res.error,
      });
      return res;
    };
    const streamModel = createStreamModel(anthropic, model);

    const startedAt = Date.now();
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let closed = false;
        const send = (event) => {
          if (!closed) controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        };
        try {
          const summary = await runAskAgent({
            messages,
            schemaText,
            streamModel,
            runSql,
            model,
            signal,
            maxQueries: Number(process.env.ASK_MAX_QUERIES) || 8,
            maxTotalBytes: Number(process.env.ASK_MAX_TOTAL_BYTES) || 6 * 1024 ** 3,
            onEvent: send,
          });
          logEvent({
            kind: "question",
            requestId,
            ip,
            model,
            queriesRun: summary.queriesRun,
            totalBytesProcessed: summary.totalBytesProcessed,
            ms: Date.now() - startedAt,
            aborted: Boolean(signal?.aborted),
          });
        } catch (e) {
          logEvent({ kind: "error", requestId, phase: "run", error: e.message, ms: Date.now() - startedAt });
          send({ type: "error", message: e.message || "The assistant failed." });
        } finally {
          closed = true;
          try {
            controller.close();
          } catch {
            // controller may already be closed if the client disconnected
          }
          limit.release();
        }
      },
      cancel() {
        // Client disconnected before the stream finished. request.signal is already aborted,
        // which stops the agent loop and cancels in-flight BigQuery jobs; just free the slot.
        limit.release();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (e) {
    limit.release();
    logEvent({ kind: "error", requestId, phase: "post", error: e.message });
    return NextResponse.json({ error: e.message || "Unexpected error." }, { status: 500 });
  }
}
