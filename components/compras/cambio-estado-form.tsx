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
import type { ProcesoEstado } from "@/types/database";

interface CambioEstadoFormProps {
  procesoId: number;
  estadoActual: ProcesoEstado;
}

export function CambioEstadoForm({
  procesoId,
  estadoActual,
}: CambioEstadoFormProps) {
  const router = useRouter();
  const [estado, setEstado] = useState<ProcesoEstado | "">("");
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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
