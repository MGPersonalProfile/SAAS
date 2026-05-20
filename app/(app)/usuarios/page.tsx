import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { UsersTable } from "@/components/usuarios/users-table";
import { requireModule } from "@/lib/auth";
import { listUsers } from "@/lib/db/users";

export const metadata = { title: "Usuarios" };

export default async function UsuariosPage() {
  const profile = await requireModule("usuarios");
  const users = await listUsers();

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Gestión de cuentas, roles y estado activo."
      />
      <Card>
        <CardContent className="pt-6 space-y-4">
          <UsersTable rows={users} currentUserId={profile.id} />
        </CardContent>
      </Card>
    </>
  );
}
