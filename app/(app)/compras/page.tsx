import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { ComprasFilters } from "@/components/compras/compras-filters";
import { PaccPagination } from "@/components/pacc/pacc-pagination";
import { EstadoBadge, PrioridadBadge } from "@/components/compras/estado-badge";
import { requireModule } from "@/lib/auth";
import { roleCanWrite } from "@/lib/auth/permissions";
import { listProcesos } from "@/lib/db/procesos";
import { money, dateOnly, number } from "@/lib/format";
import type { ProcesoEstado, ProcesoPrioridad } from "@/types/database";

export const metadata = { title: "Compras" };

interface ComprasPageProps {
  searchParams: Promise<{
    q?: string;
    estado?: ProcesoEstado;
    prioridad?: ProcesoPrioridad;
    page?: string;
  }>;
}

export default async function ComprasPage({ searchParams }: ComprasPageProps) {
  const profile = await requireModule("compras");
  const sp = await searchParams;

  const result = await listProcesos({
    q: sp.q,
    estado: sp.estado,
    prioridad: sp.prioridad,
    page: sp.page ? Number(sp.page) : 1,
  });

  return (
    <>
      <PageHeader
        title="Compras"
        description={`${number(result.total)} procesos registrados.`}
        actions={
          roleCanWrite(profile.role) && (
            <Button asChild size="sm">
              <Link href="/compras/nuevo">
                <Plus className="mr-1 h-4 w-4" />
                Nuevo proceso
              </Link>
            </Button>
          )
        }
      />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <ComprasFilters />

          {result.rows.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {sp.q || sp.estado || sp.prioridad
                ? "No se encontraron procesos con esos filtros."
                : "Aún no hay procesos creados."}
            </div>
          ) : (
            <>
              {/* Desktop: tabla */}
              <div className="hidden md:block rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>Responsable</TableHead>
                      <TableHead className="hidden lg:table-cell">Creado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.rows.map((p) => (
                      <TableRow
                        key={p.id}
                        className="cursor-pointer hover:bg-muted/40"
                      >
                        <TableCell className="font-mono text-xs">
                          <Link
                            href={`/compras/${p.id}`}
                            className="hover:underline"
                          >
                            {p.codigo}
                          </Link>
                        </TableCell>
                        <TableCell className="max-w-sm">
                          <Link
                            href={`/compras/${p.id}`}
                            className="line-clamp-2 text-sm hover:underline"
                          >
                            {p.descripcion}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {money(Number(p.monto))}
                        </TableCell>
                        <TableCell>
                          <EstadoBadge estado={p.estado} />
                        </TableCell>
                        <TableCell>
                          <PrioridadBadge prioridad={p.prioridad} />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {p.responsable ?? "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          {dateOnly(p.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile: cards */}
              <div className="md:hidden space-y-3">
                {result.rows.map((p) => (
                  <Link
                    key={p.id}
                    href={`/compras/${p.id}`}
                    className="block rounded-lg border p-4 bg-card hover:border-primary transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">
                          {p.codigo}
                        </p>
                        <p className="mt-1 text-sm line-clamp-2">
                          {p.descripcion}
                        </p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
                        {money(Number(p.monto))}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-3">
                      <EstadoBadge estado={p.estado} />
                      <PrioridadBadge prioridad={p.prioridad} />
                    </div>
                  </Link>
                ))}
              </div>

              <PaccPagination
                page={result.page}
                totalPages={result.totalPages}
                total={result.total}
                pageSize={result.pageSize}
              />
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
