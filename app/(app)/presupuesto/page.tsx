import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { BudgetTable } from "@/components/presupuesto/budget-table";
import { requireModule } from "@/lib/auth";
import { roleCanWrite } from "@/lib/auth/permissions";
import { listBudget } from "@/lib/db/budget";

export const metadata = { title: "Presupuesto" };

export default async function PresupuestoPage() {
  const profile = await requireModule("presupuesto");
  const rows = await listBudget();

  return (
    <>
      <PageHeader
        title="Presupuesto"
        description="Partidas presupuestarias del CHFM."
      />
      <Card>
        <CardContent className="pt-6 space-y-4">
          <BudgetTable
            rows={rows}
            canWrite={roleCanWrite(profile.role)}
            canDelete={profile.role === "admin"}
          />
        </CardContent>
      </Card>
    </>
  );
}
