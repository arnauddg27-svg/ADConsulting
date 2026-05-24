import { CalendarDays, DollarSign, UserCheck, type LucideIcon } from "lucide-react";
import { ShineBorder } from "@/components/magicui/shine-border";

const heroDashboardItems: Array<{
  label: string;
  detail: string;
  icon: LucideIcon;
}> = [
  {
    label: "Schedule drift",
    detail: "Delayed stages and closeout blockers",
    icon: CalendarDays,
  },
  {
    label: "Cost movement",
    detail: "Budget changes and cost-to-complete risk",
    icon: DollarSign,
  },
  {
    label: "Owner follow-up",
    detail: "Next action tied to an owner, date, and department",
    icon: UserCheck,
  },
];

const heroConstructionStats = [
  { label: "Stage risk", value: "11", unit: "jobs behind" },
  { label: "Cost variance", value: "$284K", unit: "flagged" },
  { label: "Owner actions", value: "38", unit: "due now" },
];

// LCP hero photo. `auto=format` lets Unsplash negotiate WebP/AVIF; the srcSet
// lets phones pull a right-sized file instead of the full 1100px desktop one.
const HERO_IMG_BASE =
  "https://images.unsplash.com/photo-1692229079965-d3ae0e25f3f7?auto=format&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=78";
const HERO_IMG_SRCSET = [640, 900, 1100, 1400]
  .map((w) => `${HERO_IMG_BASE}&w=${w} ${w}w`)
  .join(", ");
const HERO_IMG_SIZES = "(min-width: 1024px) 736px, 100vw";

/**
 * The dark "Construction Operations Dashboard" hero card — a residential
 * jobsite photo with an operating-signals overlay (stage risk, cost variance,
 * owner actions) and a "Today's flags" panel. Shared by the homepage hero and
 * the builder-data-platform landing page.
 */
export default function OperationsHeroCard({
  className = "",
}: {
  className?: string;
}) {
  return (
    <ShineBorder
      borderRadius={36}
      borderWidth={3}
      duration={8}
      color={["#24c18d", "#8bd7ff", "#24c18d"]}
      className={`mx-auto max-w-[46rem] ${className}`}
    >
      <div className="relative min-h-[34rem] overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#17212c] text-white shadow-[0_18px_48px_-36px_rgba(23,33,44,0.42)]">
        <img
          src={`${HERO_IMG_BASE}&w=1100`}
          srcSet={HERO_IMG_SRCSET}
          sizes={HERO_IMG_SIZES}
          alt="Residential homes under construction on a jobsite"
          width={1100}
          height={900}
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          style={{ objectPosition: "center" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,18,28,0.18)_0%,rgba(10,18,28,0.62)_48%,rgba(8,13,20,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.18),transparent_28%)]" />

        <div className="relative flex min-h-[34rem] flex-col justify-between p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="rounded-full border border-white/[0.24] bg-white/[0.72] px-3 py-2 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[#17212c] shadow-[0_14px_32px_-24px_rgba(23,33,44,0.8)] backdrop-blur-md">
              Residential jobsite view
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#66d9b2]/[0.36] bg-[#07111b]/[0.68] px-3 py-2 text-[0.58rem] font-bold uppercase tracking-[0.16em] text-[#b8f5df] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#66d9b2]" />
              Data sync healthy
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_18rem] lg:items-end">
            <div>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[#cce6f4]">
                Construction operations dashboard
              </p>
              <h3 className="mt-3 max-w-xl text-4xl font-bold leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl">
                Track every job from permit to closing.
              </h3>
              <p className="mt-4 max-w-lg text-sm font-semibold leading-6 text-white/[0.72]">
                Stage dates, cost movement, and owner follow-up stay connected
                to the jobsite work your team is trying to move every day.
              </p>

              <div className="mt-5 grid grid-cols-3 gap-1.5 sm:gap-2">
                {heroConstructionStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="relative overflow-hidden rounded-2xl border border-white/[0.14] bg-gradient-to-b from-[#0c1a28]/75 to-[#060d16]/85 p-3.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_22px_46px_-30px_rgba(0,0,0,0.95)] backdrop-blur-xl transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-[#8bd7ff]/40 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_28px_56px_-28px_rgba(0,0,0,0.95),0_0_22px_-6px_rgba(139,215,255,0.4)]"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#24c18d]/0 via-[#8bd7ff]/70 to-[#24c18d]/0"
                    />
                    <p className="text-[0.5rem] font-bold uppercase tracking-[0.18em] text-white/[0.6]">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-xl font-bold leading-none tracking-[-0.02em] text-white sm:text-2xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[0.56rem] font-semibold uppercase tracking-[0.12em] text-[#8bd7ff]/75">
                      {stat.unit}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.35rem] border border-white/[0.16] bg-[#07111b]/[0.72] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_60px_-42px_rgba(0,0,0,0.78)] backdrop-blur-md">
              <p className="text-[0.58rem] font-bold uppercase tracking-[0.2em] text-[#8bd8f7]">
                Today&apos;s flags
              </p>
              <div className="mt-4 space-y-3">
                {heroDashboardItems.map(({ label, detail, icon: ItemIcon }) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#66d9b2]/[0.2] bg-[#66d9b2]/[0.1] text-[#9ee7c9]">
                      <ItemIcon size={16} />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-white">
                        {label}
                      </span>
                      <span className="mt-0.5 block text-xs font-semibold leading-5 text-white/[0.52]">
                        {detail}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ShineBorder>
  );
}
