"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { money, moneyCompact } from "@/lib/format";

interface ModalidadChartProps {
  data: { modalidad: string; monto: number; count: number }[];
}

const COLORS = [
  "hsl(206 80% 35%)",
  "hsl(173 58% 39%)",
  "hsl(27 87% 50%)",
  "hsl(43 74% 55%)",
  "hsl(340 65% 50%)",
  "hsl(265 60% 50%)",
  "hsl(120 40% 40%)",
  "hsl(0 0% 50%)",
];

export function ModalidadChart({ data }: ModalidadChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No hay procesos vinculados a líneas PACC todavía.
      </p>
    );
  }

  // Agrupa modalidades pequeñas en "Otras" para no saturar el gráfico.
  const TOP = 6;
  const sorted = [...data].sort((a, b) => b.monto - a.monto);
  const top = sorted.slice(0, TOP);
  const rest = sorted.slice(TOP);
  const items = [...top];
  if (rest.length > 0) {
    items.push({
      modalidad: `Otras (${rest.length})`,
      monto: rest.reduce((s, r) => s + r.monto, 0),
      count: rest.reduce((s, r) => s + r.count, 0),
    });
  }

  const totalMonto = items.reduce((s, r) => s + r.monto, 0);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={items}
            dataKey="monto"
            nameKey="modalidad"
            cx="40%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
          >
            {items.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--popover)",
              border: "1px solid var(--border)",
              color: "var(--popover-foreground)",
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={(value, _name, entry) => {
              const v = Number(value ?? 0);
              const count = (entry?.payload as { count?: number })?.count ?? 0;
              const pct = totalMonto > 0 ? (v / totalMonto) * 100 : 0;
              return [
                `${money(v)} · ${pct.toFixed(1)}% · ${count} procesos`,
                "",
              ];
            }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{ fontSize: 11, lineHeight: "1.4" }}
            formatter={(value, entry) => {
              const monto = (entry?.payload as { monto?: number })?.monto ?? 0;
              return (
                <span className="text-foreground">
                  {value} <span className="text-muted-foreground">({moneyCompact(monto)})</span>
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
