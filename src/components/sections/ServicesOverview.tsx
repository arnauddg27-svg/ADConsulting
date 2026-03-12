import Link from "next/link";
import {
  BarChart3,
  Calculator,
  Settings,
  ArrowRight,
} from "lucide-react";
import Container from "@/components/ui/Container";
import { SERVICES } from "@/lib/constants";

const iconMap: Record<string, React.ReactNode> = {
  BarChart3: <BarChart3 size={24} />,
  Calculator: <Calculator size={24} />,
  Settings: <Settings size={24} />,
};

export default function ServicesOverview() {
  return (
    <section className="section-space pt-8 md:pt-12">
      <Container>
        <div className="reveal mb-12 text-center md:mb-16">
          <span className="eyebrow">Services</span>
          <h2 className="mx-auto mt-5 max-w-3xl font-heading text-4xl leading-[0.95] tracking-[-0.01em] text-slate-50 sm:text-5xl">
            Core areas where we help builders{" "}
            <span className="text-gradient">improve performance.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-300">
            These are common starting points. Most engagements cut across
            reporting, finance, systems, and day-to-day operations rather than
            living neatly in just one bucket.
          </p>
        </div>

        <div className="reveal-stagger mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
