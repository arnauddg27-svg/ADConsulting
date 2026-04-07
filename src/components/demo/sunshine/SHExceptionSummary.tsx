"use client";

interface ExceptionItem {
  label: string;
  value: string;
  tone: "good" | "watch" | "alert";
}

interface SHExceptionSummaryProps {
  items: ExceptionItem[];
}

const TONE_STYLES: Record<ExceptionItem["tone"], { border: string; glow: string; text: string; chipBg: string; chipText: string; dot: string }> = {
  good: {
    border: "rgba(20,184,166,0.35)",
    glow: "radial-gradient(120% 140% at 100% 0%, rgba(20,184,166,0.14), rgba(20,184,166,0) 60%)",
    text: "#5cd3c8",
    chipBg: "rgba(20,184,166,0.16)",
    chipText: "#7ae6dc",
    dot: "#14b8a6",
  },
  watch: {
    border: "rgba(239,181,98,0.38)",
    glow: "radial-gradient(120% 140% at 100% 0%, rgba(239,181,98,0.14), rgba(239,181,98,0) 60%)",
    text: "#f4c983",
    chipBg: "rgba(239,181,98,0.16)",
    chipText: "#ffdca7",
    dot: "#efb562",
  },
  alert: {
    border: "rgba(244,106,106,0.4)",
    glow: "radial-gradient(120% 140% at 100% 0%, rgba(244,106,106,0.14), rgba(244,106,106,0) 60%)",
    text: "#ff9d9d",
    chipBg: "rgba(244,106,106,0.16)",
    chipText: "#ffb5b5",
    dot: "#f46a6a",
  },
};

export default function SHExceptionSummary({ items }: SHExceptionSummaryProps) {
  return (
    <div style={{ marginBottom: 10, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
      {items.map((item) => {
        const tone = TONE_STYLES[item.tone];
        const toneLabel = item.tone === "good" ? "Stable" : item.tone === "watch" ? "Watch" : "Action";
        return (
          <div
            key={item.label}
            style={{
              position: "relative",
              overflow: "hidden",
              border: `1px solid ${tone.border}`,
              background: `linear-gradient(180deg, rgba(13,24,37,0.92), rgba(10,18,29,0.94)), ${tone.glow}`,
              borderRadius: 10,
              padding: "10px 12px",
              minHeight: 64,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 8px 20px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--sh-text-muted)" }}>{item.label}</div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 9,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: tone.chipText,
                  background: tone.chipBg,
                  border: `1px solid ${tone.border}`,
                  borderRadius: 999,
                  padding: "2px 7px",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: tone.dot }} />
                {toneLabel}
              </div>
            </div>
            <div style={{ marginTop: 6, fontSize: 26, lineHeight: 1, fontWeight: 800, color: tone.text }}>{item.value}</div>
          </div>
        );
      })}
    </div>
  );
}
