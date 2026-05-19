import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { requireModule } from "@/lib/auth";

export const metadata = { title: "Documentos" };

export default async function DocumentosPage() {
  await requireModule("documentos");
  return (
    <>
      <PageHeader
        title="Documentos"
        description="Archivos vinculados a procesos de compra."
      />
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Módulo en construcción. Se implementa en Fase 4.
        </CardContent>
      </Card>
    </>
  );
}
