"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROCESO_ESTADOS,
  PROCESO_PRIORIDADES,
  procesoSchema,
  type ProcesoInput,
} from "@/lib/db/procesos-schema";
import { createProceso, updateProceso } from "@/app/(app)/compras/actions";
import { suggestModalidad, detectarUmbralCercano } from "@/lib/procurement";
import type { Tables } from "@/types/database";

interface ProcesoFormProps {
  initial?: Tables<"procesos"> | null;
}

export function ProcesoForm({ initial }: ProcesoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = !!initial;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProcesoInput>({
    resolver: zodResolver(procesoSchema),
    defaultValues: initial
      ? {
          codigo: initial.codigo,
          linea_pacc: initial.linea_pacc ?? "",
          objeto: initial.objeto ?? "",
          descripcion: initial.descripcion ?? "",
          monto: Number(initial.monto),
          estado: initial.estado,
          responsable: initial.responsable ?? "",
          prioridad: initial.prioridad,
        }
      : {
          codigo: "",
          linea_pacc: "",
          objeto: "",
          descripcion: "",
          monto: 0,
          estado: "Solicitud creada",
          responsable: "",
          prioridad: "Normal",
        },
  });

  const prioridad = watch("prioridad");
  const estado = watch("estado");
  const monto = watch("monto");
  const modalidadSugerida = suggestModalidad(Number(monto || 0));
  const alertaUmbral = detectarUmbralCercano(Number(monto || 0));

  // Impacto previsto sobre el balance (solo en alta de procesos; al editar el
  // estado no cambia desde este formulario).
  const ESTADOS_COMPROMETIDOS: ProcesoInput["estado"][] = [
    "Validado PACC",
    "Validado presupuesto",
    "Enviado a Tegucigalpa",
    "Observado",
    "Subsanado",
    "En proceso UCP",
    "Adjudicado",
    "Recibido",
  ];
  const ESTADOS_EJECUTADOS: ProcesoInput["estado"][] = ["Pagado", "Cerrado"];
  const montoNumber = Number(monto || 0);
  const impactoBalance =
    !isEdit && montoNumber > 0
      ? ESTADOS_COMPROMETIDOS.includes(estado)
        ? ("compromete" as const)
        : ESTADOS_EJECUTADOS.includes(estado)
          ? ("ejecuta" as const)
          : ("sin_impacto" as const)
      : null;

  function onSubmit(values: ProcesoInput) {
    setServerError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateProceso(initial!.id, values)
        : await createProceso(values);

      if (!result.ok) {
        setServerError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? "Proceso actualizado" : "Proceso creado");
      const targetId = isEdit ? initial!.id : result.id;
      if (targetId) {
        router.push(`/compras/${targetId}`);
      } else {
        router.push("/compras");
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="codigo">Código *</Label>
          <Input id="codigo" {...register("codigo")} placeholder="CHFM-2026-001" />
          {errors.codigo && (
            <p className="text-xs text-destructive">{errors.codigo.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="monto">Monto (L) *</Label>
          <Input
            id="monto"
            type="number"
            step="0.01"
            min="0"
            {...register("monto", { valueAsNumber: true })}
          />
          {errors.monto && (
            <p className="text-xs text-destructive">{errors.monto.message}</p>
          )}
          {modalidadSugerida && (
            <p className="text-xs text-muted-foreground">
              Modalidad sugerida:{" "}
              <strong className="text-foreground">
                {modalidadSugerida.nombre}
              </strong>
              {" · "}
              {modalidadSugerida.razon}
            </p>
          )}
          {alertaUmbral && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
              ⚠ El monto está cerca del umbral de{" "}
              <strong>L {alertaUmbral.threshold.toLocaleString("en-US")}</strong>{" "}
              para pasar a <strong>{alertaUmbral.proximaModalidad}</strong>.
              Revisar si conviene una compra única en la modalidad superior.
            </p>
          )}
          {impactoBalance === "compromete" && (
            <p className="text-xs text-primary bg-primary/5 border border-primary/20 rounded px-2 py-1">
              Este proceso reservará{" "}
              <strong>L {montoNumber.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>{" "}
              del presupuesto disponible (entra como comprometido).
            </p>
          )}
          {impactoBalance === "ejecuta" && (
            <p className="text-xs text-primary bg-primary/5 border border-primary/20 rounded px-2 py-1">
              Este proceso registrará{" "}
              <strong>L {montoNumber.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>{" "}
              directamente como ejecutado.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="linea_pacc">Línea PACC</Label>
          <Input
            id="linea_pacc"
            {...register("linea_pacc")}
            placeholder="Ej. 142"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="objeto">Objeto presupuestario</Label>
          <Input
            id="objeto"
            {...register("objeto")}
            placeholder="Ej. 21200"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción *</Label>
        <textarea
          id="descripcion"
          {...register("descripcion")}
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Detalle del bien o servicio a adquirir"
        />
        {errors.descripcion && (
          <p className="text-xs text-destructive">
            {errors.descripcion.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {!isEdit && (
          <div className="space-y-2">
            <Label>Estado inicial</Label>
            <Select
              value={estado}
              onValueChange={(v) => setValue("estado", v as ProcesoInput["estado"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROCESO_ESTADOS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Prioridad</Label>
          <Select
            value={prioridad}
            onValueChange={(v) =>
              setValue("prioridad", v as ProcesoInput["prioridad"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROCESO_PRIORIDADES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="responsable">Responsable</Label>
          <Input
            id="responsable"
            {...register("responsable")}
            placeholder="Nombre o área"
          />
        </div>
      </div>

      {isEdit && (
        <p className="text-xs text-muted-foreground">
          Para cambiar el <strong>estado</strong> usa el panel de cambio de
          estado en la página de detalle (queda registrado en el historial).
        </p>
      )}

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Guardando…"
            : isEdit
              ? "Guardar cambios"
              : "Crear proceso"}
        </Button>
      </div>
    </form>
  );
}
