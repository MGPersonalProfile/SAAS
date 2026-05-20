import { cn } from "@/lib/utils";
import type { ProcesoEstado, ProcesoPrioridad } from "@/types/database";

const ESTADO_COLORS: Record<ProcesoEstado, string> = {
  "Solicitud creada": "bg-slate-100 text-slate-700 border-slate-200",
  "Validado PACC": "bg-sky-100 text-sky-700 border-sky-200",
  "Validado presupuesto": "bg-teal-100 text-teal-700 border-teal-200",
  "Enviado a Tegucigalpa": "bg-amber-100 text-amber-700 border-amber-200",
  Observado: "bg-red-100 text-red-700 border-red-200",
  Subsanado: "bg-orange-100 text-orange-700 border-orange-200",
  "En proceso UCP": "bg-purple-100 text-purple-700 border-purple-200",
  Adjudicado: "bg-green-100 text-green-700 border-green-200",
  Recibido: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Pagado: "bg-emerald-200 text-emerald-800 border-emerald-300",
  Cerrado: "bg-gray-200 text-gray-700 border-gray-300",
};

const PRIORIDAD_COLORS: Record<ProcesoPrioridad, string> = {
  Normal: "bg-slate-100 text-slate-700 border-slate-200",
  Media: "bg-amber-100 text-amber-700 border-amber-200",
  Alta: "bg-red-100 text-red-700 border-red-200",
};

export function EstadoBadge({ estado }: { estado: ProcesoEstado }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        ESTADO_COLORS[estado],
      )}
    >
      {estado}
    </span>
  );
}

export function PrioridadBadge({ prioridad }: { prioridad: ProcesoPrioridad }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        PRIORIDAD_COLORS[prioridad],
      )}
    >
      {prioridad}
    </span>
  );
}
