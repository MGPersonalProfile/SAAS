import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { requireModule } from "@/lib/auth";

export const metadata = { title: "Reportes" };

export default async function ReportesPage() {
  await requireModule("reportes");

  return (
    <>
      <PageHeader
        title="Reportes"
        description="Exporta datos en CSV o descarga el reporte ejecutivo en PDF."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ReportCard
          icon={<FileText className="h-5 w-5" />}
          title="Reporte Ejecutivo (PDF)"
          description="Resumen de presupuesto, PACC y procesos por estado. Útil para reuniones."
          href="/api/reportes/pdf"
        />
        <ReportCard
          icon={<FileSpreadsheet className="h-5 w-5" />}
          title="PACC (CSV)"
          description="Las 593 líneas del PACC con sus modalidades y montos."
          href="/api/pacc/export"
        />
        <ReportCard
          icon={<FileSpreadsheet className="h-5 w-5" />}
          title="Procesos (CSV)"
          description="Todos los procesos de compra con estado, prioridad y responsable."
          href="/api/procesos/export"
        />
        <ReportCard
          icon={<FileSpreadsheet className="h-5 w-5" />}
          title="Presupuesto (CSV)"
          description="Partidas presupuestarias con concepto, monto y nota."
          href="/api/budget/export"
        />
      </div>
    </>
  );
}

function ReportCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <a href={href}>
            <Download className="mr-1 h-4 w-4" />
            Descargar
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
