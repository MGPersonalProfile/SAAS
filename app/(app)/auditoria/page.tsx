import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { requireModule } from "@/lib/auth";

export const metadata = { title: "Auditoría" };

export default async function AuditoriaPage() {
  await requireModule("auditoria");
  return (
    <>
      <PageHeader
        title="Auditoría"
        description="Bitácora inmutable de acciones del sistema."
      />
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Módulo en construcción. Se implementa en Fase 4.
        </CardContent>
      </Card>
    </>
  );
}
