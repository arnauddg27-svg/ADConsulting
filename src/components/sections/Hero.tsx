import { ArrowRight, Sparkles } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import HeroShowcase from "@/components/sections/HeroShowcase";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-12 pt-[11rem] md:pb-16 md:pt-[11.75rem]">
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
          <div className="mx-auto max-w-5xl text-center">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-accent-300">
              Builder data platform
            </p>
            <h1 className="mx-auto mt-4 max-w-[62rem] font-heading text-[3.25rem] leading-[0.95] tracking-[-0.045em] text-white sm:text-6xl lg:text-[5.2rem] xl:text-[5.85rem]">
              Dashboards built on your data, not a template.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Centralize your systems into a warehouse, apply builder-specific KPI logic,
              and deliver reporting your team can use.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/book/?source=home_hero" size="md" className="whitespace-nowrap px-5 py-3">
                Book a Discovery Call
                <ArrowRight size={16} />
              </Button>
              <Button
                href="/demo/"
                variant="outline"
                size="md"
                className="relative isolate overflow-hidden whitespace-nowrap border-accent-200/70 bg-[linear-gradient(135deg,rgba(52,211,153,0.24),rgba(34,211,238,0.13),rgba(99,102,241,0.16))] px-5 py-3 text-accent-50 shadow-[0_0_0_1px_rgba(110,231,183,0.18),0_22px_62px_-18px_rgba(52,211,153,0.95),inset_0_1px_0_rgba(255,255,255,0.16)] before:absolute before:inset-[-180%] before:-z-10 before:animate-[spin_3.4s_linear_infinite] before:bg-[conic-gradient(from_90deg,transparent_0deg,transparent_80deg,rgba(167,243,208,0.55)_120deg,rgba(34,211,238,0.2)_145deg,transparent_190deg)] after:absolute after:inset-[1px] after:-z-10 after:rounded-full after:bg-[linear-gradient(135deg,rgba(8,13,24,0.84),rgba(12,74,58,0.76),rgba(8,13,24,0.88))] hover:-translate-y-1 hover:scale-[1.025] hover:border-accent-100 hover:bg-accent-500/25 hover:text-white hover:shadow-[0_0_36px_-8px_rgba(52,211,153,1),0_28px_74px_-24px_rgba(34,211,238,0.95)]"
              >
                <Sparkles size={15} className="text-accent-200" />
                <span>Explore the Example</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5"
                />
              </Button>
            </div>
          </div>
          <HeroShowcase />
        </div>
      </Container>
    </section>
  );
}
