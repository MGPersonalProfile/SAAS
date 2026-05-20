import { Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { PageHeader } from "@/components/layout/page-header";
import { AuditFilters } from "@/components/auditoria/audit-filters";
import { PaccPagination } from "@/components/pacc/pacc-pagination";
import { requireModule } from "@/lib/auth";
import { getAuditFacets, listAudit } from "@/lib/db/audit";
import { dateTime, number } from "@/lib/format";

export const metadata = { title: "Auditoría" };

interface AuditoriaPageProps {
  searchParams: Promise<{
    usuario?: string;
    modulo?: string;
    desde?: string;
    hasta?: string;
    page?: string;
  }>;
}

export default async function AuditoriaPage({
  searchParams,
}: AuditoriaPageProps) {
  await requireModule("auditoria");
  const sp = await searchParams;

  const [result, facets] = await Promise.all([
    listAudit({
      usuario: sp.usuario,
      modulo: sp.modulo,
      desde: sp.desde ? `${sp.desde}T00:00:00Z` : undefined,
      hasta: sp.hasta ? `${sp.hasta}T23:59:59Z` : undefined,
      page: sp.page ? Number(sp.page) : 1,
    }),
    getAuditFacets(),
  ]);

  const exportParams = new URLSearchParams();
  if (sp.usuario) exportParams.set("usuario", sp.usuario);
  if (sp.modulo) exportParams.set("modulo", sp.modulo);
  if (sp.desde) exportParams.set("desde", sp.desde);
  if (sp.hasta) exportParams.set("hasta", sp.hasta);

  return (
    <>
      <PageHeader
        title="Auditoría"
        description={`Bitácora inmutable. ${number(result.total)} eventos registrados.`}
        actions={
          <Button asChild variant="outline" size="sm">
            <a href={`/api/audit/export?${exportParams.toString()}`}>
              <Download className="mr-1 h-4 w-4" />
              Exportar CSV
            </a>
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <AuditFilters usuarios={facets.usuarios} modulos={facets.modulos} />

          {result.rows.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Sin eventos para estos filtros.
            </div>
          ) : (
            <>
              <div className="rounded-lg border overflow-hidden">
                <div className="max-h-[70vh] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow>
                        <TableHead className="w-44">Fecha</TableHead>
                        <TableHead className="w-32">Usuario</TableHead>
                        <TableHead className="w-32">Módulo</TableHead>
                        <TableHead>Acción</TableHead>
                        <TableHead>Detalle</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.rows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {dateTime(row.fecha)}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {row.username ?? "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {row.modulo}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{row.accion}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {row.detalle ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
