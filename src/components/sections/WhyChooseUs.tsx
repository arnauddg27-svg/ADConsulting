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
    title: "Builder-specific data scope",
    body: "We design around residential builder workflows, not generic reporting templates.",
  },
  {
    icon: <Wrench size={22} />,
    title: "Connected reporting coverage",
    body: "Land, development, permitting, lending and draws, construction, sales, and portfolio reporting in one system.",
  },
  {
    icon: <GraduationCap size={22} />,
    title: "Client ownership by default",
    body: "Code, warehouse, hosting, and data stay in your accounts so your team keeps full control.",
  },
  {
    icon: <MapPin size={22} />,
    title: "Practical delivery model",
    body: "Direct senior involvement, phased delivery, and a faster path from discovery to working reporting.",
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
              Why homebuilders <span className="text-gradient">choose this model.</span>
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-300 md:text-lg">
              The approach is focused on clarity and ownership: one centralized
              data foundation, reporting built for builder workflows, and tools
              teams can use to run operations with better visibility.
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
