import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { requireModule } from "@/lib/auth";

export const metadata = { title: "Reportes" };

export default async function ReportesPage() {
  await requireModule("reportes");
  return (
    <>
      <PageHeader
        title="Reportes"
        description="Exportación CSV y reporte ejecutivo en PDF."
      />
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Módulo en construcción. Se implementa en Fase 3.
        </CardContent>
      </Card>
    </>
  );
}
