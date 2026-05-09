import type { Metadata } from "next";
import BriteHomesDashboard from "@/components/demo/brite-homes/BriteHomesDashboard";

export const metadata: Metadata = {
  title: "Brite Homes Sample Dashboard | Residential Homebuilder Reporting System",
  description: "Sample residential homebuilder reporting system for Brite Homes, connected to Microsoft Fabric and organized around operational decision-making.",
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
            Brite Homes sample — 9 interactive views for builder reporting workflows
          </span>
        </div>
        <BriteHomesDashboard />
      </div>
    </section>
  );
}
