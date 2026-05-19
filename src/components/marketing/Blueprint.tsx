import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Container from "@/components/ui/Container";
import { liquidActionClass } from "@/lib/buttonStyles";
import { cn } from "@/lib/utils";

interface BlueprintPageProps {
  children: React.ReactNode;
  className?: string;
  frame?: boolean;
}

interface BlueprintHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  children?: React.ReactNode;
  className?: string;
}

interface BlueprintPanelProps {
  children: React.ReactNode;
  className?: string;
}

interface BlueprintCTAProps {
  eyebrow?: string;
  title: string;
  description: string;
  primary: {
    label: string;
    href: string;
  };
  secondary?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function BlueprintPage({
  children,
  className,
  frame = false,
}: BlueprintPageProps) {
  return (
    <div className={cn("blueprint-page min-h-screen text-[#17212c]", className)}>
      {frame ? <div className="blueprint-frame" aria-hidden /> : null}
      {children}
    </div>
  );
}

export function BlueprintHero({
  eyebrow,
  title,
  description,
  align = "left",
  children,
  className,
}: BlueprintHeroProps) {
  const centered = align === "center";

  return (
    <section className={cn("relative overflow-hidden pt-28 pb-12 md:pt-36 md:pb-16", className)}>
      <Container>
        <div
          className={cn(
            "grid min-w-0 gap-10",
            children ? "lg:grid-cols-[0.95fr_1.05fr] lg:items-center" : "",
          )}
        >
          <div className={cn("min-w-0 max-w-5xl", centered && "mx-auto text-center")}>
            <p
              className={cn(
                "inline-flex max-w-full rounded-full border border-[#c9d4da] bg-white/88 px-4 py-2 text-[0.66rem] font-bold uppercase tracking-[0.2em] text-[#2f5368] shadow-[0_16px_48px_-38px_rgba(23,33,44,0.42)]",
                centered && "justify-center",
              )}
            >
              {eyebrow}
            </p>
            <h1 className="text-balance mt-6 max-w-5xl break-words font-heading text-[2.7rem] leading-[1] tracking-[-0.045em] text-[#111814] sm:text-[3.7rem] lg:text-[4.55rem]">
              {title}
            </h1>
            <p
              className={cn(
                "mt-6 max-w-2xl text-lg leading-8 text-[#46515a] md:text-xl",
                centered && "mx-auto",
              )}
            >
              {description}
            </p>
          </div>
          {children ? <div className="min-w-0">{children}</div> : null}
        </div>
      </Container>
    </section>
  );
}

export function BlueprintPanel({ children, className }: BlueprintPanelProps) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-[1.5rem] border border-[#d5dde2] bg-white/[0.82] shadow-[0_32px_100px_-76px_rgba(23,33,44,0.5)] backdrop-blur-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function BlueprintCTA({
  eyebrow = "Next step",
  title,
  description,
  primary,
  secondary,
  className,
}: BlueprintCTAProps) {
  return (
    <section className={cn("pb-20 md:pb-28", className)}>
      <Container>
        <div className="relative overflow-hidden rounded-[1.5rem] border border-[#d5dde2] bg-[#172433] p-7 text-white shadow-[0_42px_130px_-82px_rgba(23,33,44,0.78)] md:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-[#8bd7ff]/20 blur-3xl"
          />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="inline-flex rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[0.64rem] font-bold uppercase tracking-[0.2em] text-[#a7d7eb]">
                {eyebrow}
              </p>
              <h2 className="mt-6 max-w-3xl font-heading text-4xl leading-[0.98] tracking-[-0.04em] md:text-[3.4rem]">
                {title}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 md:text-lg md:leading-8">
                {description}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href={primary.href}
                className={liquidActionClass({
                  tone: "frost",
                  size: "lg",
                  className: "w-full sm:w-auto",
                })}
              >
                <span>{primary.label}</span>
                <ArrowRight size={16} />
              </Link>
              {secondary ? (
                <Link
                  href={secondary.href}
                  className={liquidActionClass({
                    tone: "secondary",
                    size: "lg",
                    className: "w-full sm:w-auto",
                  })}
                >
                  <span>{secondary.label}</span>
                  <ArrowRight size={16} />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
