import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { PaccForm } from "@/components/pacc/pacc-form";
import { requireProfile } from "@/lib/auth";
import { roleCanWrite } from "@/lib/auth/permissions";

export const metadata = { title: "Nueva línea PACC" };

export default async function NuevaPaccPage() {
  const profile = await requireProfile();
  if (!roleCanWrite(profile.role)) redirect("/pacc");

  return (
    <>
      <PageHeader
        title="Nueva línea del PACC"
        description="Añade una línea al Plan Anual de Compras y Contrataciones."
      />
      <Card>
        <CardContent className="pt-6">
          <PaccForm />
        </CardContent>
      </Card>
    </>
  );
}
