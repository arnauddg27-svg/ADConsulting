"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { costBreakdown } from "@/lib/mock-data";
import type { DashboardFilters } from "@/types";

const total = costBreakdown.reduce((sum, item) => sum + item.value, 0);

interface CostBreakdownChartProps {
  filters: DashboardFilters;
  onFilterToggle: (key: keyof DashboardFilters, value: string) => void;
}

export default function CostBreakdownChart({ filters, onFilterToggle }: CostBreakdownChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-5">
      <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Cost Breakdown
      </h3>
      <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="h-52 w-full max-w-[14rem] shrink-0">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={({ category }: { category: string }) =>
                    filters.costCategory === category ? 92 : 86
                  }
                  paddingAngle={2}
                  style={{ cursor: "pointer" }}
                  onClick={(_, index) => {
                    onFilterToggle("costCategory", costBreakdown[index].category);
                  }}
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      opacity={filters.costCategory && filters.costCategory !== entry.category ? 0.2 : 1}
                      style={{ transition: "opacity 0.3s ease" }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`$${(Number(value) / 1000000).toFixed(2)}M`]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "#0d1321",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center">
              <div className="h-36 w-36 rounded-full border-[18px] border-accent-400/40 border-r-emerald-500/50 border-b-slate-300/40 border-l-indigo-500/40" />
            </div>
          )}
        </div>
        <div className="space-y-2.5">
          {costBreakdown.map((category) => (
            <button
              key={category.category}
              onClick={() => onFilterToggle("costCategory", category.category)}
              className={clsx(
                "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                filters.costCategory === category.category
                  ? "border-accent-400/30 bg-accent-500/10"
                  : "border-white/[0.05] bg-white/[0.02] hover:border-white/[0.1]",
                filters.costCategory && filters.costCategory !== category.category && "opacity-40"
              )}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
              <div>
                <div className="text-sm font-medium text-slate-100">{category.category}</div>
                <div className="text-xs text-slate-400">
                  ${(category.value / 1000000).toFixed(2)}M ({((category.value / total) * 100).toFixed(0)}%)
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
