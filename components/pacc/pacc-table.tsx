import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { money } from "@/lib/format";
import type { Tables } from "@/types/database";
import type { PaccLineExecution } from "@/lib/db/pacc";

interface PaccTableProps {
  rows: Tables<"pacc">[];
  executionMap?: Map<number, PaccLineExecution>;
}

function ExecutionCell({ exec }: { exec?: PaccLineExecution }) {
  if (!exec || exec.procesos_count === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const pct = exec.pct_ejecucion;
  const overrun = pct >= 100;
  const warning = !overrun && pct >= 80;
  const color = overrun
    ? "bg-destructive"
    : warning
      ? "bg-amber-500"
      : "bg-primary";
  return (
    <div className="space-y-1 min-w-[100px]">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className={overrun ? "text-destructive font-medium" : ""}>
          {pct.toFixed(0)}%
        </span>
        <span className="text-muted-foreground">
          {exec.procesos_count}P
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full ${color}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

export function PaccTable({ rows, executionMap }: PaccTableProps) {
  if (rows.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No se encontraron líneas con esos filtros.
      </div>
    );
  }

  return (
    <>
      {/* Desktop / tablet: tabla */}
      <div className="hidden md:block rounded-lg border overflow-hidden">
        <div className="max-h-[70vh] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-16">Línea</TableHead>
                <TableHead className="w-20">Objeto</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-16">Mes</TableHead>
                <TableHead className="w-40">Modalidad</TableHead>
                <TableHead className="w-32 text-right">Monto</TableHead>
                <TableHead className="w-32">% Ejecución</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/40"
                >
                  <TableCell className="font-mono text-xs">
                    <Link
                      href={`/pacc/${row.id}`}
                      className="block w-full hover:underline"
                    >
                      {row.linea}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    <Link href={`/pacc/${row.id}`} className="block w-full">
                      {row.objeto}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <Link href={`/pacc/${row.id}`} className="block w-full">
                      <div className="line-clamp-2 text-sm">
                        {row.descripcion}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-center">
                    <Link href={`/pacc/${row.id}`} className="block w-full">
                      {row.mes}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs">
                    <Link href={`/pacc/${row.id}`} className="block w-full">
                      <Badge variant="outline" className="font-normal">
                        {row.modalidad}
                      </Badge>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    <Link href={`/pacc/${row.id}`} className="block w-full">
                      {money(Number(row.valor))}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/pacc/${row.id}`} className="block w-full">
                      <ExecutionCell exec={executionMap?.get(row.id)} />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile: cards apiladas, cada una clicable */}
      <div className="md:hidden space-y-3">
        {rows.map((row) => {
          const exec = executionMap?.get(row.id);
          return (
            <Link
              key={row.id}
              href={`/pacc/${row.id}`}
              className="block rounded-lg border p-4 space-y-2 bg-card hover:border-primary transition"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono text-muted-foreground">
                  Línea {row.linea} · {row.objeto}
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {money(Number(row.valor))}
                </span>
              </div>
              <p className="text-sm">{row.descripcion}</p>
              <div className="flex flex-wrap gap-1 pt-1">
                <Badge variant="outline" className="text-xs font-normal">
                  Mes {row.mes}
                </Badge>
                <Badge variant="outline" className="text-xs font-normal">
                  {row.modalidad}
                </Badge>
              </div>
              {exec && exec.procesos_count > 0 && (
                <div className="pt-1">
                  <ExecutionCell exec={exec} />
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}
