import type { Metadata } from "next";
import Image from "next/image";
import {
  BarChart3,
  Calculator,
  Settings,
} from "lucide-react";
import Container from "@/components/ui/Container";
import CTABanner from "@/components/sections/CTABanner";

export const metadata: Metadata = {
  title: "About | A.D. Homes & Consulting",
  description:
    "Hands-on operations consulting for Central Florida builders and development firms. Dashboards, KPI reporting, financial modeling, and process improvement.",
};

const services = [
  { icon: <BarChart3 size={20} />, stat: "Dashboards & KPIs", label: "Power BI reporting and performance tracking" },
  { icon: <Calculator size={20} />, stat: "Financial Modeling", label: "Proformas, underwriting, and scenario analysis" },
  { icon: <Settings size={20} />, stat: "ERP & Process", label: "System cleanup and operations improvement" },
];

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">About</span>
            <h1 className="mt-6 font-heading text-5xl leading-[0.92] tracking-[0.04em] text-slate-50 sm:text-6xl">
              About A.D. Homes & Consulting
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              An independent practice where every engagement is handled
              directly by Arnaud Durand for builders and development firms
              across Central Florida.
            </p>
          </div>
        </Container>
      </section>

      <section className="section-space pt-0">
        <Container>
          <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
            <div className="flex flex-col items-center lg:items-start">
              <div className="relative h-64 w-52 overflow-hidden rounded-2xl border border-white/[0.08]">
                <Image
                  src="/images/arnaud-durand.png"
                  alt="Arnaud Durand"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
              <div className="mt-4 text-center lg:text-left">
                <div className="font-heading text-lg tracking-[0.04em] text-slate-50">
                  Arnaud Durand
                </div>
                <div className="text-sm text-slate-400">Founder and Principal</div>
              </div>
            </div>

            <div>
              <div className="grid gap-4 sm:grid-cols-3">
                {services.map((item) => (
                  <div key={item.stat} className="panel-soft p-5 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-accent-400/20 bg-accent-500/10 text-accent-200">
                      {item.icon}
                    </div>
                    <div className="mt-3 font-heading text-lg tracking-[0.04em] text-slate-50">
                      {item.stat}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-10 space-y-4 text-base leading-7 text-slate-300">
                <p>
                  I work directly with builders and development firms that have
                  outgrown spreadsheet-based reporting but do not need layers
                  of consultants. When you hire A.D. Homes & Consulting, you
                  work with me directly from start to finish.
                </p>
                <p>
                  My background is builder-side: purchasing, analytics,
                  underwriting, ERP workflow cleanup, and operating support
                  inside an active Central Florida development group. The
                  recommendations come from real operating use, not theory.
                </p>
                <p>
                  I handle the work myself. Reporting gets tightened, models
                  get built, systems get cleaned up, and client teams get
                  trained. No handoffs, no junior staffing, and no padded
                  project structure.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CTABanner
        headline="Let’s find the actual bottleneck first."
        description="The first conversation is about identifying the real constraint, whether it sits in reporting, underwriting, or a process issue that looks like a data issue."
        primaryCTA={{
          label: "Get in Touch",
          href: "/contact/",
        }}
      />
    </>
  );
}
