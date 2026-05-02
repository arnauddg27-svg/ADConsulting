import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import HeroShowcase from "@/components/sections/HeroShowcase";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-12 pt-28 md:pb-16 md:pt-32">
      {/* Mouse spotlight is handled globally by <PageAmbient> in layout. */}

      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="aurora-blob left-[-8%] top-[4%] h-[620px] w-[760px] bg-accent-500/[0.16]"
          style={{ animation: "var(--animate-aurora)" }}
        />
        <div
          className="aurora-blob right-[-12%] top-[8%] h-[520px] w-[620px] bg-indigo-500/[0.08]"
          style={{ animation: "var(--animate-gradient-shift)", animationDelay: "-8s" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 42% at 50% 0%, rgba(16,185,129,0.08), transparent 70%)",
          }}
        />
      </div>

      <Container className="relative">
        <div className="animate-rise-in">
          <div className="grid items-end gap-8 lg:grid-cols-[0.58fr_0.42fr]">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent-300">
                Builder data platform
              </p>
              <h1 className="mt-5 max-w-3xl font-heading text-[3rem] leading-[0.95] tracking-[-0.035em] text-slate-50 sm:text-6xl lg:text-[5rem]">
                Dashboards built on your data, not a template.
              </h1>
            </div>

            <div className="lg:pb-2">
              <p className="max-w-xl text-base leading-7 text-slate-300 md:text-lg">
                Centralize your systems into a warehouse, apply builder-specific KPI
                logic, and deliver reporting your team can use.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:justify-start">
                <Button href="/contact/" size="lg">
                  Book a Discovery Call
                  <ArrowRight size={16} />
                </Button>
                <Button href="/demo/" variant="secondary" size="lg">
                  Explore the Example
                </Button>
              </div>
            </div>
          </div>

          <HeroShowcase />
        </div>
      </Container>
    </section>
  );
}
