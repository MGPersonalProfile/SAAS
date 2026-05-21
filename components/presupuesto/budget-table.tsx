"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2, Calculator } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BudgetForm } from "./budget-form";
import { money, dateTime } from "@/lib/format";
import { deleteBudget } from "@/app/(app)/presupuesto/actions";
import type { Tables } from "@/types/database";

type BudgetRow = Tables<"budget_view">;

interface BudgetTableProps {
  rows: BudgetRow[];
  canWrite: boolean;
  canDelete: boolean;
}

export function BudgetTable({ rows, canWrite, canDelete }: BudgetTableProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetRow | null>(null);
  const [deleting, setDeleting] = useState<BudgetRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(row: BudgetRow) {
    setEditing(row);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteBudget(deleting.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Partida eliminada");
      setDeleting(null);
    });
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {rows.length} {rows.length === 1 ? "partida" : "partidas"}
        </p>
        {canWrite && (
          <Button onClick={openCreate} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Nueva partida
          </Button>
        )}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Concepto</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="hidden md:table-cell">Nota</TableHead>
              <TableHead className="hidden lg:table-cell">Actualizado</TableHead>
              {canWrite && <TableHead className="w-24" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canWrite ? 5 : 4}
                  className="py-8 text-center text-sm text-muted-foreground"
                >
                  No hay partidas registradas.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const isDerivado = row.tipo === "derivado";
                return (
                  <TableRow
                    key={row.id}
                    className={isDerivado ? "bg-muted/30" : undefined}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{row.concepto}</span>
                        {isDerivado && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className="font-normal text-xs gap-1 cursor-help"
                              >
                                <Calculator className="h-3 w-3" />
                                Calculado
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs text-xs">
                              Este monto se calcula automáticamente a partir
                              de los procesos de compra registrados en el
                              sistema. No se edita a mano.
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {money(Number(row.monto))}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {row.nota ?? "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                      {isDerivado ? "en vivo" : dateTime(row.updated_at)}
                    </TableCell>
                    {canWrite && (
                      <TableCell className="text-right">
                        {isDerivado ? null : (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(row)}
                              aria-label="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleting(row)}
                                aria-label="Eliminar"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <BudgetForm
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={
          editing
            ? {
                id: editing.id,
                concepto: editing.concepto,
                monto: Number(editing.monto),
                nota: editing.nota,
              }
            : null
        }
      />

      <Dialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar partida</DialogTitle>
            <DialogDescription>
              ¿Seguro que quieres eliminar{" "}
              <strong>{deleting?.concepto}</strong>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleting(null)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isPending}
            >
              {isPending ? "Eliminando…" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
