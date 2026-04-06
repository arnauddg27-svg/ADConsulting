import { ArrowRight, PhoneCall } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { SITE_CONFIG } from "@/lib/constants";
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
            "reveal panel relative overflow-hidden px-6 py-8 md:px-8 md:py-10",
            variant === "accent"
              ? "bg-[linear-gradient(135deg,rgba(16,185,129,0.15),rgba(255,255,255,0.04)_55%,rgba(255,255,255,0.02))]"
              : "bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03)_55%,rgba(16,185,129,0.08))]"
          )}
          style={{ pointerEvents: "auto" }}
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="eyebrow">Next Step</span>
              <h2 className="mt-5 max-w-3xl font-heading text-4xl leading-[0.95] tracking-[-0.01em] text-slate-50 md:text-5xl">
                {headline}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 md:text-lg">
                {description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                <span className="badge-dash">
                  <PhoneCall size={14} />
                  {SITE_CONFIG.phone}
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
