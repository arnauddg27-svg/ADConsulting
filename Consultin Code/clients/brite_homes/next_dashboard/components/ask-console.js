"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ── Constants ────────────────────────────────────────────────────────────────
const THEME_KEY = "adh-theme";
const SUGGESTIONS = [
  "Which jobs have been in their current stage the longest?",
  "What's our total WIP and loan exposure right now?",
  "Show CO homes that aren't closed yet, worst first.",
  "Average net margin by community for closed jobs.",
];

const uid = () => Math.random().toString(36).slice(2, 10);

// ── Attachments ──────────────────────────────────────────────────────────────
// Accept PDFs + common web images. Sizes match the server-side cap so the user gets a
// friendly client-side rejection instead of a 400 after a long upload.
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
// Messages have stable ids; the active assistant turn is tracked by id (no
// "find the last assistant message" scans). Query results match to their tool_use
// by the id forwarded by the server (no positional matching).
const initialState = { messages: [], activeId: null, busy: false, status: "", error: "" };

function updateActive(state, fn) {
  return { ...state, messages: state.messages.map((m) => (m.id === state.activeId ? fn(m) : m)) };
}

function reducer(state, action) {
  switch (action.type) {
    case "ASK": {
      const user = { id: uid(), role: "user", content: action.question, attachments: action.attachments || [] };
      const assistant = { id: uid(), role: "assistant", content: "", queries: [], meta: null };
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

      // Build an Anthropic-shaped message: string content when no attachments, otherwise an
      // array of typed content blocks ({image|document|text}). Past user turns may also have
      // attachments — we preserve them in history so the model can refer back across turns.
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

// ── Markdown renderer with token-aware classes ──────────────────────────────
const markdownComponents = {
  // Defer to the .ask-md CSS for styling; this just inserts the elements.
  table: (props) => (
    <div className="ask-result-wrap">
      <div className="ask-result-scroll">
        <table {...props} />
      </div>
    </div>
  ),
  th: (props) => <th scope="col" {...props} />,
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

function StatusPill({ text }) {
  if (!text) return null;
  const labels = { thinking: "Thinking", "writing answer": "Writing answer" };
  return (
    <span className="ask-status" role="status">
      <span className="ask-dot" />
      {labels[text] || text}
    </span>
  );
}

function ResultTable({ result }) {
  const { columns = [], rows = [], rowCount, truncated, bytesProcessed } = result || {};
  const copyTsv = useCallback(() => {
    const header = columns.join("\t");
    const lines = rows.map((r) => columns.map((c) => formatCell(r[c])).join("\t"));
    try { navigator.clipboard?.writeText([header, ...lines].join("\n")); } catch { /* ignore */ }
  }, [columns, rows]);

  if (!rows.length) {
    return <div className="ask-result-foot">No rows returned.</div>;
  }
  return (
    <div className="ask-result-wrap">
      <div className="ask-result-scroll" role="region" aria-label="Query result rows" tabIndex={0}>
        <table className="ask-result-table">
          <caption className="sr-only">{`${rowCount ?? rows.length} row${rows.length === 1 ? "" : "s"}${truncated ? " (truncated)" : ""}`}</caption>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c} scope="col">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {columns.map((c) => (
                  <td key={c}>{formatCell(row[c])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ask-result-foot">
        <span>
          {rows.length} row{rows.length === 1 ? "" : "s"}
          {truncated ? " (truncated)" : ""}
          {Number(bytesProcessed) > 0 ? ` · ${formatBytes(bytesProcessed)} scanned` : ""}
        </span>
        <button type="button" className="ask-result-copy" onClick={copyTsv} aria-label="Copy rows as TSV">
          Copy
        </button>
      </div>
    </div>
  );
}

function QueryDisclosure({ queries }) {
  if (!queries?.length) return null;
  return (
    <details className="ask-queries">
      <summary>Ran {queries.length} quer{queries.length === 1 ? "y" : "ies"} — view SQL</summary>
      {queries.map((q, i) => (
        <div className="ask-query" key={q.id || i}>
          {q.purpose ? <div className="ask-query-purpose">{q.purpose}</div> : null}
          <pre className="ask-sql">{q.sql}</pre>
          {q.result?.error ? (
            <div className="ask-query-error">Error: {q.result.error}</div>
          ) : q.result ? (
            <ResultTable result={q.result} />
          ) : null}
        </div>
      ))}
    </details>
  );
}

function MetaLine({ meta }) {
  if (!meta) return null;
  const time = meta.completedAt ? new Date(meta.completedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : null;
  return (
    <div className="ask-meta">
      {time ? <span>Answered {time}</span> : null}
      {time && meta.queriesRun != null ? <span className="ask-meta-dot">·</span> : null}
      {meta.queriesRun != null ? <span>{meta.queriesRun} quer{meta.queriesRun === 1 ? "y" : "ies"}</span> : null}
      {meta.queriesRun != null && meta.totalBytesProcessed > 0 ? <span className="ask-meta-dot">·</span> : null}
      {meta.totalBytesProcessed > 0 ? <span>{formatBytes(meta.totalBytesProcessed)} scanned</span> : null}
      {meta.model ? <span className="ask-meta-dot">·</span> : null}
      {meta.model ? <span>{meta.model}</span> : null}
      {meta.aborted ? <span className="ask-meta-dot">·</span> : null}
      {meta.aborted ? <span>stopped</span> : null}
    </div>
  );
}

function AssistantTurn({ msg, isActive, status, onCopy, onRegenerate }) {
  const showSkeleton = isActive && !msg.content && !(msg.queries?.length);
  return (
    <article className={`ask-turn ask-turn--assistant${isActive ? " ask-shine-card" : ""}`} aria-busy={isActive ? "true" : undefined}>
      <div className="ask-turn-head">
        <span className="ask-turn-label">Warehouse Analyst</span>
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
        <QueryDisclosure queries={msg.queries} />
        <MetaLine meta={msg.meta} />
        {!isActive && msg.content ? (
          <div className="ask-toolbar">
            <button type="button" className="ask-tool-btn" onClick={() => onCopy(msg.content)} aria-label="Copy answer">
              Copy answer
            </button>
            <button type="button" className="ask-tool-btn" onClick={onRegenerate} aria-label="Regenerate the answer">
              Regenerate
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
        <span className="ask-turn-label">You</span>
      </div>
      <div className="ask-turn-content">{msg.content}</div>
      {atts.length > 0 ? (
        <div className="ask-attach-row" aria-label={`${atts.length} attached file${atts.length === 1 ? "" : "s"}`}>
          {atts.map((a) => (
            <span key={a.id} className="ask-attach-chip ask-attach-chip--readonly" title={`${a.name} · ${formatBytes(a.size)}`}>
              <span className="ask-attach-icon" aria-hidden="true">{a.mediaType?.startsWith("image/") ? "🖼" : "📄"}</span>
              <span className="ask-attach-name">{a.name}</span>
            </span>
          ))}
        </div>
      ) : null}
      <div className="ask-toolbar">
        <button type="button" className="ask-tool-btn" onClick={() => onEdit(msg.content)} aria-label="Edit this question">
          Edit
        </button>
      </div>
    </article>
  );
}

function EmptyState({ onPick, disabled }) {
  return (
    <div className="ask-empty">
      <h2>Ask anything about your live warehouse</h2>
      <p>Claude writes and runs its own read-only SQL on the BigQuery marts and shows its work. Numbers come from the same data the dashboard uses.</p>
      <span className="ask-empty-label">Try one of these</span>
      <div className="ask-suggestions">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" className="ask-chip" onClick={() => onPick(s)} disabled={disabled}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function ErrorPanel({ message, onRetry, onDismiss }) {
  if (!message) return null;
  return (
    <div className="ask-error" role="alert">
      <span>{message}</span>
      <div className="ask-error-actions">
        <button type="button" onClick={onRetry}>Retry</button>
        <button type="button" onClick={onDismiss}>Dismiss</button>
      </div>
    </div>
  );
}

// ── Autoscroll hook ──────────────────────────────────────────────────────────
function useAutoscroll(scrollRef, dep) {
  const [pinnedUp, setPinnedUp] = useState(false);
  const pinnedRef = useRef(pinnedUp);
  pinnedRef.current = pinnedUp;

  // Detect manual scroll-up to suspend autoscroll.
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

  // Scroll to bottom when content grows, unless the user pinned up.
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
function Composer({ busy, status, onAsk, onStop, draft, setDraft, attachments, onAddFiles, onRemoveAttachment, attachError, dismissAttachError }) {
  const textRef = useRef(null);
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  // Auto-grow the textarea up to its max-height.
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

  // Drag-and-drop on the whole form. Use a counter to avoid flicker as the cursor enters
  // child elements (dragleave fires when crossing into nested nodes).
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

  return (
    <form
      className={`ask-composer${dragging ? " ask-composer--dragging" : ""}`}
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
      <button
        type="button"
        className="ask-attach-btn"
        onClick={() => fileRef.current?.click()}
        aria-label="Attach a PDF or image"
        title="Attach a PDF or image · 10 MB each · 25 MB total"
        disabled={busy}
      >
        <span aria-hidden="true">📎</span>
      </button>

      <div className="ask-textarea-wrap">
        {atts.length > 0 ? (
          <div className="ask-attach-row" aria-label="Attachments to send with your question">
            {atts.map((a) => (
              <div key={a.id} className="ask-attach-chip" title={`${a.name} · ${formatBytes(a.size)}`}>
                <span className="ask-attach-icon" aria-hidden="true">{a.mediaType?.startsWith("image/") ? "🖼" : "📄"}</span>
                <span className="ask-attach-name">{a.name}</span>
                <span className="ask-attach-size">{formatBytes(a.size)}</span>
                <button type="button" className="ask-attach-remove" onClick={() => onRemoveAttachment(a.id)} aria-label={`Remove ${a.name}`}>×</button>
              </div>
            ))}
          </div>
        ) : null}
        {attachError ? (
          <div className="ask-attach-error" role="alert">
            <span style={{ whiteSpace: "pre-line" }}>{attachError}</span>
            <button type="button" onClick={dismissAttachError} aria-label="Dismiss attachment error">×</button>
          </div>
        ) : null}
        <label htmlFor="ask-input" className="sr-only">Ask a question about the warehouse</label>
        <textarea
          id="ask-input"
          ref={textRef}
          className="ask-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={atts.length ? "Add a question about your attached files…" : "Ask about jobs, delays, sales, PM, loans, margins, exceptions…  (Enter to send, Shift+Enter for newline)"}
          rows={1}
        />
        {dragging ? (
          <div className="ask-drop-overlay" aria-hidden="true">Drop files to attach</div>
        ) : null}
      </div>
      {busy ? (
        <button type="button" className="ask-btn ask-btn--stop" onClick={onStop} aria-label="Stop the answer">
          Stop
        </button>
      ) : (
        <button type="submit" className="ask-btn" disabled={!draft.trim()} aria-label="Send question">
          Ask
        </button>
      )}
    </form>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatCell(v) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
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

  // Add files: validate (type, per-file size, total size) on the client, read accepted
  // files to base64 in parallel, then append to the pending attachments. The server runs
  // the same checks at /api/ask, so this is purely UX — friendlier rejection messages.
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
            // Some browsers report image/jpg — Anthropic wants image/jpeg.
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

  // Wrapper so the Composer can stay attachment-agnostic — it just calls onAsk(text).
  const handleAsk = useCallback(
    (q) => {
      ask(q, attachments);
      setAttachments([]);
      setAttachError("");
    },
    [ask, attachments],
  );

  const scrollRef = useRef(null);
  // Drive autoscroll on every message/content/query change.
  const scrollKey = useMemo(
    () =>
      messages.reduce(
        // m.queries only exists on assistant turns — guard for user turns or the reduce throws.
        (k, m) => `${k}|${m.id}:${(m.content || "").length}:${m.queries?.length || 0}:${(m.queries || []).map((q) => (q.result ? 1 : 0)).join("")}`,
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
        <div>
          <h1>Ask the Brite Homes Data</h1>
          <div className="ask-subtitle">Natural-language answers from the live, read-only BigQuery warehouse.</div>
        </div>
        <div className="ask-header-spacer" />
        <span className="ask-chip-live" aria-label="Live data">Live</span>
        <button
          type="button"
          className="ask-theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          title={`Theme: ${theme}`}
        >
          {theme === "dark" ? "☀" : "☾"}
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
          <button type="button" className="ask-jump" onClick={jumpToLatest} aria-label="Jump to latest">
            Jump to latest ↓
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
        <div className="ask-hint" aria-hidden="true">
          {busy ? "Stop with Esc · " : ""}Read-only · capped at 8 queries / 6 GB per question
        </div>
      </div>
    </div>
  );
}
