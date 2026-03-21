import Link from "next/link";
import {
  DollarSign,
  Layers,
  Users,
  AlertTriangle,
  TrendingUp,
  Wrench,
  ArrowRight,
} from "lucide-react";
import Container from "@/components/ui/Container";
import { SERVICES } from "@/lib/constants";

const iconMap: Record<string, React.ReactNode> = {
  DollarSign: <DollarSign size={24} />,
  Layers: <Layers size={24} />,
  Users: <Users size={24} />,
  AlertTriangle: <AlertTriangle size={24} />,
  TrendingUp: <TrendingUp size={24} />,
  Wrench: <Wrench size={24} />,
};

export default function ServicesOverview() {
  return (
    <section className="section-space pt-8 md:pt-12">
      <Container>
        <div className="reveal mb-12 text-center md:mb-16">
          <span className="eyebrow">What We Build</span>
          <h2 className="mx-auto mt-5 max-w-3xl font-heading text-4xl leading-[0.95] tracking-[-0.01em] text-slate-50 sm:text-5xl">
            The stack behind <span className="text-gradient">better builder decisions.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Every engagement combines extraction, warehousing, KPI modeling,
            and an application layer organized around the builder lifecycle.
            The result is not just a prettier report. It is a working operating
            system the team can use every week.
          </p>
        </div>

        <div className="reveal-stagger mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Link
              key={service.id}
              href="/services/"
              className="reveal glow-card group flex flex-col p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-400/20 bg-accent-500/10 text-accent-200 transition-all duration-300 group-hover:border-accent-400/40 group-hover:shadow-[0_0_20px_-4px_rgba(52,211,153,0.3)]">
                {iconMap[service.icon]}
              </div>
              <h3 className="mt-5 font-heading text-xl tracking-[-0.01em] text-slate-50">
                {service.shortTitle}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-400">
                {service.headline}
              </p>
              <div className="mt-5 inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-accent-200 transition-colors group-hover:text-accent-100">
                Learn More
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
