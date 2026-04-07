"use client";

interface ExceptionItem {
  label: string;
  value: string;
  tone: "good" | "watch" | "alert";
}

interface SHExceptionSummaryProps {
  items: ExceptionItem[];
}

const TONE_STYLES: Record<ExceptionItem["tone"], { border: string; bg: string; text: string }> = {
  good: { border: "rgba(20,184,166,0.3)", bg: "rgba(20,184,166,0.08)", text: "#14b8a6" },
  watch: { border: "rgba(239,181,98,0.3)", bg: "rgba(239,181,98,0.08)", text: "#efb562" },
  alert: { border: "rgba(244,106,106,0.3)", bg: "rgba(244,106,106,0.08)", text: "#f46a6a" },
};

export default function SHExceptionSummary({ items }: SHExceptionSummaryProps) {
  return (
    <div style={{ marginBottom: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
      {items.map((item) => {
        const tone = TONE_STYLES[item.tone];
        return (
          <div
            key={item.label}
            style={{
              border: `1px solid ${tone.border}`,
              background: tone.bg,
              borderRadius: 6,
              padding: "7px 9px",
              minHeight: 48,
            }}
          >
            <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--sh-text-muted)" }}>{item.label}</div>
            <div style={{ marginTop: 2, fontSize: 13, fontWeight: 700, color: tone.text }}>{item.value}</div>
          </div>
        );
      })}
    </div>
  );
}
