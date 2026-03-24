import type { Metadata } from "next";
import BriteHomesDashboard from "@/components/demo/brite-homes/BriteHomesDashboard";

export const metadata: Metadata = {
  title: "Brite Homes Dashboard | Builder Operations Platform",
  description: "Full-featured builder operations dashboard for Brite Homes connected to Microsoft Fabric.",
};

export default function BriteHomesPage() {
  return (
    <section className="section-space pt-8">
      <div className="mx-auto max-w-[96rem] px-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400">
            Microsoft Fabric
          </span>
          <span className="text-sm text-slate-400">
            Brite Homes — full lifecycle dashboard with 9 interactive views
          </span>
        </div>
        <BriteHomesDashboard />
      </div>
    </section>
  );
}
