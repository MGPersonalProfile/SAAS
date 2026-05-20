"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { moneyCompact, money } from "@/lib/format";

interface BudgetChartProps {
  data: { concepto: string; monto: number }[];
}

const COLORS = [
  "hsl(206 80% 35%)", // primary
  "hsl(173 58% 39%)", // teal
  "hsl(27 87% 50%)", // orange
  "hsl(43 74% 55%)", // yellow
  "hsl(340 65% 50%)", // pink
];

export function BudgetChart({ data }: BudgetChartProps) {
  const items = data.map((d) => ({
    name: d.concepto.length > 22 ? d.concepto.slice(0, 22) + "…" : d.concepto,
    fullName: d.concepto,
    monto: Number(d.monto || 0),
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={items}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="color-mix(in oklab, var(--border) 40%, transparent)" />
          <XAxis
            type="number"
            tickFormatter={(v) => moneyCompact(v)}
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "color-mix(in oklab, var(--accent) 30%, transparent)" }}
            contentStyle={{
              backgroundColor: "var(--popover)",
              border: "1px solid var(--border)",
              color: "var(--popover-foreground)",
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={(value) => [money(Number(value)), "Monto"]}
            labelFormatter={(_, payload) =>
              (payload?.[0]?.payload as { fullName?: string })?.fullName ?? ""
            }
          />
          <Bar dataKey="monto" radius={[0, 6, 6, 0]}>
            {items.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
