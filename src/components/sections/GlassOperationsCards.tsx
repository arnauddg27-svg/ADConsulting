import { ArrowRight, Building2, Clock3, Hammer, LineChart } from "lucide-react";
import type { ComponentType } from "react";

import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";

interface GlassOperationsCardProps {
  title: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
  label: string;
  result: string;
  icon: ComponentType<{ className?: string; size?: number }>;
  tags: string[];
  className?: string;
}

const operationCards = [
  {
    title: "Catch slipping work early",
    excerpt:
      "A construction dashboard keeps stage dates, closeout blockers, crew follow-ups, and delayed starts in one daily pipeline.",
    image:
      "https://images.unsplash.com/photo-1692229079965-d3ae0e25f3f7?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=70&w=760",
    imageAlt: "Residential homes under construction on a jobsite",
    imagePosition: "center",
    label: "Construction",
    result: "Improve cycle time",
    icon: Hammer,
    tags: ["Stages", "Closeouts"],
  },
  {
    title: "Track cost movement by job",
    excerpt:
      "A finance dashboard ties budget changes, cost-to-complete movement, draws, and variance flags back to the jobs that need attention.",
    image:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=70&w=760",
    imageAlt: "Finance review with reports and a laptop",
    imagePosition: "center 42%",
    label: "Finance",
    result: "Control cost",
    icon: LineChart,
    tags: ["Variance", "Draws"],
  },
  {
    title: "One daily operating picture",
    excerpt:
      "Leadership sees KPIs, owners, next actions, and pipeline health without waiting for another spreadsheet rollup.",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=70&w=760",
    imageAlt: "Leadership team reviewing operating priorities together",
    imagePosition: "center 48%",
    label: "Leadership",
    result: "Faster decisions",
    icon: Building2,
    tags: ["KPIs", "Owners"],
  },
];

function GlassOperationsCard({
  title,
  excerpt,
  image,
  imageAlt,
  imagePosition = "center",
  label,
  result,
  icon: Icon,
  tags,
  className,
}: GlassOperationsCardProps) {
  return (
    <article className={cn("group h-full", className)}>
      <div className="relative h-full overflow-hidden rounded-[1.5rem] border border-[#d4dee4] bg-gradient-to-br from-white/92 to-[#eef4f7]/78 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_30px_88px_-68px_rgba(23,33,44,0.5)] backdrop-blur-xl backdrop-saturate-[140%] transition duration-300 hover:-translate-y-1 hover:border-[#9eb6c8] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.95),0_40px_110px_-72px_rgba(23,33,44,0.6)]">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={image}
            alt={imageAlt}
            width={760}
            height={475}
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 33vw, 100vw"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
            style={{ objectPosition: imagePosition }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,17,27,0.02)_0%,rgba(8,17,27,0.56)_100%)] transition duration-300 group-hover:bg-[linear-gradient(180deg,rgba(8,17,27,0)_0%,rgba(8,17,27,0.44)_100%)]" />
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/[0.28] bg-white/[0.72] px-3 py-2 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[#17212c] shadow-[0_14px_32px_-24px_rgba(23,33,44,0.8)] backdrop-blur-md">
            <Icon size={15} className="text-[#2f5368]" />
            {label}
          </div>
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/[0.26] bg-[#17212c]/[0.58] px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="relative p-5">
          <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[#9eb6c8]/60 to-transparent" />
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-bold leading-tight tracking-[-0.02em] text-[#17212c]">
              {title}
            </h3>
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d6e0e5] bg-[#f8fafc] text-[#2f5368] transition group-hover:border-[#9eb6c8] group-hover:bg-white">
              <ArrowRight size={16} />
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#58636b]">{excerpt}</p>
          <div className="mt-5 flex items-center justify-between border-t border-[#dce4e8] pt-4">
            <div className="flex items-center gap-2 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-[#2f5368]">
              <Clock3 size={14} />
              Department view
            </div>
            <span className="rounded-full bg-[#edf5f1] px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#285d47]">
              {result}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function GlassOperationsCards() {
  return (
    <section className="defer-section relative overflow-hidden border-b border-[#d9e1e6]/75 bg-transparent py-16 md:py-24">
      <Container className="relative z-10">
        <div className="mx-auto mb-9 max-w-3xl text-center">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#2f5368]">
            Used across departments
          </p>
          <h2 className="mt-4 font-heading text-4xl leading-[1.02] tracking-[-0.04em] text-[#17212c] md:text-6xl">
            One dashboard foundation, different department views.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#58636b]">
            Construction, finance, and leadership are shown here as examples:
            each team gets the KPIs, pipeline, and next actions that matter to
            their part of the work.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {operationCards.map((card) => (
            <GlassOperationsCard key={card.title} {...card} />
          ))}
        </div>
      </Container>
    </section>
  );
}
