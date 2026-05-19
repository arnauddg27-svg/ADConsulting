import type { Metadata } from "next";
import BriteHomesDashboard from "@/components/demo/brite-homes/BriteHomesDashboard";
import {
  BlueprintHero,
  BlueprintPage,
  BlueprintPanel,
} from "@/components/marketing/Blueprint";
import Container from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Brite Homes Dashboard | AD ERP SYSTEMS",
  description:
    "Full-featured builder operations dashboard for Brite Homes connected to Microsoft Fabric.",
};

export default function BriteHomesPage() {
  return (
    <BlueprintPage>
      <BlueprintHero
        eyebrow="Sample workspace"
        title="Brite Homes operations dashboard."
        description="A full lifecycle builder dashboard sample with land, permitting, loans, construction, sales, and portfolio views."
      />

      <section className="pb-20 md:pb-28">
        <Container className="max-w-[96rem]">
          <BlueprintPanel className="overflow-hidden p-3 md:p-4">
            <div className="mb-4 flex flex-wrap items-center gap-3 px-2 pt-2">
              <span className="inline-flex rounded-full border border-[#a8c8b8] bg-[#edf5f1] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#356b54]">
                Microsoft Fabric
              </span>
              <span className="text-sm font-semibold text-[#58636b]">
                Full lifecycle dashboard with 9 interactive views
              </span>
            </div>
            <BriteHomesDashboard />
          </BlueprintPanel>
        </Container>
      </section>
    </BlueprintPage>
  );
}
