import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

import {
  BlueprintCTA,
  BlueprintHero,
  BlueprintPage,
  BlueprintPanel,
} from "@/components/marketing/Blueprint";
import Container from "@/components/ui/Container";
import { liquidActionClass } from "@/lib/buttonStyles";

export const metadata: Metadata = {
  title: "Homebuilder Dashboards & ERP Reporting | AD ERP SYSTEMS",
  description:
    "Dashboards built on your builder data, not a template. Centralize ERP data, spreadsheets, finance systems, APIs, and exports in a structured warehouse.",
};

const offerBuckets = [
  {
    icon: Database,
    title: "Centralize the data",
    body: "Bring ERP data, spreadsheets, finance exports, APIs, and operating files into one reporting warehouse.",
  },
  {
    icon: BarChart3,
    title: "Apply builder KPI logic",
    body: "Define the date rules, statuses, calculations, and exception lists that match residential builder operations.",
  },
  {
    icon: Wrench,
    title: "Deliver usable reporting",
    body: "Turn the warehouse into dashboards, drilldowns, alerts, and internal tools your team can use.",
  },
];

const useCases = [
  "Homebuilder KPI dashboards",
  "ERP and spreadsheet reporting",
  "Job cost and cost-to-complete views",
  "Land, permitting, and sales pipeline reporting",
];

const fitItems = [
  "Land acquisition and subdivision pipeline reporting",
  "Permitting status, cycle time, and stuck-item visibility",
  "Construction WIP, budget movement, and cost-to-complete reporting",
  "Sales, backlog, portfolio, and per-job margin visibility",
];

export default function BuilderDataPlatformLandingPage() {
  return (
    <BlueprintPage>
      <BlueprintHero
        eyebrow="Builder Data Platform"
        title="Dashboards built on your data, not a template."
        description="Centralize your systems, apply builder-specific KPI logic, and give every department the operating view it needs."
      >
        <BlueprintPanel className="mx-auto max-w-xl p-6 text-left">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[#35647f]">
              Operating layer
            </p>
            <span className="rounded-full border border-[#d5dde2] bg-[#edf5f1] px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#356b54]">
              Client-owned
            </span>
          </div>
          <div className="mt-6 grid gap-3">
            {useCases.map((useCase) => (
              <div
                key={useCase}
                className="flex items-center gap-3 rounded-[1rem] border border-[#d5dde2] bg-[#f7f9fb]/82 px-4 py-3 text-sm font-bold text-[#40515d]"
              >
                <CheckCircle2 size={16} className="text-[#35647f]" />
                {useCase}
              </div>
            ))}
          </div>
        </BlueprintPanel>
      </BlueprintHero>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="mb-8 rounded-[1.5rem] border border-[#d5dde2] bg-white/[0.82] p-5 shadow-[0_32px_100px_-76px_rgba(23,33,44,0.5)] md:p-7">
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <h2 className="font-heading text-3xl leading-[1.05] tracking-[-0.04em] text-[#17212c] md:text-4xl">
                  Built for ERP exports, job cost data, and disconnected spreadsheets.
                </h2>
                <p className="mt-4 text-base leading-7 text-[#58636b]">
                  The platform starts with the systems already in use, then
                  maps reporting around the decisions your team needs to make.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link
                  href="/book/?source=builder_data_platform_hero"
                  className={liquidActionClass({ tone: "primary", size: "md" })}
                >
                  <span>Book a Discovery Call</span>
                  <ArrowRight size={15} />
                </Link>
                <Link
                  href="/examples/"
                  className={liquidActionClass({ tone: "secondary", size: "md" })}
                >
                  <Sparkles size={15} />
                  <span>View Samples</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {offerBuckets.map(({ icon: Icon, title, body }) => (
              <BlueprintPanel key={title} className="p-6 md:p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d5dde2] bg-[#f7f9fb] text-[#35647f]">
                  <Icon size={22} />
                </div>
                <h2 className="mt-6 font-heading text-2xl leading-tight tracking-[-0.03em] text-[#17212c]">
                  {title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#58636b] md:text-base">
                  {body}
                </p>
              </BlueprintPanel>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-16 md:pb-24">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch">
            <BlueprintPanel className="p-6 md:p-8">
              <ShieldCheck size={24} className="text-[#35647f]" />
              <h2 className="mt-6 font-heading text-4xl leading-[1.02] tracking-[-0.04em] text-[#17212c]">
                Best fit: builders with real reporting friction.
              </h2>
              <p className="mt-5 text-base leading-8 text-[#58636b]">
                The strongest fit is a residential builder or developer with
                enough operating complexity that manual reporting and
                inconsistent KPI logic slow down decisions.
              </p>
            </BlueprintPanel>

            <div className="grid gap-4 sm:grid-cols-2">
              {fitItems.map((item) => (
                <div key={item} className="rounded-[1rem] border border-[#d5dde2] bg-white/[0.82] p-5">
                  <CheckCircle2 size={20} className="text-[#356b54]" />
                  <p className="mt-4 text-sm font-semibold leading-7 text-[#40515d] md:text-base">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <BlueprintCTA
        title="See whether your current data can support better reporting."
        description="Book a 30-minute call to review your current systems, where reporting breaks down, and what a practical first release could include."
        primary={{
          label: "Book a Discovery Call",
          href: "/book/?source=builder_data_platform_cta",
        }}
        secondary={{
          label: "Contact Details",
          href: "/contact/",
        }}
      />
    </BlueprintPage>
  );
}
