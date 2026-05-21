import { notFound, redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { ProcesoForm } from "@/components/compras/proceso-form";
import { requireProfile } from "@/lib/auth";
import { roleCanWrite } from "@/lib/auth/permissions";
import { getProceso } from "@/lib/db/procesos";

interface EditarProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Editar proceso" };

export default async function EditarProcesoPage({ params }: EditarProps) {
  const profile = await requireProfile();
  if (!roleCanWrite(profile.role)) redirect("/compras");

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();

  const result = await getProceso(id);
  if (!result) notFound();

  return (
    <>
      <PageHeader
        title={`Editar ${result.proceso.codigo}`}
        description="El estado se cambia desde la página de detalle (queda en el historial)."
      />
      <Card>
        <CardContent className="pt-6">
          <ProcesoForm
            initial={result.proceso}
            initialPacc={result.proceso.pacc ?? null}
          />
        </CardContent>
      </Card>
    </>
  );
}
