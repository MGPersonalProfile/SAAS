"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import type { ImportResult } from "@/app/(app)/importar/actions";

type Action = (
  rows: unknown[],
  replaceAll: boolean,
) => Promise<ImportResult>;

interface CsvImporterProps {
  expectedColumns: string[];
  numericColumns?: string[];
  action: Action;
  /** Si la action ignora el flag replaceAll, no se muestra el checkbox. */
  supportsReplaceAll?: boolean;
}

interface ParsedState {
  rows: Record<string, unknown>[];
  headers: string[];
  warnings: string[];
}

export function CsvImporter({
  expectedColumns,
  numericColumns = [],
  action,
  supportsReplaceAll = false,
}: CsvImporterProps) {
  const router = useRouter();
  const [parsed, setParsed] = useState<ParsedState | null>(null);
  const [replaceAll, setReplaceAll] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportResult | null>(null);

  function handleFile(file: File) {
    setResult(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
      complete: (res) => {
        const headers = (res.meta.fields ?? []).map((h) => h.toLowerCase());
        const warnings: string[] = [];

        const missing = expectedColumns.filter((c) => !headers.includes(c));
        if (missing.length > 0) {
          warnings.push(
            `Faltan columnas esperadas: ${missing.join(", ")}. Las filas se importarán con NULL en esos campos.`,
          );
        }

        const extras = headers.filter((c) => !expectedColumns.includes(c));
        if (extras.length > 0) {
          warnings.push(
            `Columnas no reconocidas (se ignoran): ${extras.join(", ")}`,
          );
        }

        const rows = (res.data as Record<string, unknown>[]).map((r) => {
          const out: Record<string, unknown> = {};
          for (const c of expectedColumns) {
            const raw = r[c];
            if (raw === undefined || raw === null || raw === "") {
              out[c] = null;
            } else if (numericColumns.includes(c)) {
              const n = Number(String(raw).replace(/,/g, ""));
              out[c] = Number.isFinite(n) ? n : null;
            } else {
              out[c] = String(raw).trim();
            }
          }
          return out;
        });

        setParsed({ rows, headers, warnings });
      },
      error: (err) => {
        toast.error(`Error parseando CSV: ${err.message}`);
      },
    });
  }

  function submit() {
    if (!parsed) return;
    startTransition(async () => {
      const res = await action(parsed.rows, replaceAll);
      setResult(res);
      if (res.ok) {
        toast.success(
          `Importado: ${res.inserted} nuevos, ${res.updated} actualizados.`,
        );
        setParsed(null);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-dashed p-6">
        <Label
          htmlFor="csv-file"
          className="flex cursor-pointer flex-col items-center gap-2 text-center"
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm">Selecciona un archivo CSV</span>
          <span className="text-xs text-muted-foreground">
            Columnas esperadas: {expectedColumns.join(", ")}
          </span>
        </Label>
        <input
          id="csv-file"
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {parsed && (
        <>
          {parsed.warnings.length > 0 && (
            <div className="space-y-1 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              {parsed.warnings.map((w, i) => (
                <p key={i} className="flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  {w}
                </p>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium">
              Vista previa ({parsed.rows.length} filas detectadas, mostrando primeras 5)
            </p>
            <div className="rounded-lg border overflow-auto max-h-72">
              <Table>
                <TableHeader>
                  <TableRow>
                    {expectedColumns.map((c) => (
                      <TableHead key={c} className="text-xs">
                        {c}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.rows.slice(0, 5).map((r, i) => (
                    <TableRow key={i}>
                      {expectedColumns.map((c) => (
                        <TableCell key={c} className="text-xs">
                          {r[c] === null ? (
                            <span className="text-muted-foreground italic">
                              NULL
                            </span>
                          ) : (
                            String(r[c])
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {supportsReplaceAll && (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={replaceAll}
                onCheckedChange={(v) => setReplaceAll(!!v)}
              />
              Reemplazar TODO el dataset (borra los existentes antes de insertar).
              Solo admin.
            </label>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setParsed(null);
                setResult(null);
              }}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button onClick={submit} disabled={isPending}>
              {isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Importar {parsed.rows.length} filas
            </Button>
          </div>
        </>
      )}

      {result && result.ok && (
        <div className="space-y-2 rounded-md bg-emerald-50 border border-emerald-300 p-3 text-sm text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>
              Importación exitosa: <strong>{result.inserted}</strong> nuevos,{" "}
              <strong>{result.updated}</strong> actualizados.
            </span>
          </div>
          {result.warnings && result.warnings.length > 0 && (
            <ul className="space-y-1 border-t border-emerald-200 pt-2 text-xs text-emerald-800">
              {result.warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {result && !result.ok && (
        <div className="space-y-1 rounded-md bg-red-50 border border-red-300 p-3 text-sm text-red-900">
          <p className="font-medium">{result.error}</p>
          {result.errors && (
            <ul className="text-xs">
              {result.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
