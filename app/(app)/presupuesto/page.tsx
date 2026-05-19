import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { requireModule } from "@/lib/auth";

export const metadata = { title: "Presupuesto" };

export default async function PresupuestoPage() {
  await requireModule("presupuesto");
  return (
    <>
      <PageHeader
        title="Presupuesto"
        description="Partidas presupuestarias del CHFM."
      />
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Módulo en construcción. Se implementa en Fase 3.
        </CardContent>
      </Card>
    </>
  );
}
