"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { budgetData } from "@/lib/mock-data";

export default function BudgetVarianceChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-5">
      <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Budget vs. Actual Spend
      </h3>
      <div className="mt-5 h-64">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={budgetData} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="month"
                fontSize={11}
                tick={{ fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                fontSize={11}
                tick={{ fill: "#64748b" }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [`$${(Number(value) / 1000).toFixed(0)}K`]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "#0d1321",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
              <Area
                type="monotone"
                dataKey="planned"
                name="Planned"
                stroke="#94a3b8"
                fill="#94a3b8"
                fillOpacity={0.08}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke="#34d399"
                fill="#34d399"
                fillOpacity={0.12}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full grid-cols-12 items-end gap-2">
            {[48, 60, 56, 72, 68, 80, 74, 83, 70, 88, 66, 59].map((height) => (
              <div key={height} className="rounded-t-lg bg-accent-400/40" style={{ height: `${height}%` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
