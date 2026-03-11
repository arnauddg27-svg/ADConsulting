import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="page-hero pb-10 md:pb-12">
      <Container className="relative">
        <div className="animate-rise-in text-center">
          <span className="eyebrow">Central Florida · Builder Operations Consulting</span>

          <h1 className="mx-auto mt-8 max-w-5xl font-heading text-5xl leading-[0.92] tracking-[0.04em] text-slate-50 sm:text-6xl lg:text-[4.15rem]">
            Better systems. Clearer numbers. Stronger execution.
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-slate-300 md:text-xl">
            A.D. Homes & Consulting helps builders and development firms
            improve reporting, financial decision-making, systems, and the
            operating processes that keep teams aligned and moving.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button href="/contact/" size="lg">
              Schedule a Free Consultation
              <ArrowRight size={16} />
            </Button>
            <Button href="/services/" variant="secondary" size="lg">
              Review Services
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-3xl gap-px overflow-hidden rounded-[1.75rem] border border-white/[0.1] bg-white/[0.06] sm:grid-cols-3">
          {[
            { value: "Visibility", label: "Dashboards & KPI reporting" },
            { value: "Finance", label: "Modeling & underwriting" },
            { value: "Operations", label: "ERP & process improvement" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border-b border-white/[0.06] px-6 py-6 text-center last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
            >
              <div className="font-heading text-2xl tracking-[0.04em] text-slate-50">
                {stat.value}
              </div>
              <div className="mt-2 text-[0.68rem] uppercase tracking-[0.2em] text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
