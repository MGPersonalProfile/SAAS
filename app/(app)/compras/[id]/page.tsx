import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/layout/page-header";
import { EstadoBadge, PrioridadBadge } from "@/components/compras/estado-badge";
import { CambioEstadoForm } from "@/components/compras/cambio-estado-form";
import { DocumentosPanel } from "@/components/compras/documentos-panel";
import { requireModule } from "@/lib/auth";
import { roleCanWrite } from "@/lib/auth/permissions";
import { getProceso } from "@/lib/db/procesos";
import { listDocumentosByProceso } from "@/lib/db/documentos";
import { money, dateTime } from "@/lib/format";

interface ProcesoDetalleProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProcesoDetalleProps) {
  const { id } = await params;
  return { title: `Proceso ${id}` };
}

export default async function ProcesoDetallePage({
  params,
}: ProcesoDetalleProps) {
  const profile = await requireModule("compras");
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();

  const result = await getProceso(id);
  if (!result) notFound();

  const { proceso, historial } = result;
  const docs = await listDocumentosByProceso(id);
  const canWrite = roleCanWrite(profile.role);
  const canDelete = profile.role === "admin";

  return (
    <>
      <PageHeader
        title={proceso.codigo}
        description={proceso.descripcion?.slice(0, 120) ?? ""}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/compras">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Volver
              </Link>
            </Button>
            {canWrite && (
              <Button asChild size="sm">
                <Link href={`/compras/${id}/editar`}>
                  <Pencil className="mr-1 h-4 w-4" />
                  Editar
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <Tabs defaultValue="info" className="w-full">
              <TabsList>
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="historial">
                  Historial ({historial.length})
                </TabsTrigger>
                <TabsTrigger value="documentos">
                  Documentos ({docs.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Estado actual">
                    <EstadoBadge estado={proceso.estado} />
                  </Field>
                  <Field label="Prioridad">
                    <PrioridadBadge prioridad={proceso.prioridad} />
                  </Field>
                  <Field label="Monto">
                    <span className="text-lg font-semibold tabular-nums">
                      {money(Number(proceso.monto))}
                    </span>
                  </Field>
                  <Field label="Responsable">
                    {proceso.responsable ?? "—"}
                  </Field>
                  <Field label="Línea PACC">{proceso.linea_pacc ?? "—"}</Field>
                  <Field label="Objeto presupuestario">
                    {proceso.objeto ?? "—"}
                  </Field>
                </div>

                <Separator />

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Descripción
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">
                    {proceso.descripcion}
                  </p>
                </div>

                <Separator />

                <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  <div>Creado: {dateTime(proceso.created_at)}</div>
                  <div>Actualizado: {dateTime(proceso.updated_at)}</div>
                </div>
              </TabsContent>

              <TabsContent value="documentos" className="pt-4">
                <DocumentosPanel
                  procesoId={proceso.id}
                  docs={docs}
                  canWrite={canWrite}
                  canDelete={canDelete}
                />
              </TabsContent>

              <TabsContent value="historial" className="pt-4">
                {historial.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Sin movimientos registrados.
                  </p>
                ) : (
                  <ol className="space-y-3">
                    {historial.map((h) => (
                      <li
                        key={h.id}
                        className="rounded-lg border bg-muted/30 p-3 text-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {h.estado_anterior && (
                              <>
                                <EstadoBadge estado={h.estado_anterior} />
                                <span className="text-muted-foreground">
                                  →
                                </span>
                              </>
                            )}
                            <EstadoBadge estado={h.estado_nuevo} />
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {dateTime(h.changed_at)}
                          </span>
                        </div>
                        {h.comentario && (
                          <p className="mt-2 text-sm">{h.comentario}</p>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {canWrite && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cambiar estado</CardTitle>
              <CardDescription>
                El cambio queda registrado en el historial inmutable.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CambioEstadoForm
                procesoId={proceso.id}
                estadoActual={proceso.estado}
                monto={Number(proceso.monto)}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
