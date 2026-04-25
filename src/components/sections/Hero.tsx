import { ArrowRight, Sparkles } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import HeroShowcase from "@/components/sections/HeroShowcase";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";

export default function Hero() {
  return (
    <section className="page-hero relative pb-12 md:pb-16">
      {/* Mouse spotlight is handled globally by <PageAmbient> in layout. */}

      {/* Aurora mesh background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="aurora-blob left-[4%] top-[2%] h-[600px] w-[720px] bg-accent-500/[0.18]"
          style={{ animation: "var(--animate-aurora)" }}
        />
        <div
          className="aurora-blob right-[-6%] top-[18%] h-[460px] w-[540px] bg-cyan-400/[0.14]"
          style={{ animation: "var(--animate-aurora)", animationDelay: "-8s" }}
        />
        <div
          className="aurora-blob left-[30%] bottom-[-12%] h-[520px] w-[700px] bg-indigo-500/[0.08]"
          style={{ animation: "var(--animate-gradient-shift)" }}
        />
        {/* top vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(16,185,129,0.1), transparent 70%)",
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
            <span>Data warehouse + dashboard hosting handoff</span>
          </div>
        </div>

        {/* Showcase: animated pipeline + live dashboard */}
        <HeroShowcase />
      </Container>
    </section>
  );
}
