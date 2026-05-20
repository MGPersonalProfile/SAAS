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
import {
  PROCESO_ESTADOS,
  PROCESO_PRIORIDADES,
} from "@/lib/db/procesos-schema";

export function ComprasFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value && value !== "__all__") next.set(key, value);
    else next.delete(key);
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
    !!params.get("q") || !!params.get("estado") || !!params.get("prioridad");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      <form onSubmit={onSubmit} className="relative w-full sm:max-w-xs">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={params.get("q") ?? ""}
          placeholder="Buscar código, descripción, responsable…"
          className="pl-8"
        />
      </form>

      <Select
        value={params.get("estado") ?? "__all__"}
        onValueChange={(v) => update("estado", v)}
      >
        <SelectTrigger className="w-full sm:w-56">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos los estados</SelectItem>
          {PROCESO_ESTADOS.map((e) => (
            <SelectItem key={e} value={e}>
              {e}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={params.get("prioridad") ?? "__all__"}
        onValueChange={(v) => update("prioridad", v)}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Prioridad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todas</SelectItem>
          {PROCESO_PRIORIDADES.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
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
