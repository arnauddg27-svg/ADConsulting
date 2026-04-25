import Link from "next/link";
import {
  DollarSign,
  Layers,
  Users,
  AlertTriangle,
  TrendingUp,
  Wrench,
  ArrowUpRight,
} from "lucide-react";
import Container from "@/components/ui/Container";
import { TiltCard } from "@/components/ui/TiltCard";
import { SERVICES } from "@/lib/constants";

const iconMap: Record<string, React.ReactNode> = {
  DollarSign: <DollarSign size={22} />,
  Layers: <Layers size={22} />,
  Users: <Users size={22} />,
  AlertTriangle: <AlertTriangle size={22} />,
  TrendingUp: <TrendingUp size={22} />,
  Wrench: <Wrench size={22} />,
};

export default function ServicesOverview() {
  return (
    <section className="section-space pt-8 md:pt-16">
      <Container>
        <div className="reveal mb-12 text-center md:mb-16">
          <span className="eyebrow eyebrow-dot">What We Build</span>
          <h2 className="mx-auto mt-6 max-w-3xl font-heading text-4xl leading-[0.98] tracking-[-0.015em] text-slate-50 sm:text-5xl md:text-[3.4rem]">
            Data infrastructure, reporting,{" "}
            <span className="text-gradient">and decision tools.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Each engagement delivers three connected layers: centralized data
            infrastructure, operational reporting systems, and builder decision
            tools.
          </p>
        </div>

        <div className="reveal-stagger mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, idx) => (
            <TiltCard
              key={service.id}
              tiltLimit={6}
              scale={1.02}
              spotlight={false}
              className="reveal h-full rounded-2xl"
            >
              <Link
                href="/services/"
                className="glow-card group relative flex h-full flex-col overflow-hidden p-7"
              >
                {/* Number top-right */}
                <span className="absolute right-5 top-5 font-space-grotesk text-[0.62rem] uppercase tracking-[0.24em] text-slate-500">
                  0{idx + 1}
                </span>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-400/25 bg-gradient-to-br from-accent-500/15 to-accent-500/[0.02] text-accent-200 transition-all duration-500 group-hover:border-accent-400/50 group-hover:shadow-[0_0_28px_-6px_rgba(52,211,153,0.45)]">
                  {iconMap[service.icon]}
                </div>

                <h3 className="mt-6 font-heading text-[1.35rem] leading-tight tracking-[-0.01em] text-slate-50">
                  {service.shortTitle}
                </h3>
                <p className="mt-3 flex-1 text-[0.92rem] leading-6 text-slate-400">
                  {service.headline}
                </p>

                <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-5">
                  <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-accent-200 transition-colors group-hover:text-accent-100">
                    Learn More
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:border-accent-400/40 group-hover:text-accent-200">
                    <ArrowUpRight size={14} />
                  </span>
                </div>
              </Link>
            </TiltCard>
          ))}
        </div>
      </Container>
    </section>
  );
}
