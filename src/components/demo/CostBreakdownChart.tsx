"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { costBreakdown } from "@/lib/mock-data";

const total = costBreakdown.reduce((sum, item) => sum + item.value, 0);

export default function CostBreakdownChart() {
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
                  outerRadius={86}
                  paddingAngle={2}
                >
                  {costBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
            <div key={category.category} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
              <div>
                <div className="text-sm font-medium text-slate-100">{category.category}</div>
                <div className="text-xs text-slate-400">
                  ${(category.value / 1000000).toFixed(2)}M ({((category.value / total) * 100).toFixed(0)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
