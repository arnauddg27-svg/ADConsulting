import { ArrowRight, Sparkles, Database, LineChart, Building2 } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";

export default function Hero() {
  return (
    <section className="page-hero pb-12 md:pb-16">
      {/* Aurora mesh background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="aurora-blob left-[6%] top-[4%] h-[560px] w-[680px] bg-accent-500/[0.18]"
          style={{ animation: "var(--animate-aurora)" }}
        />
        <div
          className="aurora-blob right-[-5%] top-[22%] h-[420px] w-[520px] bg-cyan-400/[0.12]"
          style={{ animation: "var(--animate-aurora)", animationDelay: "-8s" }}
        />
        <div
          className="aurora-blob left-[35%] bottom-[-10%] h-[500px] w-[680px] bg-indigo-500/[0.08]"
          style={{ animation: "var(--animate-gradient-shift)" }}
        />
        {/* Subtle radial vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(16,185,129,0.08), transparent 70%)",
          }}
        />
      </div>

      <Container className="relative">
        <div className="animate-rise-in flex flex-col items-center text-center">
          <span className="eyebrow eyebrow-dot">
            <AnimatedShinyText shimmerWidth={80}>
              Custom data platforms for residential homebuilders
            </AnimatedShinyText>
          </span>

          <h1 className="mx-auto mt-8 max-w-5xl font-heading text-[2.8rem] leading-[0.95] tracking-[-0.02em] text-slate-50 sm:text-6xl md:text-7xl lg:text-[5rem]">
            Your data,{" "}
            <span className="relative inline-block">
              <span className="text-gradient">extracted</span>
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-1 mx-auto h-[6px] max-w-[80%] rounded-full bg-gradient-to-r from-transparent via-accent-400/40 to-transparent blur-md"
              />
            </span>
            .{" "}
            <span className="block mt-1 text-slate-200/95">Centralized.</span>
            <span className="text-gradient-warm">Delivered.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-slate-300 md:text-lg md:leading-8">
            ERP systems, spreadsheets, finance tools, APIs, and exports feed one
            structured warehouse that powers dashboards, reporting systems, and
            operational tools built around builder workflows.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button href="/contact/" size="lg">
              Book a Discovery Call
              <ArrowRight size={16} />
            </Button>
            <Button href="/demo/" variant="secondary" size="lg">
              See a Sample Dashboard
            </Button>
          </div>

          {/* Micro trust strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
            <span className="inline-flex items-center gap-2">
              <Sparkles size={12} className="text-accent-400" />
              Client-owned infrastructure
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span>BigQuery · Snowflake · Postgres</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span>Sun Belt builders</span>
          </div>
        </div>

        {/* Hero stat / capability strip — upgraded */}
        <div className="reveal mx-auto mt-16 grid max-w-5xl gap-px overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-[0_40px_120px_-60px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.05)] md:grid-cols-3">
          {[
            {
              icon: <Database size={20} className="text-accent-300" />,
              value: "Automated Extraction",
              label: "ERP, Sheets, CSV, and XLSX synced into one flow",
            },
            {
              icon: <Building2 size={20} className="text-accent-300" />,
              value: "Central Warehouse",
              label: "Raw + mart datasets with KPI logic defined once",
            },
            {
              icon: <LineChart size={20} className="text-accent-300" />,
              value: "Interactive Apps",
              label: "Reporting systems and operational tools for daily decisions",
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="group relative border-b border-white/[0.06] px-6 py-7 text-left transition-all duration-500 hover:bg-white/[0.05] last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0"
            >
              {/* hover accent strip at top */}
              <span
                aria-hidden
                className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent-400/20 bg-accent-500/[0.08]">
                  {stat.icon}
                </div>
                <div className="font-space-grotesk text-[0.62rem] uppercase tracking-[0.24em] text-slate-500">
                  0{i + 1}
                </div>
              </div>
              <div className="mt-4 font-heading text-xl tracking-[-0.01em] text-slate-50 sm:text-[1.4rem]">
                {stat.value}
              </div>
              <div className="mt-2 text-[0.82rem] leading-6 text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
