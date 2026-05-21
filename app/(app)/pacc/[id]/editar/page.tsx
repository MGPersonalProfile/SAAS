import { notFound, redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { PaccForm } from "@/components/pacc/pacc-form";
import { requireProfile } from "@/lib/auth";
import { roleCanWrite } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

interface EditarPaccProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: "Editar línea PACC" };

export default async function EditarPaccPage({ params }: EditarPaccProps) {
  const profile = await requireProfile();
  if (!roleCanWrite(profile.role)) redirect("/pacc");

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();

  const supabase = await createClient();
  const { data: linea } = await supabase
    .from("pacc")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!linea) notFound();

  return (
    <>
      <PageHeader
        title={`Editar línea ${linea.linea}`}
        description={linea.descripcion?.slice(0, 120) ?? ""}
      />
      <Card>
        <CardContent className="pt-6">
          <PaccForm initial={linea} />
        </CardContent>
      </Card>
    </>
  );
}
