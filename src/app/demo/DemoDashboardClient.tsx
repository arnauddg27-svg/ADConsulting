"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import "@/components/demo/sunshine/sunshine-shadcn-skin.css";

function DashboardLoadingShell() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#020617] px-5 text-white">
      <div className="w-full max-w-5xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] shadow-[0_40px_140px_-70px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#60a5fa]">
              Loading sample
            </p>
            <h1 className="mt-1 text-lg font-semibold text-white">
              Builder operations dashboard
            </h1>
          </div>
          <div className="h-9 w-28 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="p-5">
          <div className="h-[30rem] animate-pulse rounded-[1.25rem] bg-[linear-gradient(110deg,rgba(255,255,255,0.045),rgba(255,255,255,0.08),rgba(255,255,255,0.045))]" />
        </div>
      </div>
    </main>
  );
}

const SunshineDashboard = dynamic(
  () => import("@/components/demo/sunshine/SunshineDashboard"),
  {
    ssr: false,
    loading: DashboardLoadingShell,
  },
);

const THEMES: Array<{ key: string; label: string; dot: string }> = [
  // "Original" keeps the shadcn chrome with the dashboard's native teal/navy
  // charts (no chart-palette swap). The rest swap in a categorical chart palette.
  { key: "original", label: "Original", dot: "#24c18d" },
  { key: "slate", label: "Slate", dot: "#60a5fa" },
  { key: "carbon", label: "Carbon", dot: "#4589ff" },
  { key: "indigo", label: "Indigo", dot: "#818cf8" },
  { key: "vivid", label: "Vivid", dot: "#27aeef" },
  { key: "mono", label: "Mono", dot: "#a1a1aa" },
];

export default function DemoDashboardClient() {
  const [theme, setTheme] = useState("original");
  const isOriginal = theme === "original";

  return (
    <>
      <SunshineDashboard skin="shadcn" palette={isOriginal ? undefined : theme} />

      {/* Theme switcher — floats above the dashboard. */}
      <div className="fixed inset-x-0 bottom-4 z-[200] flex justify-center px-4">
        <div className="flex items-center gap-1 rounded-full border border-white/15 bg-[#0b1120]/90 p-1.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <span className="px-2.5 text-[0.6rem] font-bold uppercase tracking-[0.16em] text-slate-400">
            Theme
          </span>
          {THEMES.map((t) => {
            const active = theme === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTheme(t.key)}
                aria-pressed={active}
                className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.7rem] font-semibold transition ${
                  active
                    ? "bg-white/12 text-white"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full ring-1 ring-white/20"
                  style={{ background: t.dot }}
                />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
