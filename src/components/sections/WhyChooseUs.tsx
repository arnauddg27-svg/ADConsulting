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
    title: "1,000+ homes of builder-side experience",
    body: "Purchasing, scheduling, system implementations, vendor management — across 1,200+ lots at a Central Florida production builder. Not theory. Lived operations.",
  },
  {
    icon: <Wrench size={22} />,
    title: "We build systems, not slide decks",
    body: "You get a working operating system — automated data flows, functional applications, and tools your team uses daily. Not a PowerPoint with recommendations.",
  },
  {
    icon: <GraduationCap size={22} />,
    title: "Finance + technology depth",
    body: "MBA-trained in finance and operations/technology. We bridge the gap between financial analysis and system implementation that most consultants can't.",
  },
  {
    icon: <MapPin size={22} />,
    title: "Built for 25–300 home/year builders",
    body: "Big consultancies don't serve your segment. We're built specifically for builders who have outgrown spreadsheets but don't need enterprise overhead.",
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
              Not another consultant.{" "}
              <span className="text-gradient">A builder who builds systems.</span>
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-300 md:text-lg">
              We don&apos;t audit your operation and hand you a report. We
              extract your data, centralize it, and build the tools your
              team needs to execute — then stay on to keep it running.
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
