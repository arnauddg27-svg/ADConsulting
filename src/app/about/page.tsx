import type { Metadata } from "next";
import Image from "next/image";
import {
  DollarSign,
  Layers,
  Wrench,
} from "lucide-react";
import Container from "@/components/ui/Container";
import CTABanner from "@/components/sections/CTABanner";

export const metadata: Metadata = {
  title: "About A.D. Homes & Consulting | Technology & Data Consulting for Homebuilders",
  description:
    "A technology and data consulting firm building custom cloud data platforms for residential homebuilders. Founded by Arnaud Durand — cloud architecture, data engineering, and full-stack development.",
};

const services = [
  {
    icon: <Wrench size={20} />,
    stat: "Cloud Data Engineering",
    label: "BigQuery, Snowflake, ETL pipelines, and warehouse design",
  },
  {
    icon: <Layers size={20} />,
    stat: "Full-Stack Development",
    label: "Next.js dashboards, APIs, and production deployments on Vercel",
  },
  {
    icon: <DollarSign size={20} />,
    stat: "Builder Operations",
    label: "KPI modeling, lifecycle analytics, and pro forma tools",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">About</span>
            <h1 className="mt-6 font-heading text-5xl leading-[0.92] tracking-[-0.01em] text-slate-50 sm:text-6xl">
              About A.D. Homes &amp; Consulting
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              A technology and data consulting firm building custom cloud
              infrastructure for residential homebuilders across North America.
            </p>
          </div>
        </Container>
      </section>

      <section className="section-space pt-0">
        <Container>
          <div className="reveal mx-auto grid max-w-4xl gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
            <div className="flex flex-col items-center lg:items-start">
              <div className="relative h-64 w-52 overflow-hidden rounded-2xl border border-white/[0.1] shadow-[0_20px_60px_-20px_rgba(16,185,129,0.2)]">
                <Image
                  src="/images/arnaud-durand.png"
                  alt="Arnaud Durand"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
              <div className="mt-4 text-center lg:text-left">
                <div className="font-heading text-lg tracking-[-0.01em] text-slate-50">
                  Arnaud Durand
                </div>
                <div className="text-sm text-slate-400">Founder &amp; Data Architect</div>
              </div>
            </div>

            <div>
              <div className="grid gap-4 sm:grid-cols-3">
                {services.map((item) => (
                  <div key={item.stat} className="glow-card p-5 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-accent-400/20 bg-accent-500/10 text-accent-200">
                      {item.icon}
                    </div>
                    <div className="mt-3 font-heading text-lg tracking-[-0.01em] text-slate-50">
                      {item.stat}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">{item.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-10 space-y-4 text-base leading-7 text-slate-300">
                <p>
                  A.D. Homes &amp; Consulting is a technology and data consulting
                  firm founded by Arnaud Durand. The firm designs and builds custom
                  cloud data platforms for residential homebuilders using modern
                  engineering practices: Next.js for application delivery, BigQuery
                  and Snowflake for warehousing, automated ETL pipelines, and
                  infrastructure-as-code deployment on Vercel and GCP.
                </p>
                <p>
                  Arnaud holds a Master&apos;s degree with a concentration in data
                  analytics and technology management. His background spans cloud
                  architecture, data engineering, full-stack development, and
                  construction operations — a combination that allows the firm to
                  bridge the gap between builder workflows and production-grade
                  data infrastructure.
                </p>
                <p>
                  The firm serves builders doing 20 to 500+ homes per year across
                  North America. Engagements cover the full data lifecycle: ERP
                  extraction, warehouse design, KPI modeling, interactive dashboard
                  development, and ongoing platform support. Every platform spans
                  the builder lifecycle from land acquisition through construction,
                  sales, and audits.
                </p>
                <p>
                  Every engagement is handled directly by Arnaud. Clients own
                  their entire stack — code, warehouse, data, and hosting. No
                  vendor lock-in. If the relationship ends, the platform stays.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CTABanner
        headline="Ready to centralize your data?"
        description="The discovery call maps your current systems, identifies what data is available, and outlines what a custom platform looks like for your operation."
        primaryCTA={{
          label: "Book a Discovery Call",
          href: "/contact/",
        }}
      />
    </>
  );
}
