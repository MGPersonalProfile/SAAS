"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";
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

interface AuditFiltersProps {
  usuarios: string[];
  modulos: string[];
}

export function AuditFilters({ usuarios, modulos }: AuditFiltersProps) {
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

  function clearAll() {
    startTransition(() => router.replace(pathname));
  }

  const hasFilters =
    !!params.get("usuario") ||
    !!params.get("modulo") ||
    !!params.get("desde") ||
    !!params.get("hasta");

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
      <div className="space-y-1">
        <Label className="text-xs">Usuario</Label>
        <Select
          value={params.get("usuario") ?? "__all__"}
          onValueChange={(v) => update("usuario", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos</SelectItem>
            {usuarios.map((u) => (
              <SelectItem key={u} value={u}>
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Módulo</Label>
        <Select
          value={params.get("modulo") ?? "__all__"}
          onValueChange={(v) => update("modulo", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos</SelectItem>
            {modulos.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="desde" className="text-xs">
          Desde
        </Label>
        <Input
          id="desde"
          type="date"
          defaultValue={params.get("desde") ?? ""}
          onChange={(e) => update("desde", e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="hasta" className="text-xs">
          Hasta
        </Label>
        <Input
          id="hasta"
          type="date"
          defaultValue={params.get("hasta") ?? ""}
          onChange={(e) => update("hasta", e.target.value)}
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll}>
          <X className="mr-1 h-4 w-4" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
