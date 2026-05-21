"use client";

import Link from "next/link";
import { money, moneyCompact } from "@/lib/format";

interface TopPaccChartProps {
  data: {
    pacc_id: number;
    linea: string;
    descripcion: string | null;
    planeado: number;
    ejecutado: number;
    pct: number;
  }[];
}

export function TopPaccChart({ data }: TopPaccChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Aún no hay procesos pagados con línea PACC vinculada.
      </p>
    );
  }

  const maxEjecutado = Math.max(...data.map((d) => d.ejecutado));

  return (
    <div className="space-y-3">
      {data.map((row) => {
        const widthPct = maxEjecutado > 0 ? (row.ejecutado / maxEjecutado) * 100 : 0;
        const overrun = row.pct >= 100;
        return (
          <Link
            key={row.pacc_id}
            href={`/pacc/${row.pacc_id}`}
            className="block group"
          >
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground shrink-0">
                {row.linea}
              </span>
              <span className="text-xs truncate flex-1 text-foreground group-hover:text-primary transition">
                {row.descripcion ?? "—"}
              </span>
              <span className="text-xs font-semibold tabular-nums shrink-0">
                {moneyCompact(row.ejecutado)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all ${
                    overrun ? "bg-destructive" : "bg-primary"
                  }`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
              <span
                className={`text-xs tabular-nums shrink-0 w-12 text-right ${
                  overrun ? "text-destructive font-medium" : "text-muted-foreground"
                }`}
                title={`Ejecutado ${money(row.ejecutado)} de planeado ${money(row.planeado)}`}
              >
                {row.pct.toFixed(0)}%
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
