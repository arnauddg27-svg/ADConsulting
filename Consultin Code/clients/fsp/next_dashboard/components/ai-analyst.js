"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const SUGGESTIONS = [
  "Which jobs are furthest along?",
  "What's our committed PO exposure by vendor?",
  "How many tasks are overdue right now?",
  "Summarize the portfolio in 3 bullets",
];

/* Compact, bounded snapshot of the dashboard object for the model. Excludes the
   full task roster and PO detail (large); keeps every number the UI displays. */
function buildContext(dashboard) {
  const d = dashboard || {};
  const jobs = (d.jobProgress || []).map((j) => ({
    address: j.project_address || j.lot_id,
    plan: j.plan_name,
    community: j.community,
    progress_percent: j.progress_percent,
    milestone: j.progress_milestone,
    milestones_completed: j.milestones_completed,
    milestones_total: j.milestones_total,
    days_since_last_milestone: j.days_since_milestone,
    tasks_total: j.total_tasks,
    tasks_completed: j.completed,
    tasks_in_progress: j.in_progress,
    tasks_ordered: j.ordered,
    tasks_not_started: j.not_started,
    budget: j.total_budget,
    earliest_start: j.earliest_start,
    latest_end: j.latest_end,
  }));
  const spending = (d.actualSpending || []).map((s) => ({
    address: s.project_address,
    plan: s.plan_name,
    budget_total: s.budget_total,
    po_sent_budget: s.po_sent_budget_total,
    completed_scope_actual_proxy: s.effective_actual_total,
    committed_pos: s.committed_po_total,
    open_pos: s.open_po_total,
    po_variance: s.variance,
    erp_over_under: s.erp_over_under,
  }));
  const exceptionRows = d.exceptionRows || [];
  const exception_counts = {};
  for (const e of exceptionRows) {
    const key = `${e.exception_type}_${e.severity}`;
    exception_counts[key] = (exception_counts[key] || 0) + 1;
  }
  return {
    client: d.config?.clientName || "FSP",
    summaries: d.summaries,
    jobs,
    tasks_by_stage: d.tasksByStage,
    budget_by_trade_group: (d.tasksByGroup || []).slice(0, 25),
    vendor_scorecard: d.vendorScorecard,
    spending_by_job: spending,
    quality_checks: d.qualityChecks,
    audit_notes: d.auditNotes,
    exception_counts,
    longest_outstanding_exceptions: exceptionRows.slice(0, 25),
  };
}

export default function AiAnalyst({ dashboard }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const context = useMemo(() => buildContext(dashboard), [dashboard]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const setLastAssistant = (updater) => {
    setMessages((prev) => {
      const next = prev.slice();
      const last = next[next.length - 1];
      if (last?.role === "assistant") next[next.length - 1] = { ...last, content: updater(last.content) };
      return next;
    });
  };

  const send = async (text) => {
    const content = String(text ?? input).trim();
    if (!content || busy) return;
    const history = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, context }),
      });
      if (!res.ok) {
        let message = "Something went wrong — please try again.";
        try {
          message = (await res.json()).error || message;
        } catch { /* non-JSON error body */ }
        setLastAssistant(() => message);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) setLastAssistant((prevText) => prevText + chunk);
      }
    } catch {
      setLastAssistant((prevText) => prevText || "Connection lost — please try again.");
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  return (
    <>
      {!open && (
        <button className="ai-fab" onClick={() => setOpen(true)} aria-label="Open AI analyst">
          <span className="ai-fab-icon">&#10022;</span>
          <span>Ask AI</span>
        </button>
      )}

      {open && (
        <div className="ai-panel" role="dialog" aria-label="FSP AI analyst">
          <div className="ai-panel-header">
            <div>
              <div className="ai-panel-title">FSP Analyst</div>
              <div className="ai-panel-sub">Answers from the current dashboard data</div>
            </div>
            <button className="ai-panel-close" onClick={() => setOpen(false)} aria-label="Close">&#x2715;</button>
          </div>

          <div className="ai-messages" ref={listRef}>
            {messages.length === 0 && (
              <div className="ai-empty">
                <p>Ask anything about jobs, budgets, vendors, POs, or schedule.</p>
                <div className="ai-suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="ai-suggestion" onClick={() => send(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg ${m.role}`}>
                {m.content || (busy && i === messages.length - 1 ? <span className="ai-typing"><span /><span /><span /></span> : "")}
              </div>
            ))}
          </div>

          <div className="ai-input-row">
            <input
              ref={inputRef}
              className="ai-input"
              placeholder="Ask about the data…"
              value={input}
              disabled={busy}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            />
            <button className="ai-send" onClick={() => send()} disabled={busy || !input.trim()}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
