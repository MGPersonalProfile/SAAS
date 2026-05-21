"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { money } from "@/lib/format";

export interface PaccLineLite {
  id: number;
  linea: string | null;
  objeto: string | null;
  descripcion: string | null;
  modalidad: string | null;
  valor: number | null;
}

interface PaccLinePickerProps {
  value: PaccLineLite | null;
  onChange: (line: PaccLineLite | null) => void;
  disabled?: boolean;
}

export function PaccLinePicker({
  value,
  onChange,
  disabled,
}: PaccLinePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<PaccLineLite[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/pacc/search?q=${encodeURIComponent(search)}`,
        );
        const data = (await res.json()) as { items?: PaccLineLite[] };
        setResults(data.items ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, open]);

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className="w-full justify-between font-normal"
            >
              {value ? (
                <span className="truncate">
                  <span className="font-mono text-xs text-muted-foreground">
                    L{value.linea}
                  </span>
                  {" · "}
                  <span className="text-sm">
                    {(value.descripcion ?? "").slice(0, 60)}
                    {(value.descripcion?.length ?? 0) > 60 ? "…" : ""}
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Selecciona una línea del PACC
                </span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-(--radix-popover-trigger-width) p-0"
            align="start"
          >
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Buscar por línea, objeto o descripción…"
                value={search}
                onValueChange={setSearch}
              />
              <CommandList className="max-h-72">
                {loading && (
                  <div className="py-4 text-center text-xs text-muted-foreground">
                    Buscando…
                  </div>
                )}
                {!loading && results.length === 0 && (
                  <CommandEmpty>
                    Sin resultados para esta búsqueda.
                  </CommandEmpty>
                )}
                {!loading && results.length > 0 && (
                  <CommandGroup heading={`${results.length} resultado(s)`}>
                    {results.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={String(item.id)}
                        onSelect={() => {
                          onChange(item);
                          setOpen(false);
                        }}
                        className="flex items-start gap-2"
                      >
                        <Check
                          className={cn(
                            "mt-1 h-4 w-4 shrink-0",
                            value?.id === item.id ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground font-mono">
                            Línea {item.linea} · Objeto {item.objeto ?? "—"}
                            {item.valor != null && (
                              <span className="ml-2 text-foreground font-medium">
                                {money(item.valor)}
                              </span>
                            )}
                          </p>
                          <p className="text-sm line-clamp-2">
                            {item.descripcion ?? ""}
                          </p>
                          {item.modalidad && (
                            <p className="text-xs text-muted-foreground">
                              {item.modalidad}
                            </p>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {value && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(null)}
            aria-label="Quitar línea"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {value && (
        <p className="text-xs text-muted-foreground">
          Monto programado en PACC:{" "}
          <strong className="text-foreground">
            {value.valor != null ? money(value.valor) : "sin valor"}
          </strong>
          {" · "}
          Modalidad: {value.modalidad ?? "—"}
        </p>
      )}
    </div>
  );
}
