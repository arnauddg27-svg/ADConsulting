"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { projects } from "@/lib/mock-data";

const statusColors: Record<string, string> = {
  "on-track": "#10b981",
  "at-risk": "#34d399",
  behind: "#ef4444",
};

const chartData = projects.map((project) => ({
  name: project.name.split(" - ")[0],
  complete: project.percentComplete,
  status: project.status,
}));

export default function ProjectProgressChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-5">
      <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Project Progress by Community
      </h3>
      <div className="mt-5 h-64">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                fontSize={11}
                tick={{ fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                fontSize={11}
                tick={{ fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Percent complete"]}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "#0d1321",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="complete" radius={[0, 6, 6, 0]} barSize={18}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={statusColors[entry.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-end gap-3">
            {[72, 58, 43, 88, 66].map((height) => (
              <div key={height} className="flex flex-1 items-end rounded-full bg-white/[0.03] p-1">
                <div
                  className="w-full rounded-full bg-accent-400/50"
                  style={{ height: `${height}%` }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> On track
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent-400" /> At risk
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500" /> Behind
        </div>
      </div>
    </div>
  );
}
