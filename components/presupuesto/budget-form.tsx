"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { budgetSchema, type BudgetInput } from "@/lib/db/budget-schema";
import { upsertBudget } from "@/app/(app)/presupuesto/actions";

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: {
    id: number;
    concepto: string;
    monto: number;
    nota: string | null;
  } | null;
}

export function BudgetForm({ open, onOpenChange, initial }: BudgetFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
    values: initial
      ? {
          concepto: initial.concepto,
          monto: Number(initial.monto),
          nota: initial.nota ?? "",
        }
      : { concepto: "", monto: 0, nota: "" },
  });

  function onSubmit(values: BudgetInput) {
    setServerError(null);
    startTransition(async () => {
      const result = await upsertBudget({ ...values, id: initial?.id });
      if (!result.ok) {
        setServerError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success(initial ? "Partida actualizada" : "Partida creada");
      reset();
      onOpenChange(false);
    });
  }

  const isEdit = !!initial;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar partida" : "Nueva partida presupuestaria"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Actualiza el monto o la nota. El concepto debe permanecer único."
              : "Crea una nueva partida del presupuesto."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="concepto">Concepto</Label>
            <Input
              id="concepto"
              {...register("concepto")}
              disabled={isEdit}
              placeholder="Ej. Presupuesto vigente"
            />
            {errors.concepto && (
              <p className="text-xs text-destructive">{errors.concepto.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monto">Monto (L)</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="nota">Nota (opcional)</Label>
            <Input
              id="nota"
              {...register("nota")}
              placeholder="Contexto o referencia"
            />
            {errors.nota && (
              <p className="text-xs text-destructive">{errors.nota.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-destructive">{serverError}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
