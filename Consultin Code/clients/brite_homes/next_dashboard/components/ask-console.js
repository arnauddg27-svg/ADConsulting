"use client";

import { useState } from "react";

const SUGGESTIONS = [
  "Which jobs have been in their current stage the longest?",
  "What's our total WIP and loan exposure right now?",
  "Show CO homes that aren't closed yet, worst first.",
  "Average net margin by community for closed jobs.",
];

function updateLastAssistant(list, fn) {
  const out = [...list];
  for (let i = out.length - 1; i >= 0; i--) {
    if (out[i].role === "assistant") {
      out[i] = fn(out[i]);
      break;
    }
  }
  return out;
}

export default function AskConsole() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function applyEvent(ev) {
    if (ev.type === "status") setStatus(ev.text);
    else if (ev.type === "text") setMessages((cur) => updateLastAssistant(cur, (a) => ({ ...a, content: a.content + ev.text })));
    else if (ev.type === "tool_use") setMessages((cur) => updateLastAssistant(cur, (a) => ({ ...a, queries: [...a.queries, { sql: ev.sql, purpose: ev.purpose, result: null }] })));
    else if (ev.type === "tool_result")
      setMessages((cur) =>
        updateLastAssistant(cur, (a) => {
          const queries = [...a.queries];
          for (let i = queries.length - 1; i >= 0; i--) {
            if (!queries[i].result) {
              queries[i] = { ...queries[i], result: ev };
              break;
            }
          }
          return { ...a, queries };
        }),
      );
    else if (ev.type === "error") setError(ev.message);
    else if (ev.type === "done") setStatus("");
  }

  async function ask(q) {
    const question = String(q ?? input).trim();
    if (!question || busy) return;
    setError("");
    setInput("");
    setBusy(true);
    setStatus("thinking");
    const history = [...messages.filter((m) => m.content.trim()).map((m) => ({ role: m.role, content: m.content })), { role: "user", content: question }];
    setMessages((cur) => [...cur, { role: "user", content: question, queries: [] }, { role: "assistant", content: "", queries: [] }]);

    let reader;
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "The assistant could not answer.");
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
          if (line.trim()) applyEvent(JSON.parse(line));
        }
      }
    } catch (e) {
      if (reader) {
        try { await reader.cancel(); } catch {}
      }
      setError(e.message || "Something went wrong.");
    } finally {
      setBusy(false);
      setStatus("");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 24 }}>Ask the Brite Homes Data</h1>
        <p style={{ color: "#666", marginTop: 4 }}>
          Natural-language answers from the live, read-only BigQuery warehouse. Claude writes and runs its own SQL (capped and validated) and shows its work.
        </p>
      </header>

      {messages.length === 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => ask(s)} disabled={busy} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fafafa", cursor: "pointer" }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m, i) => (
          <article key={`${m.role}-${i}`} style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: m.role === "user" ? "#f5f8ff" : "#fff" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6 }}>{m.role === "user" ? "You" : "Warehouse Analyst"}</div>
            {m.queries?.length > 0 && (
              <details style={{ marginBottom: 8 }}>
                <summary style={{ cursor: "pointer", color: "#555" }}>Ran {m.queries.length} quer{m.queries.length === 1 ? "y" : "ies"}</summary>
                {m.queries.map((query, qi) => (
                  <div key={qi} style={{ marginTop: 8 }}>
                    {query.purpose && <div style={{ fontSize: 12, color: "#777" }}>{query.purpose}</div>}
                    <pre style={{ background: "#0d1117", color: "#e6edf3", padding: 10, borderRadius: 6, overflowX: "auto", fontSize: 12 }}>{query.sql}</pre>
                    {query.result?.error && <div style={{ color: "#b00", fontSize: 13 }}>Error: {query.result.error}</div>}
                    {query.result?.rows && <ResultTable result={query.result} />}
                  </div>
                ))}
              </details>
            )}
            <div style={{ whiteSpace: "pre-wrap" }}>{m.content || (m.role === "assistant" && busy ? status || "…" : "")}</div>
          </article>
        ))}
      </div>

      {error && <div style={{ color: "#b00" }}>{error}</div>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        style={{ display: "flex", gap: 8 }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about jobs, delays, sales, PM, loans, margins, exceptions…"
          rows={2}
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ddd", resize: "vertical" }}
        />
        <button type="submit" disabled={busy || !input.trim()} style={{ padding: "0 20px", borderRadius: 8, border: "none", background: busy ? "#999" : "#1a56db", color: "#fff", cursor: busy ? "default" : "pointer" }}>
          {busy ? "Asking…" : "Ask"}
        </button>
      </form>
    </div>
  );
}

function ResultTable({ result }) {
  const { columns = [], rows = [], truncated, rowCount } = result;
  if (!rows.length) return <div style={{ fontSize: 13, color: "#777" }}>No rows.</div>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", fontSize: 12, marginTop: 6 }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} style={{ border: "1px solid #eee", padding: "4px 8px", textAlign: "left", background: "#fafafa" }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {columns.map((c) => (
                <td key={c} style={{ border: "1px solid #eee", padding: "4px 8px" }}>{String(r[c] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>
        {rowCount} row{rowCount === 1 ? "" : "s"} shown{truncated ? " (truncated)" : ""}.
      </div>
    </div>
  );
}
