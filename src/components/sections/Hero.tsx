import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import HeroShowcase from "@/components/sections/HeroShowcase";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-10 pt-[8.75rem] md:pb-14 md:pt-[9.25rem]">
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
          <div className="grid items-end gap-5 lg:grid-cols-[0.62fr_0.38fr]">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-accent-300">
                Builder data platform
              </p>
              <h1 className="mt-4 max-w-4xl font-heading text-[2.75rem] leading-[0.95] tracking-[-0.035em] text-slate-50 sm:text-5xl lg:text-[4.35rem]">
                Dashboards built on your data, not a template.
              </h1>
            </div>

            <div className="lg:pb-1">
              <p className="max-w-md text-sm leading-6 text-slate-300 md:text-base">
                Centralize your systems into a warehouse, apply builder-specific KPI
                logic, and deliver reporting your team can use.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:justify-start">
                <Button href="/contact/" size="md" className="whitespace-nowrap px-5 py-3">
                  Book a Discovery Call
                  <ArrowRight size={16} />
                </Button>
                <Button
                  href="/demo/"
                  variant="outline"
                  size="md"
                  className="whitespace-nowrap border-accent-300/45 bg-accent-500/10 px-5 py-3 text-accent-50 shadow-[0_18px_42px_-24px_rgba(52,211,153,0.75),inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-accent-300/70 hover:bg-accent-500/18 hover:shadow-[0_20px_48px_-22px_rgba(52,211,153,0.95)]"
                >
                  Explore the Example
                  <ArrowRight size={16} />
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
