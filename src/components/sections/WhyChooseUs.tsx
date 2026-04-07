import {
  Building2,
  GraduationCap,
  Wrench,
  MapPin,
} from "lucide-react";
import Container from "@/components/ui/Container";

const reasons = [
  {
    icon: <Building2 size={22} />,
    title: "Next.js + BigQuery architecture",
    body: "Every platform is built on a modern cloud stack: Next.js for interactive dashboards, BigQuery or Snowflake for warehousing, and automated pipelines for daily data ingestion.",
  },
  {
    icon: <Wrench size={22} />,
    title: "Full lifecycle data coverage",
    body: "Land acquisition, permitting, loans, construction, sales, and audits — connected in a single warehouse with KPI logic defined once and used everywhere.",
  },
  {
    icon: <GraduationCap size={22} />,
    title: "You own the entire stack",
    body: "Code, warehouse, hosting, and data — all yours. No vendor lock-in, no proprietary layers. If the engagement ends, the platform stays with you.",
  },
  {
    icon: <MapPin size={22} />,
    title: "Built for 20-500+ homes per year",
    body: "Enterprise-grade data infrastructure without the enterprise price tag. Sized for builders who have outgrown spreadsheets but need more than off-the-shelf BI tools.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="section-space">
      <Container>
        <div className="reveal grid gap-10 lg:grid-cols-[0.4fr_0.6fr] lg:items-center">
          <div>
            <span className="eyebrow">Why Us</span>
            <h2 className="mt-5 max-w-lg font-heading text-4xl leading-[0.95] tracking-[-0.01em] text-slate-50 md:text-5xl">
              Built for how <span className="text-gradient">builders actually operate.</span>
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-300 md:text-lg">
              Cloud warehousing, modern application development, and deep
              familiarity with builder operations — delivered as one
              engagement. You get infrastructure that works the way your
              teams already think about jobs, draws, permits, and closings.
            </p>
          </div>

          <div className="reveal-stagger grid gap-4 sm:grid-cols-2">
            {reasons.map((item) => (
              <div key={item.title} className="reveal glow-card p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-400/20 bg-accent-500/10 text-accent-200">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-100">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
