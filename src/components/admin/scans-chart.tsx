"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate } from "@/lib/utils";

interface ScansChartProps {
  data: { date: string; scans: number }[];
  locale?: string;
}

export function ScansChart({ data, locale = "en-US" }: ScansChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.55} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => formatDate(value, locale)}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          minTickGap={28}
        />
        <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickLine={false} axisLine={false} width={36} />
        <Tooltip
          cursor={{ stroke: "var(--primary)", strokeWidth: 1, strokeDasharray: "4 4" }}
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            fontSize: 12,
            color: "var(--popover-foreground)",
          }}
          labelFormatter={(value: string) => formatDate(value, locale)}
        />
        <Area type="monotone" dataKey="scans" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#scansGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
