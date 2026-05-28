"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ── Constants ────────────────────────────────────────────────────────────────
const THEME_KEY = "adh-theme";

// Categorized suggestions — each category is a short, recognizable bucket that
// guides operators toward common questions without making them feel scripted.
const SUGGESTION_CATEGORIES = [
  {
    label: "Jobs",
    icon: "pipeline",
    items: [
      "Which jobs have been in their current stage the longest?",
      "Show CO homes that aren't closed yet, worst first.",
    ],
  },
  {
    label: "Financials",
    icon: "chart",
    items: [
      "Average net margin by community for closed jobs.",
      "What's our total WIP and loan exposure right now?",
    ],
  },
  {
    label: "Operations",
    icon: "gauge",
    items: [
      "Top 5 jobs with the biggest variance vs. budget.",
      "Show me jobs flagged with data quality issues.",
    ],
  },
];

const uid = () => Math.random().toString(36).slice(2, 10);

// ── Inline SVG icons ─────────────────────────────────────────────────────────
// Stroke-based 16px icons. Inherit currentColor so they respect any color
// inherited from a parent. strokeWidth 1.75 matches our typography weight.
const Icon = ({ name, size = 16, className = "" }) => {
  const s = size;
  const props = {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    focusable: "false",
    className: `ask-icon ask-icon--${name} ${className}`.trim(),
  };
  switch (name) {
    case "sparkles":
      return (
        <svg {...props}>
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
        </svg>
      );
    case "send":
      return (
        <svg {...props}>
          <path d="M5 12l14-7-4.5 14L12 14l-7-2z" />
        </svg>
      );
    case "stop":
      return (
        <svg {...props}>
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      );
    case "copy":
      return (
        <svg {...props}>
          <rect x="8" y="8" width="12" height="12" rx="2" />
          <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...props}>
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          <path d="M3 21v-5h5" />
        </svg>
      );
    case "edit":
      return (
        <svg {...props}>
          <path d="M14.06 4.94a2.5 2.5 0 0 1 3.54 3.54L7.5 18.6 3 20l1.4-4.5 9.66-10.56z" />
        </svg>
      );
    case "paperclip":
      return (
        <svg {...props}>
          <path d="M21.44 11.05L12.25 20.24a6 6 0 1 1-8.49-8.49l9.19-9.19a4 4 0 1 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
      );
    case "x":
      return (
        <svg {...props}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...props}>
          <path d="M9 6l6 6-6 6" />
        </svg>
      );
    case "database":
      return (
        <svg {...props}>
          <ellipse cx="12" cy="5" rx="8" ry="2.5" />
          <path d="M4 5v6c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5V5" />
          <path d="M4 11v6c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-6" />
        </svg>
      );
    case "document":
      return (
        <svg {...props}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
        </svg>
      );
    case "image":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="M21 16l-5-5-9 9" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="M5 12l5 5L20 7" />
        </svg>
      );
    case "alert":
      return (
        <svg {...props}>
          <path d="M12 4l10 18H2L12 4z" />
          <path d="M12 10v4" />
          <circle cx="12" cy="18" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case "sun":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
        </svg>
      );
    case "moon":
      return (
        <svg {...props}>
          <path d="M21 13.5A9 9 0 1 1 10.5 3a7 7 0 0 0 10.5 10.5z" />
        </svg>
      );
    case "pipeline":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="6" height="6" rx="1" />
          <rect x="15" y="4" width="6" height="6" rx="1" />
          <rect x="3" y="14" width="6" height="6" rx="1" />
          <rect x="15" y="14" width="6" height="6" rx="1" />
          <path d="M9 7h6M9 17h6M6 10v4M18 10v4" />
        </svg>
      );
    case "chart":
      return (
        <svg {...props}>
          <path d="M3 3v18h18" />
          <path d="M7 15l4-5 3 3 5-7" />
        </svg>
      );
    case "gauge":
      return (
        <svg {...props}>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 13l4-3" />
          <path d="M8 5l1 2M16 5l-1 2" />
        </svg>
      );
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 3l8 3v6c0 5-3.6 9-8 10-4.4-1-8-5-8-10V6z" />
        </svg>
      );
    case "globe":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "external":
      return (
        <svg {...props}>
          <path d="M14 4h6v6M20 4l-9 9M5 7v12h12V12" />
        </svg>
      );
    default:
      return null;
  }
};

// ── Attachments ──────────────────────────────────────────────────────────────
const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);
const MAX_PER_FILE_BYTES = 10 * 1024 * 1024;
const MAX_PER_MSG_BYTES = 25 * 1024 * 1024;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const url = String(reader.result || "");
      const comma = url.indexOf(",");
      resolve(comma >= 0 ? url.slice(comma + 1) : url);
    };
    reader.readAsDataURL(file);
  });
}

function validateFiles(fileList, existing) {
  const accepted = [];
  const errors = [];
  let totalBytes = (existing || []).reduce((s, a) => s + (a.size || 0), 0);
  for (const f of Array.from(fileList || [])) {
    if (!ALLOWED_FILE_TYPES.has(f.type)) {
      errors.push(`"${f.name}" — unsupported type (${f.type || "unknown"}). Allowed: PDF, PNG, JPG, WebP, GIF.`);
      continue;
    }
    if (f.size > MAX_PER_FILE_BYTES) {
      errors.push(`"${f.name}" — ${(f.size / 1024 / 1024).toFixed(1)} MB exceeds the 10 MB per-file cap.`);
      continue;
    }
    if (totalBytes + f.size > MAX_PER_MSG_BYTES) {
      errors.push(`"${f.name}" — would exceed the 25 MB per-message total.`);
      continue;
    }
    totalBytes += f.size;
    accepted.push(f);
  }
  return { accepted, errors };
}

// ── Stream-state reducer ─────────────────────────────────────────────────────
const initialState = { messages: [], activeId: null, busy: false, status: "", error: "" };

function updateActive(state, fn) {
  return { ...state, messages: state.messages.map((m) => (m.id === state.activeId ? fn(m) : m)) };
}

function reducer(state, action) {
  switch (action.type) {
    case "ASK": {
      const user = { id: uid(), role: "user", content: action.question, attachments: action.attachments || [] };
      const assistant = { id: uid(), role: "assistant", content: "", queries: [], searches: [], meta: null };
      return {
        ...state,
        messages: [...state.messages, user, assistant],
        activeId: assistant.id,
        busy: true,
        status: "thinking",
        error: "",
      };
    }
    case "TEXT":
      return updateActive(state, (m) => ({ ...m, content: m.content + action.text }));
    case "TOOL_USE":
      return updateActive(state, (m) => ({
        ...m,
        queries: [...m.queries, { id: action.id, sql: action.sql, purpose: action.purpose, result: null }],
      }));
    case "TOOL_RESULT":
      return updateActive(state, (m) => ({
        ...m,
        queries: m.queries.map((q) => (q.id === action.id ? { ...q, result: action.result } : q)),
      }));
    case "WEB_SEARCH":
      return updateActive(state, (m) => ({
        ...m,
        searches: [...(m.searches || []), { id: action.id, query: action.query, results: action.results }],
      }));
    case "STATUS":
      return { ...state, status: action.text };
    case "DONE": {
      const meta = action.meta;
      return {
        ...state,
        busy: false,
        status: "",
        activeId: null,
        messages: meta
          ? state.messages.map((m) => (m.id === state.activeId ? { ...m, meta } : m))
          : state.messages,
      };
    }
    case "ERROR":
      return { ...state, error: action.message, busy: false, status: "" };
    case "ABORTED":
      return updateActive(state, (m) => ({
        ...m,
        content: m.content + (m.content ? "\n\n_(Stopped.)_" : "_(Stopped.)_"),
      }));
    case "RESET_ERROR":
      return { ...state, error: "" };
    default:
      return state;
  }
}

// ── Hook: useAskStream ───────────────────────────────────────────────────────
function useAskStream() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const abortRef = useRef(null);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const applyEvent = useCallback((ev) => {
    switch (ev.type) {
      case "status":
        dispatch({ type: "STATUS", text: ev.text || "" });
        break;
      case "text":
        if (ev.text) dispatch({ type: "TEXT", text: ev.text });
        break;
      case "tool_use":
        dispatch({ type: "TOOL_USE", id: ev.id || `q-${Math.random().toString(36).slice(2, 7)}`, sql: ev.sql || "", purpose: ev.purpose || "" });
        break;
      case "tool_result": {
        const id = ev.id;
        const result = ev.error
          ? { error: ev.error }
          : { columns: ev.columns || [], rows: ev.rows || [], rowCount: ev.rowCount ?? null, bytesProcessed: ev.bytesProcessed || 0, truncated: !!ev.truncated };
        if (id) dispatch({ type: "TOOL_RESULT", id, result });
        break;
      }
      case "web_search":
        dispatch({
          type: "WEB_SEARCH",
          id: ev.id || `s-${Math.random().toString(36).slice(2, 7)}`,
          query: ev.query || "",
          results: Array.isArray(ev.results) ? ev.results : [],
        });
        break;
      case "done":
        dispatch({
          type: "DONE",
          meta: { model: ev.model, queriesRun: ev.queriesRun, totalBytesProcessed: ev.totalBytesProcessed, aborted: ev.aborted, completedAt: Date.now() },
        });
        break;
      case "error":
        dispatch({ type: "ERROR", message: ev.message || "The assistant failed." });
        break;
      default:
        break;
    }
  }, []);

  const ask = useCallback(
    async (question, attachments) => {
      const trimmed = String(question || "").trim();
      if (!trimmed || stateRef.current.busy) return;
      const turnAttachments = Array.isArray(attachments) ? attachments : [];

      const buildApiMessage = (m) => {
        const text = String(m.content || "");
        if (m.attachments && m.attachments.length) {
          return {
            role: m.role,
            content: [
              ...m.attachments.map((a) =>
                a.mediaType === "application/pdf"
                  ? { type: "document", source: { type: "base64", media_type: a.mediaType, data: a.data } }
                  : { type: "image", source: { type: "base64", media_type: a.mediaType, data: a.data } }
              ),
              { type: "text", text },
            ],
          };
        }
        return { role: m.role, content: text };
      };

      const history = [
        ...stateRef.current.messages
          .filter((m) => (m.content || "").trim() || (m.attachments && m.attachments.length))
          .map(buildApiMessage),
        buildApiMessage({ role: "user", content: trimmed, attachments: turnAttachments }),
      ];

      const controller = new AbortController();
      abortRef.current = controller;
      dispatch({ type: "ASK", question: trimmed, attachments: turnAttachments });

      let reader = null;
      try {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error || `Request failed (${res.status}).`);
        }
        reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop();
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              applyEvent(JSON.parse(line));
            } catch {
              /* ignore malformed line — keep streaming */
            }
          }
        }
      } catch (e) {
        if (e.name === "AbortError" || controller.signal.aborted) {
          dispatch({ type: "ABORTED" });
          dispatch({ type: "DONE", meta: null });
        } else {
          dispatch({ type: "ERROR", message: e.message || "Something went wrong." });
        }
      } finally {
        if (reader) {
          try { await reader.cancel(); } catch { /* already closed */ }
        }
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [applyEvent],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const retryLast = useCallback(() => {
    const msgs = stateRef.current.messages;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "user") return ask(msgs[i].content);
    }
  }, [ask]);

  const dismissError = useCallback(() => dispatch({ type: "RESET_ERROR" }), []);

  return { ...state, ask, stop, retryLast, dismissError };
}

// ── Theme handling ───────────────────────────────────────────────────────────
function useTheme() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    if (typeof document === "undefined") return;
    const stored = (typeof localStorage !== "undefined" && localStorage.getItem(THEME_KEY)) || null;
    const initial = stored === "light" || stored === "dark" ? stored : document.documentElement.getAttribute("data-theme") || "dark";
    document.documentElement.setAttribute("data-theme", initial);
    setTheme(initial);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return [theme, toggle];
}

// ── Cell-type-aware formatting ───────────────────────────────────────────────
// Inferred from BOTH the column name (heuristic) AND the value type. Result tables
// look polished only when numbers are right-aligned + tabular-nums, currencies are
// dollar-formatted, percentages have the unit, dates are human-readable, nulls are
// muted, and booleans are pills. Keep this fast — runs per cell on every render.
const CURRENCY_HINTS = /(price|cost|revenue|profit|amount|value|sale|budget|loan|wip|exposure|margin_dollars|cogs|payment|invoice|spend|fee|credit|debit|balance)/i;
const PERCENT_HINTS = /(pct|percent|%|rate|margin(?!_dollars)|ratio|share)/i;
const COUNT_HINTS = /(count|num_|n_|qty|quantity)/i;
const DATE_COL_HINTS = /(date|_at|_on|timestamp|time)/i;

function isISODateLike(v) {
  if (typeof v !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}(T|\s)?/.test(v);
}

function fmtCurrency(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return String(n);
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e4) return `${sign}$${Math.round(abs).toLocaleString()}`;
  return `${sign}$${abs.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function fmtPercent(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return String(n);
  // Heuristic: values in the abs > 1 range are already-percent (e.g. 12.5 -> 12.5%);
  // values in [-1, 1] are fractions (0.125 -> 12.5%).
  const display = Math.abs(v) <= 1.5 ? v * 100 : v;
  return `${display.toFixed(2)}%`;
}

function fmtNumber(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return String(n);
  if (Number.isInteger(v) && Math.abs(v) < 1e6) return v.toLocaleString();
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function fmtDate(v) {
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    const iso = String(v);
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
    }
    return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  } catch {
    return String(v);
  }
}

// Returns { display, className } for a cell. className drives alignment + color.
function formatTypedCell(value, column) {
  if (value === null || value === undefined || value === "") {
    return { display: "—", className: "ask-cell ask-cell--null" };
  }
  if (typeof value === "boolean") {
    return {
      display: value ? "Yes" : "No",
      className: `ask-cell ask-cell--bool ${value ? "ask-cell--bool-yes" : "ask-cell--bool-no"}`,
    };
  }
  if (typeof value === "object") {
    return { display: JSON.stringify(value), className: "ask-cell ask-cell--json" };
  }

  const colLower = String(column || "").toLowerCase();

  if (DATE_COL_HINTS.test(colLower) || isISODateLike(value)) {
    return { display: fmtDate(value), className: "ask-cell ask-cell--date" };
  }

  const asNum = typeof value === "number" ? value : Number(value);
  if (Number.isFinite(asNum) && (typeof value === "number" || /^-?\d+(\.\d+)?$/.test(String(value).trim()))) {
    if (PERCENT_HINTS.test(colLower) && !CURRENCY_HINTS.test(colLower)) {
      return { display: fmtPercent(asNum), className: `ask-cell ask-cell--num ask-cell--pct ${asNum < 0 ? "ask-cell--neg" : ""}` };
    }
    if (CURRENCY_HINTS.test(colLower)) {
      return { display: fmtCurrency(asNum), className: `ask-cell ask-cell--num ask-cell--currency ${asNum < 0 ? "ask-cell--neg" : ""}` };
    }
    if (COUNT_HINTS.test(colLower) || Number.isInteger(asNum)) {
      return { display: fmtNumber(asNum), className: "ask-cell ask-cell--num ask-cell--count" };
    }
    return { display: fmtNumber(asNum), className: `ask-cell ask-cell--num ${asNum < 0 ? "ask-cell--neg" : ""}` };
  }

  return { display: String(value), className: "ask-cell ask-cell--text" };
}

function rawCellText(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

// ── Markdown renderer ────────────────────────────────────────────────────────
// Recursively extract plain text from a React children tree — used so that a
// markdown <td> that ends up ellipsized still surfaces its full content via the
// title attribute (same UX as our SQL-result tables).
function childrenToString(node) {
  if (node == null || node === false) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(childrenToString).join("");
  if (node.props && node.props.children) return childrenToString(node.props.children);
  return "";
}

const markdownComponents = {
  table: (props) => (
    <div className="ask-result-wrap">
      <div className="ask-result-scroll">
        <table {...props} />
      </div>
    </div>
  ),
  th: (props) => <th scope="col" {...props} />,
  td: ({ children, ...rest }) => (
    <td title={childrenToString(children)} {...rest}>
      {children}
    </td>
  ),
};

const Markdown = ({ children }) => (
  <div className="ask-md">
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {children}
    </ReactMarkdown>
  </div>
);

// ── Sub-components ───────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="ask-skeleton" aria-hidden="true">
      <div className="ask-skeleton-line" />
      <div className="ask-skeleton-line" />
      <div className="ask-skeleton-line" />
    </div>
  );
}

// Multi-step status indicator. We render three steps with the active one
// highlighted — gives the user clear feedback on what is happening.
const STATUS_STEPS = [
  { key: "thinking", label: "Thinking", match: ["thinking", "planning", "reasoning"] },
  { key: "querying", label: "Querying", match: ["running query", "querying", "running sql", "tool"] },
  { key: "writing", label: "Writing", match: ["writing answer", "writing", "streaming"] },
];

function StatusPill({ text }) {
  if (!text) return null;
  const lower = String(text).toLowerCase();
  const activeIdx = STATUS_STEPS.findIndex((s) => s.match.some((m) => lower.includes(m)));
  const idx = activeIdx === -1 ? 0 : activeIdx;
  return (
    <span className="ask-status" role="status" aria-live="polite">
      <span className="ask-status-dots" aria-hidden="true">
        {STATUS_STEPS.map((s, i) => (
          <span
            key={s.key}
            className={`ask-status-dot${i === idx ? " is-active" : ""}${i < idx ? " is-done" : ""}`}
          />
        ))}
      </span>
      <span className="ask-status-label">{STATUS_STEPS[idx].label}</span>
    </span>
  );
}

function ResultTable({ result }) {
  const { columns = [], rows = [], rowCount, truncated, bytesProcessed } = result || {};

  const copyTsv = useCallback(() => {
    const header = columns.join("\t");
    const lines = rows.map((r) => columns.map((c) => rawCellText(r[c])).join("\t"));
    try { navigator.clipboard?.writeText([header, ...lines].join("\n")); } catch { /* ignore */ }
  }, [columns, rows]);

  if (!rows.length) {
    return <div className="ask-result-empty">No rows returned.</div>;
  }

  const colAlignment = columns.map((c) => formatTypedCell(rows[0]?.[c], c).className);

  return (
    <div className="ask-result-wrap">
      <div className="ask-result-scroll" role="region" aria-label="Query result rows" tabIndex={0}>
        <table className="ask-result-table">
          <caption className="sr-only">
            {`${rowCount ?? rows.length} row${rows.length === 1 ? "" : "s"}${truncated ? " (truncated)" : ""}`}
          </caption>
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th
                  key={c}
                  scope="col"
                  className={
                    colAlignment[i]?.includes("ask-cell--num")
                      ? "ask-th--num"
                      : ""
                  }
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {columns.map((c) => {
                  const { display, className } = formatTypedCell(row[c], c);
                  return (
                    <td key={c} className={className} title={rawCellText(row[c])}>
                      {display}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ask-result-foot">
        <span className="ask-result-foot-stats">
          <span className="ask-result-rowcount">
            {rows.length.toLocaleString()} row{rows.length === 1 ? "" : "s"}
          </span>
          {truncated ? <span className="ask-result-tag">truncated</span> : null}
          {Number(bytesProcessed) > 0 ? (
            <span className="ask-result-bytes">{formatBytes(bytesProcessed)} scanned</span>
          ) : null}
        </span>
        <button
          type="button"
          className="ask-result-copy"
          onClick={copyTsv}
          aria-label="Copy rows as TSV"
        >
          <Icon name="copy" size={13} />
          <span>Copy</span>
        </button>
      </div>
    </div>
  );
}

// SQL syntax highlighter — keyword + string + number + comment. No external
// dependency. Returns React spans so we can colorize without arbitrary HTML.
function highlightSql(sql) {
  if (!sql) return null;
  const lines = sql.split("\n");
  return (
    <code className="ask-sql-code">
      {lines.map((line, li) => {
        const commentIdx = line.indexOf("--");
        const codePart = commentIdx === -1 ? line : line.slice(0, commentIdx);
        const commentPart = commentIdx === -1 ? "" : line.slice(commentIdx);

        // Strings (double + single quoted)
        const stringRe = /('([^']|'')*'|"([^"\\]|\\.)*")/g;
        let codeCursor = 0;
        let m;
        const codePartSpans = [];
        while ((m = stringRe.exec(codePart)) !== null) {
          if (m.index > codeCursor) codePartSpans.push({ text: codePart.slice(codeCursor, m.index), kind: "code" });
          codePartSpans.push({ text: m[0], kind: "string" });
          codeCursor = m.index + m[0].length;
        }
        if (codeCursor < codePart.length) codePartSpans.push({ text: codePart.slice(codeCursor), kind: "code" });

        // Keywords + numbers inside code spans
        const finalSpans = [];
        for (const span of codePartSpans) {
          if (span.kind === "string") {
            finalSpans.push(<span key={`${li}-s-${finalSpans.length}`} className="ask-sql-string">{span.text}</span>);
            continue;
          }
          let kwCursor = 0;
          const text = span.text;
          const combined = /\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|LIMIT|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|FULL JOIN|ON|AS|WITH|HAVING|UNION|UNION ALL|INTERSECT|EXCEPT|CASE|WHEN|THEN|ELSE|END|AND|OR|NOT|IN|IS|NULL|LIKE|BETWEEN|EXISTS|DISTINCT|DESC|ASC|COUNT|SUM|AVG|MIN|MAX|COALESCE|IFNULL|SAFE_DIVIDE|CAST|DATE|TIMESTAMP|EXTRACT|CURRENT_DATE|DATE_DIFF|DATE_ADD|DATE_SUB|FORMAT_DATE|PARSE_DATE|STRUCT|ARRAY|UNNEST|PARTITION BY|OVER|ROWS|RANGE|PRECEDING|FOLLOWING|CURRENT ROW|QUALIFY|WINDOW|ROW_NUMBER|RANK|DENSE_RANK|LAG|LEAD|FIRST_VALUE|LAST_VALUE)\b|\b\d+(?:\.\d+)?\b/gi;
          let cm;
          while ((cm = combined.exec(text)) !== null) {
            if (cm.index > kwCursor) finalSpans.push(<span key={`${li}-t-${finalSpans.length}`}>{text.slice(kwCursor, cm.index)}</span>);
            const isKeyword = /^[A-Za-z]/.test(cm[0]);
            finalSpans.push(
              <span
                key={`${li}-k-${finalSpans.length}`}
                className={isKeyword ? "ask-sql-keyword" : "ask-sql-number"}
              >
                {cm[0]}
              </span>
            );
            kwCursor = cm.index + cm[0].length;
          }
          if (kwCursor < text.length) finalSpans.push(<span key={`${li}-r-${finalSpans.length}`}>{text.slice(kwCursor)}</span>);
        }

        return (
          <span key={li} className="ask-sql-line">
            {finalSpans}
            {commentPart ? <span className="ask-sql-comment">{commentPart}</span> : null}
            {li < lines.length - 1 ? "\n" : null}
          </span>
        );
      })}
    </code>
  );
}

function QueryBlock({ query, index, total }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    try {
      navigator.clipboard?.writeText(query.sql || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch { /* ignore */ }
  }, [query.sql]);

  return (
    <div className="ask-query">
      <div className="ask-query-head">
        <div className="ask-query-head-left">
          <span className="ask-query-tag">
            <Icon name="database" size={11} />
            SQL
          </span>
          <span className="ask-query-index">
            Query {index + 1} of {total}
          </span>
          {query.purpose ? (
            <span className="ask-query-purpose" title={query.purpose}>
              {query.purpose}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          className="ask-query-copy"
          onClick={copy}
          aria-label={copied ? "Copied SQL" : "Copy SQL"}
        >
          <Icon name={copied ? "check" : "copy"} size={12} />
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="ask-sql">{highlightSql(query.sql)}</pre>
      {query.result?.error ? (
        <div className="ask-query-error">
          <Icon name="alert" size={13} />
          <span>{query.result.error}</span>
        </div>
      ) : query.result ? (
        <ResultTable result={query.result} />
      ) : null}
    </div>
  );
}

function QueryDisclosure({ queries }) {
  if (!queries?.length) return null;
  const completed = queries.filter((q) => q.result).length;
  const totalRows = queries.reduce((s, q) => s + (q.result?.rows?.length || 0), 0);
  const totalBytes = queries.reduce((s, q) => s + (q.result?.bytesProcessed || 0), 0);
  return (
    <details className="ask-queries">
      <summary>
        <Icon name="chevron-right" size={12} className="ask-queries-chevron" />
        <span className="ask-queries-summary-text">
          <strong>{queries.length}</strong> quer{queries.length === 1 ? "y" : "ies"}
          {completed < queries.length ? ` · ${completed}/${queries.length} done` : ""}
        </span>
        <span className="ask-queries-summary-meta">
          {totalRows > 0 ? `${totalRows.toLocaleString()} rows` : ""}
          {totalRows > 0 && totalBytes > 0 ? " · " : ""}
          {totalBytes > 0 ? `${formatBytes(totalBytes)} scanned` : ""}
        </span>
      </summary>
      <div className="ask-queries-body">
        {queries.map((q, i) => (
          <QueryBlock key={q.id || i} query={q} index={i} total={queries.length} />
        ))}
      </div>
    </details>
  );
}

function WebSearchDisclosure({ searches }) {
  if (!searches?.length) return null;
  const totalResults = searches.reduce((s, x) => s + (x.results?.length || 0), 0);
  return (
    <details className="ask-queries ask-searches">
      <summary>
        <Icon name="chevron-right" size={12} className="ask-queries-chevron" />
        <span className="ask-queries-summary-text">
          <strong>{searches.length}</strong> web search{searches.length === 1 ? "" : "es"}
        </span>
        <span className="ask-queries-summary-meta">
          {totalResults > 0 ? `${totalResults} result${totalResults === 1 ? "" : "s"}` : ""}
        </span>
      </summary>
      <div className="ask-queries-body">
        {searches.map((s, i) => (
          <div className="ask-search" key={s.id || i}>
            <div className="ask-query-head">
              <div className="ask-query-head-left">
                <span className="ask-query-tag ask-query-tag--web">
                  <Icon name="globe" size={11} />
                  Web
                </span>
                <span className="ask-query-index">Search {i + 1} of {searches.length}</span>
                <span className="ask-query-purpose" title={s.query}>
                  "{s.query}"
                </span>
              </div>
            </div>
            {s.results?.length ? (
              <ul className="ask-search-results">
                {s.results.map((r, ri) => (
                  <li className="ask-search-result" key={ri}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="ask-search-result-link">
                      <span className="ask-search-result-title">{r.title}</span>
                      <Icon name="external" size={11} className="ask-search-result-icon" />
                    </a>
                    <span className="ask-search-result-url">{(() => {
                      try { return new URL(r.url).hostname.replace(/^www\./, ""); }
                      catch { return r.url; }
                    })()}{r.page_age ? ` · ${r.page_age}` : ""}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="ask-result-empty">No results.</div>
            )}
          </div>
        ))}
      </div>
    </details>
  );
}

function MetaLine({ meta }) {
  if (!meta) return null;
  const time = meta.completedAt
    ? new Date(meta.completedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : null;
  const parts = [];
  if (time) parts.push({ key: "time", text: time });
  if (meta.queriesRun != null) parts.push({ key: "queries", text: `${meta.queriesRun} quer${meta.queriesRun === 1 ? "y" : "ies"}` });
  if (meta.totalBytesProcessed > 0) parts.push({ key: "bytes", text: `${formatBytes(meta.totalBytesProcessed)} scanned` });
  if (meta.model) parts.push({ key: "model", text: meta.model });
  if (meta.aborted) parts.push({ key: "aborted", text: "stopped", tone: "warning" });
  return (
    <div className="ask-meta">
      {parts.map((p, i) => (
        <span key={p.key} className={`ask-meta-item${p.tone ? ` ask-meta-item--${p.tone}` : ""}`}>
          {i > 0 ? <span className="ask-meta-sep" aria-hidden="true">·</span> : null}
          {p.text}
        </span>
      ))}
    </div>
  );
}

function Avatar({ kind }) {
  if (kind === "user") {
    return (
      <span className="ask-avatar ask-avatar--user" aria-hidden="true">
        You
      </span>
    );
  }
  return (
    <span className="ask-avatar ask-avatar--bot" aria-hidden="true">
      <Icon name="sparkles" size={14} />
    </span>
  );
}

function AssistantTurn({ msg, isActive, status, onCopy, onRegenerate }) {
  const showSkeleton = isActive && !msg.content && !(msg.queries?.length) && !(msg.searches?.length);
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    onCopy(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }, [msg.content, onCopy]);

  return (
    <article
      className={`ask-turn ask-turn--assistant${isActive ? " is-active" : ""}`}
      aria-busy={isActive ? "true" : undefined}
    >
      <div className="ask-turn-head">
        <div className="ask-turn-head-left">
          <Avatar kind="bot" />
          <span className="ask-turn-label">Brite AI</span>
        </div>
        {isActive && status ? <StatusPill text={status} /> : null}
      </div>
      <div className="ask-turn-content">
        {showSkeleton ? (
          <Skeleton />
        ) : msg.content ? (
          <Markdown>{msg.content}</Markdown>
        ) : isActive ? (
          <Skeleton />
        ) : (
          <span style={{ color: "var(--text-muted)" }}>(no answer)</span>
        )}
        <WebSearchDisclosure searches={msg.searches} />
        <QueryDisclosure queries={msg.queries} />
        <MetaLine meta={msg.meta} />
        {!isActive && msg.content ? (
          <div className="ask-toolbar">
            <button
              type="button"
              className="ask-tool-btn"
              onClick={handleCopy}
              aria-label="Copy answer"
            >
              <Icon name={copied ? "check" : "copy"} size={13} />
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              type="button"
              className="ask-tool-btn"
              onClick={onRegenerate}
              aria-label="Regenerate the answer"
            >
              <Icon name="refresh" size={13} />
              <span>Regenerate</span>
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function UserTurn({ msg, onEdit }) {
  const atts = msg.attachments || [];
  return (
    <article className="ask-turn ask-turn--user">
      <div className="ask-turn-head">
        <Avatar kind="user" />
      </div>
      <div className="ask-turn-content">
        <div className="ask-turn-text">{msg.content}</div>
        {atts.length > 0 ? (
          <div className="ask-attach-row" aria-label={`${atts.length} attached file${atts.length === 1 ? "" : "s"}`}>
            {atts.map((a) => (
              <span
                key={a.id}
                className="ask-attach-chip ask-attach-chip--readonly"
                title={`${a.name} · ${formatBytes(a.size)}`}
              >
                <Icon name={a.mediaType?.startsWith("image/") ? "image" : "document"} size={12} />
                <span className="ask-attach-name">{a.name}</span>
              </span>
            ))}
          </div>
        ) : null}
        <div className="ask-toolbar">
          <button
            type="button"
            className="ask-tool-btn"
            onClick={() => onEdit(msg.content)}
            aria-label="Reuse this question"
          >
            <Icon name="edit" size={13} />
            <span>Reuse</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ onPick, disabled }) {
  return (
    <div className="ask-empty">
      <div className="ask-empty-glyph" aria-hidden="true">
        <Icon name="sparkles" size={28} />
      </div>
      <h2>Ask anything about your warehouse</h2>
      <p>
        Brite AI writes and runs its own read-only SQL on the BigQuery marts and shows its work.
        Numbers come from the same data the dashboard uses.
      </p>
      <div className="ask-suggestion-groups">
        {SUGGESTION_CATEGORIES.map((cat) => (
          <div key={cat.label} className="ask-suggestion-group">
            <div className="ask-suggestion-group-head">
              <span className="ask-suggestion-group-icon" aria-hidden="true">
                <Icon name={cat.icon} size={12} />
              </span>
              <span className="ask-suggestion-group-label">{cat.label}</span>
            </div>
            <div className="ask-suggestion-list">
              {cat.items.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="ask-suggestion"
                  onClick={() => onPick(s)}
                  disabled={disabled}
                >
                  <span className="ask-suggestion-text">{s}</span>
                  <Icon name="chevron-right" size={12} className="ask-suggestion-arrow" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorPanel({ message, onRetry, onDismiss }) {
  if (!message) return null;
  return (
    <div className="ask-error" role="alert">
      <span className="ask-error-icon" aria-hidden="true">
        <Icon name="alert" size={14} />
      </span>
      <span className="ask-error-text">{message}</span>
      <div className="ask-error-actions">
        <button type="button" onClick={onRetry}>Retry</button>
        <button type="button" onClick={onDismiss} aria-label="Dismiss error">
          <Icon name="x" size={12} />
        </button>
      </div>
    </div>
  );
}

// ── Autoscroll hook ──────────────────────────────────────────────────────────
function useAutoscroll(scrollRef, dep) {
  const [pinnedUp, setPinnedUp] = useState(false);
  const pinnedRef = useRef(pinnedUp);
  pinnedRef.current = pinnedUp;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      setPinnedUp(distance > 120);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || pinnedRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [dep, scrollRef]);

  const jumpToLatest = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setPinnedUp(false);
  }, [scrollRef]);

  return { pinnedUp, jumpToLatest };
}

// ── Composer ─────────────────────────────────────────────────────────────────
function Composer({ busy, onAsk, onStop, draft, setDraft, attachments, onAddFiles, onRemoveAttachment, attachError, dismissAttachError }) {
  const textRef = useRef(null);
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [draft]);

  const submit = useCallback(
    (e) => {
      e?.preventDefault();
      if (busy || !draft.trim()) return;
      onAsk(draft.trim());
      setDraft("");
    },
    [busy, draft, onAsk, setDraft],
  );

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        submit();
      } else if (e.key === "Escape" && busy) {
        e.preventDefault();
        onStop();
      }
    },
    [busy, submit, onStop],
  );

  const dragDepth = useRef(0);
  const onDragEnter = useCallback((e) => {
    if (!e.dataTransfer?.types?.includes("Files")) return;
    e.preventDefault();
    dragDepth.current += 1;
    setDragging(true);
  }, []);
  const onDragOver = useCallback((e) => {
    if (e.dataTransfer?.types?.includes("Files")) e.preventDefault();
  }, []);
  const onDragLeave = useCallback(() => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  }, []);
  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      if (e.dataTransfer?.files?.length) onAddFiles(e.dataTransfer.files);
    },
    [onAddFiles],
  );

  const atts = attachments || [];
  const canSubmit = !busy && draft.trim().length > 0;

  return (
    <form
      className={`ask-composer${dragging ? " is-dragging" : ""}${busy ? " is-busy" : ""}`}
      onSubmit={submit}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        ref={fileRef}
        type="file"
        className="sr-only"
        accept="application/pdf,image/png,image/jpeg,image/webp,image/gif"
        multiple
        onChange={(e) => {
          if (e.target.files?.length) onAddFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="ask-composer-body">
        {atts.length > 0 ? (
          <div className="ask-attach-row ask-attach-row--composer" aria-label="Attachments to send with your question">
            {atts.map((a) => (
              <div key={a.id} className="ask-attach-chip" title={`${a.name} · ${formatBytes(a.size)}`}>
                <Icon name={a.mediaType?.startsWith("image/") ? "image" : "document"} size={12} />
                <span className="ask-attach-name">{a.name}</span>
                <span className="ask-attach-size">{formatBytes(a.size)}</span>
                <button
                  type="button"
                  className="ask-attach-remove"
                  onClick={() => onRemoveAttachment(a.id)}
                  aria-label={`Remove ${a.name}`}
                >
                  <Icon name="x" size={11} />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        {attachError ? (
          <div className="ask-attach-error" role="alert">
            <Icon name="alert" size={13} />
            <span style={{ whiteSpace: "pre-line", flex: 1 }}>{attachError}</span>
            <button type="button" onClick={dismissAttachError} aria-label="Dismiss attachment error">
              <Icon name="x" size={12} />
            </button>
          </div>
        ) : null}

        <label htmlFor="ask-input" className="sr-only">
          Ask a question about the warehouse
        </label>
        <textarea
          id="ask-input"
          ref={textRef}
          className="ask-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            atts.length
              ? "Add a question about your attached files…"
              : "Ask about jobs, delays, sales, PM, loans, margins, exceptions…"
          }
          rows={1}
        />

        <div className="ask-composer-actions">
          <button
            type="button"
            className="ask-icon-btn"
            onClick={() => fileRef.current?.click()}
            aria-label="Attach a PDF or image"
            title="Attach a PDF or image · 10 MB each · 25 MB total"
            disabled={busy}
          >
            <Icon name="paperclip" size={16} />
          </button>
          <div className="ask-composer-spacer" />
          <span className="ask-kbd-hint" aria-hidden="true">
            <kbd className="ask-kbd">Enter</kbd> to send · <kbd className="ask-kbd">⇧</kbd>+<kbd className="ask-kbd">Enter</kbd> for newline
          </span>
          {busy ? (
            <button
              type="button"
              className="ask-btn ask-btn--stop"
              onClick={onStop}
              aria-label="Stop the answer"
            >
              <Icon name="stop" size={14} />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              className="ask-btn"
              disabled={!canSubmit}
              aria-label="Send question"
            >
              <span>Ask</span>
              <Icon name="send" size={14} />
            </button>
          )}
        </div>

        {dragging ? (
          <div className="ask-drop-overlay" aria-hidden="true">
            <Icon name="paperclip" size={18} />
            <span>Drop files to attach</span>
          </div>
        ) : null}
      </div>
    </form>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatBytes(n) {
  const num = Number(n) || 0;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)} GB`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)} MB`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)} KB`;
  return `${num} B`;
}

// ── Main component ──────────────────────────────────────────────────────────
export default function AskConsole() {
  const stream = useAskStream();
  const { messages, activeId, busy, status, error, ask, stop, retryLast, dismissError } = stream;
  const [draft, setDraft] = useState("");
  const [theme, toggleTheme] = useTheme();
  const [attachments, setAttachments] = useState([]);
  const [attachError, setAttachError] = useState("");

  const addFiles = useCallback(
    async (fileList) => {
      const { accepted, errors } = validateFiles(fileList, attachments);
      if (errors.length) setAttachError(errors.join("\n"));
      if (!accepted.length) return;
      try {
        const newOnes = await Promise.all(
          accepted.map(async (f) => ({
            id: uid(),
            name: f.name,
            size: f.size,
            mediaType: f.type === "image/jpg" ? "image/jpeg" : f.type,
            data: await fileToBase64(f),
          })),
        );
        setAttachments((cur) => [...cur, ...newOnes]);
        if (!errors.length) setAttachError("");
      } catch (e) {
        setAttachError(`Could not read a file: ${e?.message || e}`);
      }
    },
    [attachments],
  );

  const removeAttachment = useCallback((id) => setAttachments((cur) => cur.filter((a) => a.id !== id)), []);
  const dismissAttachError = useCallback(() => setAttachError(""), []);

  const handleAsk = useCallback(
    (q) => {
      ask(q, attachments);
      setAttachments([]);
      setAttachError("");
    },
    [ask, attachments],
  );

  const scrollRef = useRef(null);
  const scrollKey = useMemo(
    () =>
      messages.reduce(
        (k, m) =>
          `${k}|${m.id}:${(m.content || "").length}:${m.queries?.length || 0}:${(m.queries || []).map((q) => (q.result ? 1 : 0)).join("")}:s${m.searches?.length || 0}`,
        "",
      ),
    [messages],
  );
  const { pinnedUp, jumpToLatest } = useAutoscroll(scrollRef, scrollKey + status + (busy ? "1" : "0"));

  const copy = useCallback((text) => {
    try { navigator.clipboard?.writeText(text); } catch { /* ignore */ }
  }, []);

  const editPrior = useCallback((content) => {
    setDraft(content);
  }, []);

  return (
    <div className="ask-shell">
      <header className="ask-header">
        <div className="ask-brand">
          <span className="ask-brand-mark" aria-hidden="true">
            <Icon name="sparkles" size={14} />
          </span>
          <div className="ask-brand-text">
            <h1>Brite AI</h1>
            <div className="ask-subtitle">Natural-language analyst for the BigQuery warehouse</div>
          </div>
        </div>
        <div className="ask-header-spacer" />
        <span className="ask-chip-live" aria-label="Live data">
          <span className="ask-chip-live-dot" aria-hidden="true" />
          Live
        </span>
        <button
          type="button"
          className="ask-icon-btn ask-icon-btn--header"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Theme: ${theme}`}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} size={15} />
        </button>
      </header>

      <div className="ask-scroll" ref={scrollRef}>
        <div className="ask-thread" role="log" aria-live="polite" aria-relevant="additions text" aria-atomic="false">
          {messages.length === 0 ? (
            <EmptyState onPick={ask} disabled={busy} />
          ) : (
            messages.map((m) =>
              m.role === "user" ? (
                <UserTurn key={m.id} msg={m} onEdit={editPrior} />
              ) : (
                <AssistantTurn
                  key={m.id}
                  msg={m}
                  isActive={m.id === activeId}
                  status={status}
                  onCopy={copy}
                  onRegenerate={retryLast}
                />
              ),
            )
          )}

          {error ? <ErrorPanel message={error} onRetry={retryLast} onDismiss={dismissError} /> : null}
        </div>
      </div>

      <div className="ask-composer-wrap">
        {pinnedUp && messages.length > 0 ? (
          <button
            type="button"
            className="ask-jump"
            onClick={jumpToLatest}
            aria-label="Jump to latest"
          >
            Jump to latest
            <Icon name="chevron-right" size={12} className="ask-jump-arrow" />
          </button>
        ) : null}
        <Composer
          busy={busy}
          status={status}
          onAsk={handleAsk}
          onStop={stop}
          draft={draft}
          setDraft={setDraft}
          attachments={attachments}
          onAddFiles={addFiles}
          onRemoveAttachment={removeAttachment}
          attachError={attachError}
          dismissAttachError={dismissAttachError}
        />
        <div className="ask-foot-hint" aria-hidden="true">
          <Icon name="shield" size={11} />
          <span>Read-only · capped at 8 queries / 6 GB per question</span>
          {busy ? (
            <>
              <span className="ask-foot-sep">·</span>
              <span>
                <kbd className="ask-kbd">Esc</kbd> to stop
              </span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
