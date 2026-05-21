"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { money, moneyCompact } from "@/lib/format";

interface ExecutionTimelineChartProps {
  data: { mes: string; ejecutado: number }[];
}

const MES_CORTO = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function formatMes(mes: string): string {
  const [year, month] = mes.split("-");
  const idx = Number(month) - 1;
  if (idx < 0 || idx > 11) return mes;
  return `${MES_CORTO[idx]} ${year.slice(2)}`;
}

export function ExecutionTimelineChart({ data }: ExecutionTimelineChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Aún no hay procesos marcados como Pagados. La línea temporal se llenará
        a medida que avance la ejecución.
      </p>
    );
  }

  // Calcula también el acumulado para mostrar el progreso total.
  let acc = 0;
  const items = data.map((d) => {
    acc += d.ejecutado;
    return {
      mes: formatMes(d.mes),
      ejecutado: d.ejecutado,
      acumulado: acc,
    };
  });

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={items}
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
        >
          <defs>
            <linearGradient id="execGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(206 80% 35%)" stopOpacity={0.6} />
              <stop offset="100%" stopColor="hsl(206 80% 35%)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="color-mix(in oklab, var(--border) 40%, transparent)"
          />
          <XAxis
            dataKey="mes"
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(v) => moneyCompact(v)}
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--popover)",
              border: "1px solid var(--border)",
              color: "var(--popover-foreground)",
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={(value, name) => [
              money(Number(value ?? 0)),
              name === "ejecutado" ? "Ejecutado en el mes" : "Acumulado",
            ]}
          />
          <Area
            type="monotone"
            dataKey="ejecutado"
            stroke="hsl(206 80% 35%)"
            strokeWidth={2}
            fill="url(#execGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
