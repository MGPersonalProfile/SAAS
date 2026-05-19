import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { requireModule } from "@/lib/auth";

export const metadata = { title: "PACC" };

export default async function PaccPage() {
  await requireModule("pacc");
  return (
    <>
      <PageHeader
        title="PACC"
        description="Plan Anual de Compras y Contrataciones."
      />
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Módulo en construcción. Se implementa en Fase 3.
        </CardContent>
      </Card>
    </>
  );
}
