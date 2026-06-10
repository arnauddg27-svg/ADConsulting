import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 120;

const MODEL = "claude-opus-4-8";

/* Plain-language definitions for every metric the dashboard shows, sourced from
   FSP_DASHBOARD_KPI_REFERENCE.md and the 2026-06-10 data audit. Several labels
   are proxies — the bot must describe them honestly, never as cash actuals. */
const METRIC_DEFINITIONS = `
Metric definitions (authoritative for this dashboard — use these exact meanings):
- Total Budget / per-job Budget: sum of task budget costs from the ERP cost summary. Reconciles to the ERP to the dollar.
- Actual Spend (PROXY): budget cost of COMPLETED tasks ("completed scope"). NOT cash paid and NOT invoices — the ERP feed does not yet provide invoice or payment data.
- Committed POs: sum of purchase-order amounts issued (committed exposure, not paid). Paid-PO and invoiced amounts are all $0/null in the ERP feed today.
- Open POs: committed POs not yet paid or closed — currently equals all committed POs because none are paid.
- PO Budget: budget for tasks whose vendor has a PO on that job ("sent-PO scope"). Intentionally excludes budget for vendors with no POs yet, which is most of the budget early in construction.
- PO Variance: PO Budget minus Committed POs. Positive = budget remaining on sent-PO scope.
- ERP O/U: the ERP's own over/under = tracked task budget minus task-linked committed POs. This is the exact number the ERP UI shows. It scopes both sides to line-linked items, so it intentionally differs from PO Variance.
- Progress (e.g. "35% Dry-in Roof"): ERP-native milestone progress through a fixed 22-milestone schedule per job. This is the primary progress measure; task-completion counts are tracked separately.
- Milestones column: completed milestones out of 22.
- Since Milestone / days_since_last_milestone: days since the task matching the last achieved milestone was completed. Null until a job reaches its first milestone. Stall coloring: 45+ days = slow, 90+ days = stuck.
- Task statuses: COMPLETED, IN_PROGRESS, ORDERED (materials/work ordered), NOT_STARTED.
- Exceptions: TASK_OVERDUE (scheduled end date passed; HIGH severity if >14 days), TASK_NO_VENDOR (budgeted task with no vendor assigned). Exception counts are a daily snapshot and can lag intraday.
- Data quality checks: coverage ratios — good >=85%, watch >=35%, alert below 35%.
- Land Runway tab: scenario planning with a per-address start/completion schedule. Pipeline rows there are planning inputs stored in the user's browser, not warehouse data.
- Data freshness: the warehouse syncs from the FSP ERP daily around 6:00 AM ET, and the dashboard page refreshes its data once per day (and on each deploy).`;

const SYSTEM_CORE = `You are the FSP Analyst — an AI data analyst embedded in the Builder Ops Console dashboard for FSP (Florida Sun Partners II), a residential builder in Orlando, FL (Wedgefield community).

You answer questions about the dashboard's data. The current data is provided as JSON in this conversation.

Rules:
- Ground every number in the provided JSON. If the data needed is not in it, say so plainly and name what is missing. Never invent or estimate numbers that are not derivable from the data.
- Use the metric definitions below verbatim in spirit — several dashboard labels are proxies and must be described honestly (e.g. "Actual Spend" is completed-task budget, not cash).
- Money: whole dollars ($356,074) or compact ($5.0M) for large sums. Keep percentages as given.
- Be concise and operational: lead with the direct answer, then up to 3 supporting numbers. Plain text with simple hyphen bullets; no markdown headers or tables.
- You cannot take actions, edit data, or write to the warehouse. If asked to change something, say you are read-only and point to where in the dashboard or ERP it can be done.
- If a question is ambiguous, choose the most reasonable operational reading and say which one you chose in a few words.
${METRIC_DEFINITIONS}`;

/* Naive per-IP limiter. In-memory state survives across warm invocations on
   Fluid Compute; resets on cold start, which is acceptable for this guardrail. */
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const buckets = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  let b = buckets.get(ip);
  if (!b || now > b.reset) {
    b = { count: 0, reset: now + RATE_WINDOW_MS };
    buckets.set(ip, b);
  }
  b.count += 1;
  if (buckets.size > 5000) buckets.clear();
  return b.count > RATE_LIMIT;
}

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "The AI analyst is not configured yet (missing ANTHROPIC_API_KEY)." },
      { status: 503 },
    );
  }

  const ip = (request.headers.get("x-forwarded-for") || "local").split(",")[0].trim();
  if (isRateLimited(ip)) {
    return Response.json(
      { error: "Too many questions in a short time — please try again in a few minutes." },
      { status: 429 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
  const history = rawMessages
    .slice(-20)
    .map((m) => ({
      role: m?.role === "assistant" ? "assistant" : "user",
      content: String(m?.content || "").slice(0, 4000),
    }))
    .filter((m) => m.content.trim().length > 0);

  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return Response.json({ error: "Ask a question to get started." }, { status: 400 });
  }

  let contextJson = "{}";
  try {
    contextJson = JSON.stringify(body?.context ?? {});
  } catch {
    contextJson = "{}";
  }
  if (contextJson.length > 80000) contextJson = contextJson.slice(0, 80000);

  const client = new Anthropic();
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    system: [
      { type: "text", text: SYSTEM_CORE, cache_control: { type: "ephemeral" } },
      {
        type: "text",
        text: `Current dashboard data (JSON):\n${contextJson}`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: history,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const message =
          err instanceof Anthropic.AuthenticationError
            ? "The AI analyst's API key is invalid — check ANTHROPIC_API_KEY."
            : err instanceof Anthropic.RateLimitError
              ? "The AI service is briefly rate-limited — try again in a moment."
              : "The response was interrupted — please ask again.";
        controller.enqueue(encoder.encode(`\n\n[${message}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
