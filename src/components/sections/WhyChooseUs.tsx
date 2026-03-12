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
    title: "Builder-side experience",
    body: "Hands-on experience inside a Central Florida builder across purchasing, underwriting, reporting, and operations.",
  },
  {
    icon: <Wrench size={22} />,
    title: "Implementation, not advice",
    body: "Dashboards get built, ERP workflows get cleaned up, processes get tightened, and teams get trained.",
  },
  {
    icon: <GraduationCap size={22} />,
    title: "Finance and operations rigor",
    body: "Finance training backed by real underwriting, investment, and operating experience.",
  },
  {
    icon: <MapPin size={22} />,
    title: "Orlando & Central Florida context",
    body: "Local knowledge of permitting, subcontractor coordination, seasonal pressure, and Central Florida market realities.",
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
              Built from real builder-side experience.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-300 md:text-lg">
              Practical help across finance, systems, and operations, grounded
              in direct builder-side experience.
            </p>
          </div>

          <div className="reveal-stagger grid gap-4 sm:grid-cols-2">
            {reasons.map((item) => (
              <div key={item.title} className="reveal glow-card p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-400/20 bg-accent-500/10 text-accent-200 transition-all duration-300 group-hover:shadow-[0_0_20px_-4px_rgba(52,211,153,0.3)]">
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
