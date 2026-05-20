import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { ProcesoForm } from "@/components/compras/proceso-form";
import { requireProfile } from "@/lib/auth";
import { roleCanWrite } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";

export const metadata = { title: "Nuevo proceso" };

export default async function NuevoProcesoPage() {
  const profile = await requireProfile();
  if (!roleCanWrite(profile.role)) redirect("/compras");

  return (
    <>
      <PageHeader
        title="Nuevo proceso de compra"
        description="Crea un proceso. Los cambios de estado posteriores se registran en el historial inmutable."
      />
      <Card>
        <CardContent className="pt-6">
          <ProcesoForm />
        </CardContent>
      </Card>
    </>
  );
}
