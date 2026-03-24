"use client";

import type { SHJob } from "@/types/sunshine-homes";
import { STAGES, fmt$ } from "@/lib/sunshine-homes-data";
import type { DrillDetail } from "./SHDrawer";

const STAGE_COLORS = ["#0f766e", "#0d9488", "#14b8a6", "#22d3ee", "#3b82f6", "#1e40af"];
const STAGE_ICONS = ["📋", "🏗️", "🪵", "⚡", "🎨", "🔑"];
const STAGE_PCT = ["10%", "20%", "35%", "60%", "80%", "100%"];

function MiniProgress({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)", marginTop: 4, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${color}, ${color}aa)`, boxShadow: `0 0 6px ${color}44` }} />
    </div>
  );
}

interface SHPipelineBoardProps {
  jobs: SHJob[];
  onDrill?: (detail: DrillDetail) => void;
}

export default function SHPipelineBoard({ jobs, onDrill }: SHPipelineBoardProps) {
  const phaseFlow = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 14 }}>
      {STAGES.map((stage, i) => {
        const count = jobs.filter(j => j.stage === stage).length;
        return (
          <div key={stage} style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 80, cursor: onDrill ? "pointer" : "default" }}
              onClick={onDrill ? () => onDrill({ type: "stage", value: stage, label: stage }) : undefined}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg, ${STAGE_COLORS[i]}33, ${STAGE_COLORS[i]}11)`, border: `1px solid ${STAGE_COLORS[i]}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: `0 0 12px ${STAGE_COLORS[i]}22` }}>
                {STAGE_ICONS[i]}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "var(--sh-text-muted)" }}>{stage}</div>
              <div style={{ fontSize: 8, color: "var(--sh-text-muted)" }}>{STAGE_PCT[i]}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: STAGE_COLORS[i], textShadow: `0 0 12px ${STAGE_COLORS[i]}44` }}>{count}</div>
            </div>
            {i < STAGES.length - 1 && <div style={{ color: "var(--sh-text-muted)", fontSize: 12, margin: "0 2px", opacity: 0.4 }}>›</div>}
          </div>
        );
      })}
    </div>
  );

  return (
    <div>
      {phaseFlow}
      <div className="sh-pipeline-board">
        {STAGES.map((stage, i) => {
          const stageJobs = jobs.filter(j => j.stage === stage);
          return (
            <div key={stage} className="sh-pipeline-col">
              <div className="sh-pipeline-col-head" style={{ "--_col-color": STAGE_COLORS[i] } as React.CSSProperties}>
                <span>{stage}</span>
                <span className="sh-pipeline-col-count">{stageJobs.length}</span>
              </div>
              <div className="sh-pipeline-col-cards">
                {stageJobs.map(job => {
                  const status = job.daysInCurrentPhase > 30 ? "behind" : job.daysInCurrentPhase > 20 ? "at-risk" : "";
                  return (
                    <div
                      key={job.id}
                      className={`sh-pipeline-card ${status}`}
                      style={{ cursor: onDrill ? "pointer" : "default" }}
                      onClick={onDrill ? () => onDrill({ type: "job", value: job.jobCode, label: job.jobCode }) : undefined}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div className="sh-pipeline-card-code">{job.jobCode}</div>
                        <span style={{ fontSize: 9, fontWeight: 700, color: status === "behind" ? "var(--sh-danger)" : status === "at-risk" ? "var(--sh-warning)" : "var(--sh-accent)" }}>{job.completionPct}%</span>
                      </div>
                      <div className="sh-pipeline-card-detail">{job.community} · {job.lot}</div>
                      <div className="sh-pipeline-card-detail">{job.plan}</div>
                      <div className="sh-pipeline-card-detail">
                        {job.superintendent}
                        {job.daysInCurrentPhase > 14 && (
                          <span style={{ color: job.daysInCurrentPhase > 30 ? "var(--sh-danger)" : job.daysInCurrentPhase > 20 ? "var(--sh-warning)" : "var(--sh-text-muted)", fontWeight: 600 }}> · {job.daysInCurrentPhase}d</span>
                        )}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--sh-text-muted)", marginTop: 3 }}>
                        <span>WIP {fmt$(job.wipBalance)}</span>
                        <span>{job.estCompletion}</span>
                      </div>
                      <MiniProgress pct={job.completionPct} color={status === "behind" ? "#f46a6a" : status === "at-risk" ? "#efb562" : STAGE_COLORS[i]} />
                    </div>
                  );
                })}
                {stageJobs.length === 0 && <div style={{ fontSize: 10, color: "var(--sh-text-muted)", padding: 12, textAlign: "center", fontStyle: "italic" }}>No jobs</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
