"use client";

import dynamic from "next/dynamic";

function DashboardLoadingShell() {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#07111d] px-5 text-white">
      <div className="w-full max-w-5xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] shadow-[0_40px_140px_-70px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#78e0c0]">
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

export default function DemoDashboardClient() {
  return <SunshineDashboard />;
}
