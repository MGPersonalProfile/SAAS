"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaccFiltersProps {
  meses: string[];
  modalidades: string[];
  fuentes: string[];
}

const MES_NOMBRES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function PaccFilters({ meses, modalidades, fuentes }: PaccFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "__all__") {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.delete("page");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    update("q", String(data.get("q") || ""));
  }

  function clearAll() {
    startTransition(() => router.replace(pathname));
  }

  const hasFilters =
    !!params.get("q") ||
    !!params.get("mes") ||
    !!params.get("modalidad") ||
    !!params.get("fuente");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      <form onSubmit={onSubmit} className="relative w-full sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={params.get("q") ?? ""}
          placeholder="Buscar descripción, objeto…"
          className="pl-8"
        />
      </form>

      <Select
        value={params.get("mes") ?? "__all__"}
        onValueChange={(v) => update("mes", v)}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Mes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos los meses</SelectItem>
          {meses.map((m) => (
            <SelectItem key={m} value={m}>
              {MES_NOMBRES[Number(m) - 1] ?? m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={params.get("modalidad") ?? "__all__"}
        onValueChange={(v) => update("modalidad", v)}
      >
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue placeholder="Modalidad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todas las modalidades</SelectItem>
          {modalidades.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={params.get("fuente") ?? "__all__"}
        onValueChange={(v) => update("fuente", v)}
      >
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue placeholder="Fuente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todas las fuentes</SelectItem>
          {fuentes.map((f) => (
            <SelectItem key={f} value={f}>
              {f}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="self-start sm:self-auto"
        >
          <X className="mr-1 h-4 w-4" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
