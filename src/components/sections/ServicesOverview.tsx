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
        <div className="mb-12 text-center md:mb-16">
          <span className="eyebrow">Services</span>
          <h2 className="mx-auto mt-5 max-w-3xl font-heading text-4xl leading-[0.95] tracking-[0.04em] text-slate-50 sm:text-5xl">
            Core areas where we help builders improve performance.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-300">
            These are common starting points. Most engagements cut across
            reporting, finance, systems, and day-to-day operations rather than
            living neatly in just one bucket.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Link
              key={service.id}
              href="/services/"
              className="group panel-soft flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.16] hover:bg-white/[0.06]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-400/20 bg-accent-500/10 text-accent-200">
                {iconMap[service.icon]}
              </div>
              <h3 className="mt-5 font-heading text-xl tracking-[0.04em] text-slate-50">
                {service.shortTitle}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-400">
                {service.headline}
              </p>
              <div className="mt-5 inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-accent-200">
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
