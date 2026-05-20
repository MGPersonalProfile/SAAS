import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";
import { EstadoBadge } from "@/components/compras/estado-badge";
import { requireProfile } from "@/lib/auth";
import { roleCanAccess } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import {
  getFraccionamientoAlertas,
  FRACCIONAMIENTO_CONFIG,
} from "@/lib/db/alertas";
import { money, dateOnly } from "@/lib/format";

export const metadata = { title: "Alertas" };

export default async function AlertasPage() {
  const profile = await requireProfile();
  // Reutilizamos el permiso de auditoría: admin y gerencia.
  if (!roleCanAccess(profile.role, "auditoria")) redirect("/dashboard");

  const alertas = await getFraccionamientoAlertas();

  return (
    <>
      <PageHeader
        title="Alertas"
        description={`Detección de posible fraccionamiento. Ventana de ${FRACCIONAMIENTO_CONFIG.ventanaDias} días, ${FRACCIONAMIENTO_CONFIG.minCount}+ procesos del mismo responsable y objeto prefix, sumando más de ${money(FRACCIONAMIENTO_CONFIG.threshold)}.`}
      />

      {alertas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Sin alertas activas. La heurística no encontró patrones sospechosos
            en los últimos {FRACCIONAMIENTO_CONFIG.ventanaDias} días.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alertas.map((a, i) => (
            <Card key={i} className="border-amber-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      {a.responsable}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Objeto prefix <code className="bg-muted px-1 py-0.5 rounded">{a.objeto_prefix}*</code>
                      {" · "}
                      {a.count} procesos
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold tabular-nums text-amber-700">
                      {money(a.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">total acumulado</p>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {a.procesos.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/compras/${p.id}`}
                          className="font-mono text-xs text-primary hover:underline"
                        >
                          {p.codigo}
                        </Link>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {dateOnly(p.created_at)}
                        </span>
                        <p className="line-clamp-1 text-sm">
                          {p.descripcion ?? "—"}
                        </p>
                      </div>
                      <EstadoBadge estado={p.estado} />
                      <span className="text-sm font-medium tabular-nums whitespace-nowrap w-28 text-right">
                        {money(Number(p.monto))}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-muted/30 border-dashed">
            <CardContent className="py-4 text-xs text-muted-foreground">
              <Badge variant="outline" className="mr-2 font-normal">
                Heurística
              </Badge>
              Esta detección es indicativa, no concluyente. La fragmentación
              puede tener razones legítimas (urgencia, presupuesto por
              tramos, etc.). Cada caso debe revisarse manualmente antes de
              tomar acción.
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
