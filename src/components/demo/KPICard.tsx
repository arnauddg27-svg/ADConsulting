import { clsx } from "clsx";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
  progress?: number;
}

export default function KPICard({
  label,
  value,
  change,
  trend = "neutral",
  subtitle,
  progress,
}: KPICardProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-5">
      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">
        {value}
      </div>

      {progress !== undefined && (
        <div className="mt-4 h-1.5 w-full rounded-full bg-white/[0.06]">
          <div
            className="h-1.5 rounded-full bg-accent-400"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {(change || subtitle) && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {change && (
            <span
              className={clsx(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1",
                trend === "up" && "bg-emerald-500/15 text-emerald-400",
                trend === "down" && "bg-red-500/15 text-red-400",
                trend === "neutral" && "bg-white/[0.05] text-slate-400"
              )}
            >
              {trend === "up" && <TrendingUp size={13} />}
              {trend === "down" && <TrendingDown size={13} />}
              {trend === "neutral" && <Minus size={13} />}
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
