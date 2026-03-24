"use client";

interface SHPanelProps {
  kicker?: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}

export default function SHPanel({ kicker, title, note, children }: SHPanelProps) {
  return (
    <div className="sh-panel">
      {kicker && <div className="sh-panel-kicker">{kicker}</div>}
      <div className="sh-panel-title">{title}</div>
      {note && <div className="sh-panel-note">{note}</div>}
      {children}
    </div>
  );
}
