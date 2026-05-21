"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROCESO_ESTADOS } from "@/lib/db/procesos-schema";
import { cambiarEstado } from "@/app/(app)/compras/actions";
import { money } from "@/lib/format";
import type { ProcesoEstado } from "@/types/database";

const ESTADOS_COMPROMETIDOS: ReadonlyArray<ProcesoEstado> = [
  "Validado PACC",
  "Validado presupuesto",
  "Enviado a Tegucigalpa",
  "Observado",
  "Subsanado",
  "En proceso UCP",
  "Adjudicado",
  "Recibido",
];
const ESTADOS_EJECUTADOS: ReadonlyArray<ProcesoEstado> = ["Pagado", "Cerrado"];

type Categoria = "neutro" | "comprometido" | "ejecutado";

function categoria(e: ProcesoEstado): Categoria {
  if (ESTADOS_EJECUTADOS.includes(e)) return "ejecutado";
  if (ESTADOS_COMPROMETIDOS.includes(e)) return "comprometido";
  return "neutro";
}

function describirImpacto(
  origen: ProcesoEstado,
  destino: ProcesoEstado,
  monto: number,
): string | null {
  if (monto <= 0) return null;
  const cOrigen = categoria(origen);
  const cDestino = categoria(destino);
  if (cOrigen === cDestino) return null;
  const cantidad = money(monto);

  if (cOrigen === "neutro" && cDestino === "comprometido") {
    return `Entrarán ${cantidad} al comprometido (baja el disponible).`;
  }
  if (cOrigen === "neutro" && cDestino === "ejecutado") {
    return `${cantidad} se registrarán directamente como ejecutado (baja el disponible).`;
  }
  if (cOrigen === "comprometido" && cDestino === "ejecutado") {
    return `${cantidad} pasan de comprometido a ejecutado. El disponible no cambia.`;
  }
  if (cOrigen === "ejecutado" && cDestino === "comprometido") {
    return `${cantidad} vuelven de ejecutado a comprometido (reversión).`;
  }
  if (cOrigen === "comprometido" && cDestino === "neutro") {
    return `Salen ${cantidad} del comprometido (sube el disponible).`;
  }
  if (cOrigen === "ejecutado" && cDestino === "neutro") {
    return `Salen ${cantidad} del ejecutado (sube el disponible).`;
  }
  return null;
}

interface CambioEstadoFormProps {
  procesoId: number;
  estadoActual: ProcesoEstado;
  monto: number;
}

export function CambioEstadoForm({
  procesoId,
  estadoActual,
  monto,
}: CambioEstadoFormProps) {
  const router = useRouter();
  const [estado, setEstado] = useState<ProcesoEstado | "">("");
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const impacto =
    estado && estado !== estadoActual
      ? describirImpacto(estadoActual, estado, monto)
      : null;

  function submit() {
    setError(null);
    if (!estado) {
      setError("Selecciona el nuevo estado");
      return;
    }
    if (estado === estadoActual) {
      setError("El proceso ya está en ese estado");
      return;
    }
    if (comentario.trim().length < 3) {
      setError("El comentario es obligatorio (mínimo 3 caracteres)");
      return;
    }

    startTransition(async () => {
      const result = await cambiarEstado({
        proceso_id: procesoId,
        estado_nuevo: estado,
        comentario: comentario.trim(),
      });
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(`Estado cambiado a "${estado}"`);
      setEstado("");
      setComentario("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Nuevo estado</Label>
        <Select
          value={estado}
          onValueChange={(v) => setEstado(v as ProcesoEstado)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el estado al que pasa" />
          </SelectTrigger>
          <SelectContent>
            {PROCESO_ESTADOS.filter((e) => e !== estadoActual).map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {impacto && (
          <p className="text-xs text-primary bg-primary/5 border border-primary/20 rounded px-2 py-1">
            {impacto}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comentario">Comentario (obligatorio)</Label>
        <textarea
          id="comentario"
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={3}
          maxLength={500}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="¿Por qué cambia el estado? Esto queda en el historial inmutable."
        />
        <p className="text-xs text-muted-foreground text-right">
          {comentario.length}/500
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={submit} disabled={isPending} className="w-full">
        {isPending ? "Guardando…" : "Registrar cambio de estado"}
      </Button>
    </div>
  );
}
