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

interface PaccTableProps {
  rows: Tables<"pacc">[];
}

export function PaccTable({ rows }: PaccTableProps) {
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
                <TableHead className="w-48">Modalidad</TableHead>
                <TableHead className="w-32 text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-mono text-xs">{row.linea}</TableCell>
                  <TableCell className="font-mono text-xs">{row.objeto}</TableCell>
                  <TableCell className="max-w-md">
                    <div className="line-clamp-2 text-sm">{row.descripcion}</div>
                  </TableCell>
                  <TableCell className="text-center">{row.mes}</TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="outline" className="font-normal">
                      {row.modalidad}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {money(Number(row.valor))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile: cards apiladas */}
      <div className="md:hidden space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-lg border p-4 space-y-2 bg-card"
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
          </div>
        ))}
      </div>
    </>
  );
}
