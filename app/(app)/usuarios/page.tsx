import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { requireModule } from "@/lib/auth";

export const metadata = { title: "Usuarios" };

export default async function UsuariosPage() {
  await requireModule("usuarios");
  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Gestión de cuentas, roles y estado activo."
      />
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          Módulo en construcción. Se implementa en Fase 4.
        </CardContent>
      </Card>
    </>
  );
}
