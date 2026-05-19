import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { requireModule } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/auth/permissions";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const profile = await requireModule("dashboard");

  return (
    <>
      <PageHeader
        title={`Hola, ${profile.full_name || profile.username}`}
        description={`Sesión iniciada como ${ROLE_LABELS[profile.role]}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
              Presupuesto vigente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">L —</div>
            <p className="text-xs text-muted-foreground mt-1">Sin datos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
              Total PACC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">L —</div>
            <p className="text-xs text-muted-foreground mt-1">Sin datos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
              Procesos activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">—</div>
            <p className="text-xs text-muted-foreground mt-1">Sin datos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
              Procesos observados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">—</div>
            <p className="text-xs text-muted-foreground mt-1">Sin datos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fase 1 completa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Autenticación, roles, layout autenticado y permisos por módulo
            ya están funcionando. El sidebar muestra solo los módulos que tu
            rol puede acceder.
          </p>
          <p className="text-muted-foreground">
            Próxima fase: poblar la base con presupuesto y PACC, agregar
            triggers de auditoría e historial de procesos, y empezar los
            módulos con datos reales.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
