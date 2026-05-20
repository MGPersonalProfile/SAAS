import { AlertTriangle, CircleAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { money, percent } from "@/lib/format";

interface BudgetHealthProps {
  presupuestoVigente: number;
  disponibleReal: number;
  disponibleSiafi: number;
}

export function BudgetHealth({
  presupuestoVigente,
  disponibleReal,
  disponibleSiafi,
}: BudgetHealthProps) {
  if (presupuestoVigente <= 0) return null;

  const disponibleRealPct = (disponibleReal / presupuestoVigente) * 100;
  const ejecutadoSiafiPct =
    ((presupuestoVigente - disponibleSiafi) / presupuestoVigente) * 100;

  let level: "ok" | "watch" | "critical";
  let label: string;
  let detail: string;
  let Icon = ShieldCheck;

  if (disponibleRealPct < 15) {
    level = "critical";
    label = "Agotamiento crítico";
    detail = `Solo queda ${disponibleRealPct.toFixed(1)}% de disponible real. Suspender nuevos compromisos no urgentes.`;
    Icon = AlertTriangle;
  } else if (disponibleRealPct < 30) {
    level = "watch";
    label = "Disponible bajo";
    detail = `Queda ${disponibleRealPct.toFixed(1)}% de disponible real. Priorizar procesos críticos.`;
    Icon = CircleAlert;
  } else {
    level = "ok";
    label = "Presupuesto saludable";
    detail = `${disponibleRealPct.toFixed(1)}% disponible real · ${ejecutadoSiafiPct.toFixed(1)}% ejecutado SIAFI.`;
    Icon = ShieldCheck;
  }

  const colors = {
    ok: "border-emerald-300 bg-emerald-50 text-emerald-900",
    watch: "border-amber-300 bg-amber-50 text-amber-900",
    critical: "border-red-300 bg-red-50 text-red-900",
  };

  const iconColors = {
    ok: "text-emerald-700",
    watch: "text-amber-700",
    critical: "text-red-700",
  };

  return (
    <Card className={cn("border-2", colors[level])}>
      <CardContent className="flex items-start gap-3 pt-6">
        <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", iconColors[level])} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-xs mt-1 opacity-90">{detail}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3 text-xs">
            <Cell
              label="Vigente"
              value={money(presupuestoVigente)}
            />
            <Cell
              label="Disponible real"
              value={money(disponibleReal)}
              hint={percent(disponibleReal, presupuestoVigente)}
            />
            <Cell
              label="Ejecutado SIAFI"
              value={money(presupuestoVigente - disponibleSiafi)}
              hint={percent(presupuestoVigente - disponibleSiafi, presupuestoVigente)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Cell({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded bg-white/60 px-2 py-1">
      <p className="text-[10px] uppercase opacity-70">{label}</p>
      <p className="font-mono text-xs font-medium">{value}</p>
      {hint && <p className="text-[10px] opacity-70">{hint}</p>}
    </div>
  );
}
