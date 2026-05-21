import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { money } from "@/lib/format";
import type { PaccLineExecution } from "@/lib/db/pacc";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

interface PaccExecutionCardProps {
  execution: PaccLineExecution;
}

export function PaccExecutionCard({ execution }: PaccExecutionCardProps) {
  const { planeado, comprometido, ejecutado, disponible_linea, pct_ejecucion } =
    execution;

  // Clasificación visual: ≥100% excede el planeado, ≥80% atención, resto normal.
  const overrun = pct_ejecucion >= 100;
  const warning = !overrun && pct_ejecucion >= 80;
  const pctClamped = Math.min(100, pct_ejecucion);

  const barColor = overrun
    ? "bg-destructive"
    : warning
      ? "bg-amber-500"
      : "bg-primary";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Ejecución de la línea</span>
          {overrun ? (
            <Badge variant="destructive" className="font-normal">
              <AlertTriangle className="mr-1 h-3.5 w-3.5" />
              Excede planeado
            </Badge>
          ) : warning ? (
            <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-normal">
              <Clock className="mr-1 h-3.5 w-3.5" />
              Cerca del límite
            </Badge>
          ) : pct_ejecucion === 0 ? (
            <Badge variant="outline" className="font-normal">
              Sin movimientos
            </Badge>
          ) : (
            <Badge className="bg-emerald-100 text-emerald-900 border-emerald-300 font-normal">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              En curso
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <span className="text-sm text-muted-foreground">
              {pct_ejecucion.toFixed(1)}% del valor planeado utilizado
            </span>
            <span className="text-xs text-muted-foreground">
              {execution.procesos_count} proceso
              {execution.procesos_count === 1 ? "" : "s"}
            </span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all ${barColor}`}
              style={{ width: `${pctClamped}%` }}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Planeado" value={planeado} variant="muted" />
          <Metric
            label="Comprometido"
            value={comprometido}
            variant="primary"
          />
          <Metric label="Ejecutado" value={ejecutado} variant="success" />
          <Metric
            label="Disponible de la línea"
            value={disponible_linea}
            variant={disponible_linea < 0 ? "danger" : "muted"}
          />
        </div>

        {overrun && (
          <p className="text-xs text-destructive border border-destructive/30 bg-destructive/5 rounded px-2 py-1.5">
            Los procesos asociados a esta línea superan el valor planeado en{" "}
            <strong>{money(Math.abs(disponible_linea))}</strong>. Revisar
            disponibilidad presupuestaria antes de avanzar más procesos.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: "muted" | "primary" | "success" | "danger";
}) {
  const colors = {
    muted: "text-foreground",
    primary: "text-primary",
    success: "text-emerald-700",
    danger: "text-destructive",
  };
  return (
    <div className="space-y-0.5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`text-base font-semibold tabular-nums ${colors[variant]}`}>
        {money(value)}
      </p>
    </div>
  );
}
