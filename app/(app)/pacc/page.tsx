import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { PaccFilters } from "@/components/pacc/pacc-filters";
import { PaccTable } from "@/components/pacc/pacc-table";
import { PaccPagination } from "@/components/pacc/pacc-pagination";
import { requireModule } from "@/lib/auth";
import { listPacc, getPaccFacets } from "@/lib/db/pacc";
import { money, number } from "@/lib/format";

export const metadata = { title: "PACC" };

interface PaccPageProps {
  searchParams: Promise<{
    q?: string;
    mes?: string;
    modalidad?: string;
    fuente?: string;
    page?: string;
  }>;
}

export default async function PaccPage({ searchParams }: PaccPageProps) {
  await requireModule("pacc");
  const sp = await searchParams;

  const [result, facets] = await Promise.all([
    listPacc({
      q: sp.q,
      mes: sp.mes,
      modalidad: sp.modalidad,
      fuente: sp.fuente,
      page: sp.page ? Number(sp.page) : 1,
    }),
    getPaccFacets(),
  ]);

  const totalFiltradoValor = result.rows.reduce(
    (sum, r) => sum + Number(r.valor ?? 0),
    0,
  );

  // Querystring para el link de export
  const exportParams = new URLSearchParams();
  if (sp.q) exportParams.set("q", sp.q);
  if (sp.mes) exportParams.set("mes", sp.mes);
  if (sp.modalidad) exportParams.set("modalidad", sp.modalidad);
  if (sp.fuente) exportParams.set("fuente", sp.fuente);
  const exportUrl = `/api/pacc/export${
    exportParams.toString() ? `?${exportParams}` : ""
  }`;

  return (
    <>
      <PageHeader
        title="PACC"
        description={`Plan Anual de Compras y Contrataciones — ${number(
          result.total,
        )} líneas`}
        actions={
          <Button asChild variant="outline" size="sm">
            <a href={exportUrl}>
              <Download className="mr-1 h-4 w-4" />
              Exportar CSV
            </a>
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <PaccFilters
            meses={facets.meses}
            modalidades={facets.modalidades}
            fuentes={facets.fuentes}
          />

          {result.total > 0 && (
            <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              Suma de esta página: <strong>{money(totalFiltradoValor)}</strong>
            </div>
          )}

          <PaccTable rows={result.rows} />

          <PaccPagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
          />
        </CardContent>
      </Card>
    </>
  );
}
