import {
  Wallet,
  AlertTriangle,
  ListChecks,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { BudgetChart } from "@/components/dashboard/budget-chart";
import { ProcesosChart } from "@/components/dashboard/procesos-chart";
import { BudgetHealth } from "@/components/dashboard/budget-health";
import { ModalidadChart } from "@/components/dashboard/modalidad-chart";
import { TopPaccChart } from "@/components/dashboard/top-pacc-chart";
import { ExecutionTimelineChart } from "@/components/dashboard/execution-timeline-chart";
import { BackupInfoCard } from "@/components/dashboard/backup-info-card";
import { requireModule } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { getDashboardData } from "@/lib/db/dashboard";
import { money, moneyCompact, number } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const profile = await requireModule("dashboard");
  const data = await getDashboardData();

  const presupuestoVigente =
    data.budget.find((b) => b.concepto === "Presupuesto vigente")?.monto ?? 0;
  const disponibleReal =
    data.budget.find((b) => b.concepto === "Disponible real estimado")?.monto ??
    0;
  const disponibleSiafi =
    data.budget.find((b) => b.concepto === "Disponible SIAFI")?.monto ?? 0;

  const ejecutado = Number(presupuestoVigente) - Number(disponibleSiafi);
  const ejecutadoPct =
    Number(presupuestoVigente) > 0
      ? (ejecutado / Number(presupuestoVigente)) * 100
      : 0;

  return (
    <>
      <PageHeader
        title={`Hola, ${profile.full_name || profile.username}`}
        description={`Sesión iniciada como ${ROLE_LABELS[profile.role]}.`}
      />

      <BudgetHealth
        presupuestoVigente={Number(presupuestoVigente)}
        disponibleReal={Number(disponibleReal)}
        disponibleSiafi={Number(disponibleSiafi)}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Presupuesto vigente"
          value={moneyCompact(Number(presupuestoVigente))}
          hint={money(Number(presupuestoVigente))}
          Icon={Wallet}
        />
        <StatCard
          label="Disponible real"
          value={moneyCompact(Number(disponibleReal))}
          hint={`Ejecución ${ejecutadoPct.toFixed(1)}%`}
          Icon={Activity}
          accent={ejecutadoPct > 80 ? "warning" : "default"}
        />
        <StatCard
          label="Total PACC"
          value={moneyCompact(data.pacc.total)}
          hint={`${number(data.pacc.count)} líneas`}
          Icon={ListChecks}
        />
        <StatCard
          label="Procesos activos"
          value={number(data.procesos.activos)}
          hint={
            data.procesos.observados > 0
              ? `${data.procesos.observados} observados`
              : `${data.procesos.total} totales`
          }
          Icon={data.procesos.observados > 0 ? AlertTriangle : CheckCircle2}
          accent={data.procesos.observados > 0 ? "warning" : "success"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Presupuesto por concepto</CardTitle>
          </CardHeader>
          <CardContent>
            {data.budget.length > 0 ? (
              <BudgetChart
                data={data.budget.map((b) => ({
                  concepto: b.concepto,
                  monto: Number(b.monto),
                }))}
              />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No hay partidas presupuestarias registradas.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Procesos por estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ProcesosChart data={data.procesos.porEstado} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por modalidad de contratación</CardTitle>
          </CardHeader>
          <CardContent>
            <ModalidadChart data={data.byModalidad} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 líneas PACC con más ejecución</CardTitle>
          </CardHeader>
          <CardContent>
            <TopPaccChart data={data.topPaccLines} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ejecución mes a mes</CardTitle>
        </CardHeader>
        <CardContent>
          <ExecutionTimelineChart data={data.executionTimeline} />
        </CardContent>
      </Card>

      <BackupInfoCard />
    </>
  );
}
