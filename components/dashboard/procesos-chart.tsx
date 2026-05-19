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
import type { ProcesoEstado } from "@/types/database";

interface ProcesosChartProps {
  data: { estado: ProcesoEstado; count: number }[];
}

const COLOR_BY_ESTADO: Record<string, string> = {
  "Solicitud creada": "hsl(206 80% 50%)",
  "Validado PACC": "hsl(206 70% 55%)",
  "Validado presupuesto": "hsl(173 58% 45%)",
  "Enviado a Tegucigalpa": "hsl(43 74% 55%)",
  Observado: "hsl(0 70% 55%)",
  Subsanado: "hsl(27 87% 55%)",
  "En proceso UCP": "hsl(280 65% 60%)",
  Adjudicado: "hsl(140 60% 45%)",
  Recibido: "hsl(160 60% 45%)",
  Pagado: "hsl(120 50% 40%)",
  Cerrado: "hsl(210 10% 50%)",
};

export function ProcesosChart({ data }: ProcesosChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Aún no hay procesos creados.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.4)" vertical={false} />
          <XAxis
            dataKey="estado"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11 }}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={60}
          />
          <YAxis
            allowDecimals={false}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--accent) / 0.3)" }}
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={(value) => [Number(value), "Procesos"]}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={COLOR_BY_ESTADO[d.estado] ?? "hsl(206 80% 35%)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
