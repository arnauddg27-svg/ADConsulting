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
  title: "About Arnaud Durand | Founder & Data Architect for Residential Homebuilders",
  description:
    "Learn how A.D. Homes & Consulting helps residential homebuilders across North America replace fragmented reporting with custom operational intelligence platforms.",
};

const services = [
  {
    icon: <Wrench size={20} />,
    stat: "Data Extraction",
    label: "ERP, spreadsheet, and file-based source mapping",
  },
  {
    icon: <Layers size={20} />,
    stat: "Warehouse & KPI Logic",
    label: "Raw plus mart datasets with consistent reporting logic",
  },
  {
    icon: <DollarSign size={20} />,
    stat: "Operational Intelligence",
    label: "Interactive lifecycle views, pro forma, and audit tools",
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
              A specialized data consulting firm for residential homebuilders,
              led directly by Arnaud Durand.
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
                <div className="text-sm text-slate-400">Founder and Data Architect</div>
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
                  A.D. Homes &amp; Consulting was built around a clear market gap:
                  most data consultants do not understand the operating reality of
                  a residential builder, and most construction consultants cannot
                  design warehouses, KPI models, and custom applications.
                </p>
                <p>
                  The firm helps builders doing roughly 20-500+ homes per year
                  replace fragmented reporting with a connected operating platform.
                  Data is extracted from builder ERPs, spreadsheets, finance tools,
                  and operational trackers, centralized in a cloud warehouse, and
                  delivered through interactive applications organized around the
                  builder lifecycle.
                </p>
                <p>
                  That lifecycle can span land acquisition, permitting, loans,
                  construction, sales, property management, and audits. The goal is
                  to give builders access to the same kind of operational intelligence
                  national players invest heavily to build, without the cost, delay,
                  or vendor lock-in that usually comes with it.
                </p>
                <p>
                  Every engagement is handled directly by Arnaud Durand as founder
                  and data architect. Clients keep their code, warehouse, and
                  hosting. If the relationship ends, the platform stays with them.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CTABanner
        headline="Start with the systems underneath the reporting."
        description="The first conversation is meant to surface where data, workflows, and decisions stop lining up. If it is a quick fix, you will hear that. If it needs a full platform build, you will get a clear next step."
        primaryCTA={{
          label: "Book a Discovery Call",
          href: "/contact/",
        }}
      />
    </>
  );
}
