"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deletePaccLine } from "@/app/(app)/pacc/actions";

interface PaccDeleteButtonProps {
  id: number;
  linea: string | null;
  descripcion: string | null;
  procesosCount: number;
}

export function PaccDeleteButton({
  id,
  linea,
  descripcion,
  procesosCount,
}: PaccDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const blocked = procesosCount > 0;

  function confirmDelete() {
    startTransition(async () => {
      const result = await deletePaccLine(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Línea PACC eliminada");
      setOpen(false);
      router.push("/pacc");
      router.refresh();
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={blocked}
        title={
          blocked
            ? `Tiene ${procesosCount} proceso(s) asociado(s)`
            : "Eliminar línea"
        }
      >
        <Trash2 className="mr-1 h-4 w-4 text-destructive" />
        Eliminar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar línea del PACC</DialogTitle>
            <DialogDescription>
              ¿Eliminar la línea <strong>L{linea}</strong>:{" "}
              {(descripcion ?? "").slice(0, 100)}? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
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
