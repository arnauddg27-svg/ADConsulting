"use client";

interface SHPillProps {
  tone: "good" | "watch" | "alert";
  label: string;
}

export default function SHPill({ tone, label }: SHPillProps) {
  return <span className={`sh-pill sh-pill-${tone}`}>{label}</span>;
}
