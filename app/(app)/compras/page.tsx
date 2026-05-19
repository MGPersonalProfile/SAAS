import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { requireModule } from "@/lib/auth";

export const metadata = { title: "Compras" };

export default async function ComprasPage() {
  await requireModule("compras");
  return (
    <>
      <PageHeader
        title="Compras"
        description="Procesos de compra y su workflow de estados."
      />
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Módulo en construcción. Se implementa en Fase 3.
        </CardContent>
      </Card>
    </>
  );
}
