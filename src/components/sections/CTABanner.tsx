import { ArrowRight, Clock } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { clsx } from "clsx";

interface CTABannerProps {
  headline: string;
  description: string;
  primaryCTA: { label: string; href: string };
  secondaryCTA?: { label: string; href: string };
  variant?: "dark" | "accent";
}

export default function CTABanner({
  headline,
  description,
  primaryCTA,
  secondaryCTA,
  variant = "dark",
}: CTABannerProps) {
  return (
    <section className="pb-20 md:pb-28" style={{ position: "relative", zIndex: 0, pointerEvents: "none" }}>
      <Container>
        <div
          className={clsx(
            "reveal premium-panel relative overflow-hidden px-7 py-10 md:px-10 md:py-12",
          )}
          style={{ pointerEvents: "auto" }}
        >
          {/* accent glow overlays */}
          <div
            aria-hidden
            className={clsx(
              "pointer-events-none absolute -right-20 -top-20 h-[360px] w-[360px] rounded-full blur-[120px]",
              variant === "accent"
                ? "bg-accent-500/30"
                : "bg-accent-500/15"
            )}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 h-[280px] w-[280px] rounded-full bg-cyan-400/10 blur-[110px]"
          />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="eyebrow eyebrow-dot">Next Step</span>
              <h2 className="mt-6 max-w-3xl font-heading text-4xl leading-[0.98] tracking-[-0.015em] text-slate-50 md:text-[3.4rem]">
                {headline}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 md:text-lg md:leading-8">
                {description}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-slate-300">
                <span className="badge-dash">
                  <Clock size={14} />
                  30-minute discovery call
                </span>
                <span className="badge-dash">Response within 24 hours</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
              <Button href={primaryCTA.href} size="lg">
                {primaryCTA.label}
                <ArrowRight size={16} />
              </Button>
              {secondaryCTA && (
                <Button href={secondaryCTA.href} variant="outline" size="lg">
                  {secondaryCTA.label}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
