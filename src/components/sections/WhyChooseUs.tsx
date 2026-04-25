import {
  Building2,
  GraduationCap,
  Wrench,
  MapPin,
} from "lucide-react";
import Container from "@/components/ui/Container";
import { TiltCard } from "@/components/ui/TiltCard";

const reasons = [
  {
    icon: <Building2 size={22} />,
    title: "Real estate + homebuilding experience",
    body: "The team comes from residential development and homebuilding operations. We know which KPIs matter to land, construction, sales, and finance — without you having to spell it out.",
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
    <section className="section-space relative overflow-hidden">
      {/* subtle accent glow behind section */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-accent-500/[0.06] blur-[120px]"
      />
      <Container>
        <div className="reveal grid gap-12 lg:grid-cols-[0.42fr_0.58fr] lg:items-center lg:gap-16">
          <div>
            <span className="eyebrow eyebrow-dot">Why Us</span>
            <h2 className="mt-6 max-w-lg font-heading text-4xl leading-[0.98] tracking-[-0.015em] text-slate-50 md:text-[3.4rem]">
              Why homebuilders{" "}
              <span className="text-gradient">choose this model.</span>
            </h2>
            <p className="mt-6 text-base leading-7 text-slate-300 md:text-[1.05rem] md:leading-8">
              The approach is focused on clarity and ownership: one centralized
              data foundation, reporting built for builder workflows, and tools
              teams can use to run operations with better visibility.
            </p>

            <div className="mt-8 flex items-center gap-4 text-[0.72rem] uppercase tracking-[0.2em] text-slate-500">
              <span className="divider-glow flex-1" />
              <span>Delivery in 4–8 weeks</span>
            </div>
          </div>

          <div className="reveal-stagger grid gap-4 sm:grid-cols-2">
            {reasons.map((item, idx) => (
              <TiltCard
                key={item.title}
                tiltLimit={6}
                scale={1.02}
                spotlight={false}
                className="reveal h-full rounded-2xl"
              >
                <div className="glow-card relative flex h-full flex-col p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent-400/25 bg-gradient-to-br from-accent-500/15 to-accent-500/[0.02] text-accent-200">
                      {item.icon}
                    </div>
                    <span className="font-space-grotesk text-[0.62rem] uppercase tracking-[0.24em] text-slate-500">
                      0{idx + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 text-[1.02rem] font-semibold leading-tight text-slate-100">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-[0.88rem] leading-6 text-slate-400">
                    {item.body}
                  </p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
