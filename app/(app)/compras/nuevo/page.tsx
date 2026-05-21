import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { ProcesoForm } from "@/components/compras/proceso-form";
import { requireProfile } from "@/lib/auth";
import { roleCanWrite } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import type { PaccLineLite } from "@/components/compras/pacc-line-picker";

interface NuevoProps {
  searchParams: Promise<{ pacc?: string }>;
}

export const metadata = { title: "Nuevo proceso" };

export default async function NuevoProcesoPage({ searchParams }: NuevoProps) {
  const profile = await requireProfile();
  if (!roleCanWrite(profile.role)) redirect("/compras");

  // Si la URL trae ?pacc=ID se pre-selecciona esa línea del PACC en el formulario.
  // Lo usa la página de detalle de PACC ("Crear proceso para esta línea").
  const sp = await searchParams;
  let initialPacc: PaccLineLite | null = null;
  if (sp.pacc) {
    const paccId = Number(sp.pacc);
    if (Number.isFinite(paccId)) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("pacc")
        .select("id, linea, objeto, descripcion, modalidad, valor")
        .eq("id", paccId)
        .maybeSingle();
      initialPacc = data ?? null;
    }
  }

  return (
    <>
      <PageHeader
        title="Nuevo proceso de compra"
        description="Crea un proceso. Los cambios de estado posteriores se registran en el historial inmutable."
      />
      <Card>
        <CardContent className="pt-6">
          <ProcesoForm initialPacc={initialPacc} />
        </CardContent>
      </Card>
    </>
  );
}
