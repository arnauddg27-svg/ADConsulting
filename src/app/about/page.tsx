import type { Metadata } from "next";
import Image from "next/image";
import {
  DollarSign,
  Layers,
  AlertTriangle,
} from "lucide-react";
import Container from "@/components/ui/Container";
import CTABanner from "@/components/sections/CTABanner";

export const metadata: Metadata = {
  title: "About Arnaud Durand | Builder Data Systems Architect — Orlando, FL",
  description:
    "Arnaud Durand builds custom data ecosystems for Central Florida home builders. MBA-trained with 6+ years of builder-side experience across 1,200+ lots and 1,000+ homes.",
};

const services = [
  { icon: <DollarSign size={20} />, stat: "Job Profitability", label: "Budget tracking, cost variances, margin protection" },
  { icon: <Layers size={20} />, stat: "Lot Pipeline", label: "Starts, completions, bottleneck visibility" },
  { icon: <AlertTriangle size={20} />, stat: "Exception Center", label: "Delayed jobs, missing data, stale update alerts" },
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
              A specialized firm that builds custom data ecosystems for
              residential home builders — handled directly by Arnaud Durand
              from discovery to deployment.
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
                <div className="text-sm text-slate-400">Founder and Principal</div>
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
                  I spent 6+ years inside a Central Florida production builder
                  managing operations across 1,200+ lots and 1,000+ home
                  deliveries — purchasing, scheduling, system implementations,
                  vendor management, and the analytics that tie it all together.
                </p>
                <p>
                  The problem I kept seeing: builders invest in software and
                  systems, but the data stays trapped. Teams export to
                  spreadsheets. Departments work from different numbers.
                  Leadership makes decisions on stale reports.
                </p>
                <p>
                  A.D. Homes &amp; Consulting fixes that. I extract data from your
                  builder systems, centralize it into a single source of truth,
                  and build custom applications where your teams actually execute.
                  Job profitability, lot pipeline, vendor scorecards, exception
                  tracking — all connected, all automated.
                </p>
                <p>
                  I hold an <b>MBA from the Crummer Graduate School at Rollins
                  College</b> (Finance &amp; Operations/Technology, 3.86 GPA) and
                  am bilingual in French and English. When you hire A.D. Homes,
                  you work with me directly — no handoffs, no junior staffing.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CTABanner
        headline="Let's look under the hood."
        description="The first call is a 30-minute discovery session. We'll dig into your current systems, your pain points, and where the biggest operational drag lives. If it's a quick fix, I'll tell you for free."
        primaryCTA={{
          label: "Book a Discovery Call",
          href: "/contact/",
        }}
      />
    </>
  );
}
