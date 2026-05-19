import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Maximize2,
  Monitor,
  Smartphone,
} from "lucide-react";

import {
  BlueprintHero,
  BlueprintPage,
  BlueprintPanel,
} from "@/components/marketing/Blueprint";
import Container from "@/components/ui/Container";
import { liquidActionClass } from "@/lib/buttonStyles";

export const metadata: Metadata = {
  title: "Example Dashboards | AD ERP SYSTEMS",
  description:
    "Choose between a mobile KPI-only sample dashboard and a full builder operations dashboard.",
};

const examples = [
  {
    href: "/demo/mobile-kpi/",
    eyebrow: "Phone KPI view",
    title: "Mobile KPI dashboard",
    body: "A KPI-only view for quick checks on schedule, budget, margin risk, and open follow-up from a phone.",
    icon: Smartphone,
    cta: "Open Mobile KPI View",
    points: ["Built for phone review", "KPI cards only", "Fast schedule and margin scan"],
  },
  {
    href: "/demo/",
    eyebrow: "Full workspace",
    title: "Full operations dashboard",
    body: "The current interactive sample with filters, lifecycle navigation, drilldowns, and detailed builder workflow tabs.",
    icon: Monitor,
    cta: "Open Full Dashboard",
    points: ["Full-screen dashboard", "Interactive filters", "Lifecycle workflow views"],
  },
];

export default function ExamplesPage() {
  return (
    <BlueprintPage>
      <BlueprintHero
        eyebrow="Sample dashboards"
        title="Pick the sample that matches the review you want to run."
        description="Use the mobile KPI view for a fast field scan, or open the full workspace for a department-level operating review."
      />

      <section className="pb-20 md:pb-28">
        <Container>
          <div className="grid gap-5 lg:grid-cols-2">
            {examples.map(({ href, eyebrow, title, body, icon: Icon, cta, points }) => (
              <Link
                key={href}
                href={href}
                className="group relative overflow-hidden rounded-[1.5rem] border border-[#d5dde2] bg-white/[0.82] p-6 shadow-[0_32px_100px_-76px_rgba(23,33,44,0.5)] backdrop-blur-md transition hover:-translate-y-1 hover:border-[#aab7c0] hover:shadow-[0_42px_120px_-76px_rgba(23,33,44,0.6)] sm:p-7"
              >
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-0 transition group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle at 20% 0%, rgba(111,143,167,0.14), transparent 34%)",
                  }}
                />
                <div className="relative">
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d5dde2] bg-[#f7f9fb] text-[#35647f]">
                      <Icon size={24} />
                    </div>
                    <Maximize2
                      size={18}
                      className="mt-2 text-[#8b98a3] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#35647f]"
                    />
                  </div>
                  <p className="mt-8 text-[0.64rem] font-bold uppercase tracking-[0.2em] text-[#35647f]">
                    {eyebrow}
                  </p>
                  <h2 className="mt-3 font-heading text-4xl leading-none tracking-[-0.04em] text-[#17212c] md:text-5xl">
                    {title}
                  </h2>
                  <p className="mt-5 max-w-xl text-base leading-7 text-[#58636b]">
                    {body}
                  </p>

                  <div className="mt-7 grid gap-2">
                    {points.map((point) => (
                      <div
                        key={point}
                        className="flex items-center gap-2 text-sm font-semibold text-[#40515d]"
                      >
                        <CheckCircle2 size={16} className="text-[#35647f]" />
                        {point}
                      </div>
                    ))}
                  </div>

                  <span
                    className={liquidActionClass({
                      tone: "primary",
                      size: "sm",
                      className: "mt-8",
                    })}
                  >
                    <span>{cta}</span>
                    <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <BlueprintPanel className="mt-10 p-5 text-sm leading-7 text-[#58636b] sm:flex sm:items-start sm:gap-4">
            <BarChart3 className="mb-3 text-[#35647f] sm:mb-0 sm:mt-1" size={22} />
            <p>
              These are illustrative samples. Client dashboards are configured
              around the builder&apos;s actual systems, KPI definitions, and
              operating review process.
            </p>
          </BlueprintPanel>
        </Container>
      </section>
    </BlueprintPage>
  );
}
