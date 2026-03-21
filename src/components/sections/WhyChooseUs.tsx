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
    title: "Builder reality plus technical depth",
    body: "Most data consultants do not understand builder operations, and most construction consultants cannot design warehouses or applications. A.D. Homes is built around both skill sets.",
  },
  {
    icon: <Wrench size={22} />,
    title: "Full lifecycle coverage",
    body: "The platform is designed around land acquisition, permitting, loans, construction, sales, property management, and audits instead of treating each department as a separate reporting problem.",
  },
  {
    icon: <GraduationCap size={22} />,
    title: "Client-owned stack",
    body: "Clients keep their code, warehouse, and hosting. KPI logic lives in the data model, not inside a vendor-locked dashboard layer.",
  },
  {
    icon: <MapPin size={22} />,
    title: "Built for 20-500+ homes per year",
    body: "The offering is sized for builders who have outgrown spreadsheets and disconnected modules, but do not want the cost and overhead of a large enterprise consulting team.",
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
              Built for builders who need <span className="text-gradient">better data infrastructure, not more noise.</span>
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-300 md:text-lg">
              A.D. Homes combines operational context, data engineering, cloud
              architecture, and application delivery in one engagement. The goal
              is straightforward: give residential builders access to the kind of
              operating intelligence national players spend far more to build.
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
