"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { paccSchema, type PaccInput } from "@/lib/db/pacc-schema";
import { createPaccLine, updatePaccLine } from "@/app/(app)/pacc/actions";
import type { Tables } from "@/types/database";

interface PaccFormProps {
  initial?: Tables<"pacc"> | null;
}

const MESES = [
  { value: "1", label: "1 — Enero" },
  { value: "2", label: "2 — Febrero" },
  { value: "3", label: "3 — Marzo" },
  { value: "4", label: "4 — Abril" },
  { value: "5", label: "5 — Mayo" },
  { value: "6", label: "6 — Junio" },
  { value: "7", label: "7 — Julio" },
  { value: "8", label: "8 — Agosto" },
  { value: "9", label: "9 — Septiembre" },
  { value: "10", label: "10 — Octubre" },
  { value: "11", label: "11 — Noviembre" },
  { value: "12", label: "12 — Diciembre" },
];

export function PaccForm({ initial }: PaccFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEdit = !!initial;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaccInput>({
    resolver: zodResolver(paccSchema),
    defaultValues: initial
      ? {
          linea: initial.linea ?? "",
          objeto: initial.objeto ?? "",
          descripcion: initial.descripcion ?? "",
          mes: initial.mes ?? "",
          modalidad: initial.modalidad ?? "",
          fuente: initial.fuente ?? "",
          valor: initial.valor != null ? Number(initial.valor) : null,
          unidad: initial.unidad ?? "",
          eje: initial.eje ?? "",
          estado: initial.estado ?? "Programado",
        }
      : {
          linea: "",
          objeto: "",
          descripcion: "",
          mes: "",
          modalidad: "",
          fuente: "",
          valor: null,
          unidad: "",
          eje: "",
          estado: "Programado",
        },
  });

  function onSubmit(values: PaccInput) {
    setServerError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updatePaccLine(initial!.id, values)
        : await createPaccLine(values);

      if (!result.ok) {
        setServerError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? "Línea actualizada" : "Línea creada");
      const targetId = isEdit ? initial!.id : result.id;
      router.push(targetId ? `/pacc/${targetId}` : "/pacc");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="linea">Línea *</Label>
          <Input id="linea" {...register("linea")} placeholder="Ej. 142" />
          {errors.linea && (
            <p className="text-xs text-destructive">{errors.linea.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="objeto">Objeto presupuestario</Label>
          <Input id="objeto" {...register("objeto")} placeholder="Ej. 21200" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mes">Mes</Label>
          <select
            id="mes"
            {...register("mes")}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">—</option>
            {MESES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción *</Label>
        <textarea
          id="descripcion"
          {...register("descripcion")}
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Bien o servicio a contratar"
        />
        {errors.descripcion && (
          <p className="text-xs text-destructive">{errors.descripcion.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="modalidad">Modalidad</Label>
          <Input
            id="modalidad"
            {...register("modalidad")}
            placeholder="Ej. HN-04-Compra_Menor"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fuente">Fuente</Label>
          <Input
            id="fuente"
            {...register("fuente")}
            placeholder="Ej. 12-Recursos propios"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="valor">Valor (L)</Label>
          <Input
            id="valor"
            type="number"
            step="0.01"
            min="0"
            {...register("valor", {
              setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
            })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="unidad">Unidad ejecutora</Label>
          <Input id="unidad" {...register("unidad")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estado">Estado</Label>
          <Input id="estado" {...register("estado")} placeholder="Programado" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="eje">Eje estratégico</Label>
        <textarea
          id="eje"
          {...register("eje")}
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

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
              : "Crear línea"}
        </Button>
      </div>
    </form>
  );
}
