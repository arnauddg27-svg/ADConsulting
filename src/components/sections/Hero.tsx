import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";

export default function Hero() {
  return (
    <section className="page-hero pb-10 md:pb-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[15%] h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-accent-500/[0.07] blur-[120px]" />
        <div className="absolute right-[10%] top-[30%] h-[300px] w-[300px] rounded-full bg-indigo-500/[0.04] blur-[100px]" />
      </div>

      <Container className="relative">
        <div className="animate-rise-in text-center">
          <span className="eyebrow">
            <AnimatedShinyText shimmerWidth={80}>
              North America · Residential Homebuilders · 20-500+ Homes/Year
            </AnimatedShinyText>
          </span>

          <h1 className="mx-auto mt-8 max-w-5xl font-heading text-5xl leading-[0.92] tracking-[-0.01em] text-slate-50 sm:text-6xl lg:text-[4.4rem]">
            Your data, extracted.{" "}<span className="text-gradient">Centralized. Delivered.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl md:leading-9">
            We build custom data platforms for residential homebuilders.
            ERP systems, spreadsheets, finance systems, APIs, and exports
            feed one structured warehouse that powers dashboards, reporting
            systems, and operational tools.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button href="/contact/" size="lg">
              Book a Discovery Call
              <ArrowRight size={16} />
            </Button>
            <Button href="/demo/" variant="secondary" size="lg">
              See a Sample Dashboard
            </Button>
          </div>
        </div>

        <div className="reveal mx-auto mt-20 grid max-w-4xl gap-px overflow-hidden rounded-[1.75rem] border border-white/[0.1] bg-white/[0.06] sm:grid-cols-3">
          {[
            {
              value: "Automated Extraction",
              label: "ERP, Sheets, CSV, and XLSX data synced into one flow",
            },
            {
              value: "Central Warehouse",
              label: "Raw and mart datasets with KPI logic defined once",
            },
            {
              value: "Interactive Apps",
              label: "Reporting systems and operational tools for daily decisions",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border-b border-white/[0.06] px-6 py-6 text-center transition-colors duration-300 hover:bg-white/[0.03] last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
            >
              <div className="font-heading text-xl tracking-[-0.01em] text-slate-50 sm:text-2xl">
                {stat.value}
              </div>
              <div className="mt-2 text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
