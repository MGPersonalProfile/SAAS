import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { EstadoBadge } from "@/components/compras/estado-badge";
import { PaccDeleteButton } from "@/components/pacc/pacc-delete-button";
import { PaccExecutionCard } from "@/components/pacc/pacc-execution-card";
import { requireModule } from "@/lib/auth";
import { roleCanWrite } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";
import { listProcesosByPacc } from "@/lib/db/procesos";
import { getPaccLineExecution } from "@/lib/db/pacc";
import { money, dateOnly } from "@/lib/format";

const MES_NOMBRES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

interface DetailProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DetailProps) {
  const { id } = await params;
  return { title: `Línea PACC ${id}` };
}

export default async function PaccDetallePage({ params }: DetailProps) {
  const profile = await requireModule("pacc");
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

  const [procesos, execution] = await Promise.all([
    listProcesosByPacc(id),
    getPaccLineExecution(id),
  ]);
  const canWrite = roleCanWrite(profile.role);
  const canDelete = profile.role === "admin";
  const mesLabel =
    linea.mes && Number(linea.mes) >= 1 && Number(linea.mes) <= 12
      ? MES_NOMBRES[Number(linea.mes) - 1]
      : (linea.mes ?? "—");

  const totalProcesos = procesos.reduce(
    (sum, p) => sum + Number(p.monto ?? 0),
    0,
  );

  return (
    <>
      <PageHeader
        title={`Línea ${linea.linea} — Objeto ${linea.objeto ?? "—"}`}
        description={linea.descripcion?.slice(0, 160) ?? ""}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/pacc">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Volver
              </Link>
            </Button>
            {canWrite && (
              <Button asChild size="sm">
                <Link href={`/compras/nuevo?pacc=${linea.id}`}>
                  <Plus className="mr-1 h-4 w-4" />
                  Crear proceso
                </Link>
              </Button>
            )}
            {canWrite && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/pacc/${linea.id}/editar`}>
                  <Pencil className="mr-1 h-4 w-4" />
                  Editar
                </Link>
              </Button>
            )}
            {canDelete && (
              <PaccDeleteButton
                id={linea.id}
                linea={linea.linea}
                descripcion={linea.descripcion}
                procesosCount={procesos.length}
              />
            )}
          </div>
        }
      />

      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Línea">{linea.linea ?? "—"}</Field>
            <Field label="Objeto presupuestario">{linea.objeto ?? "—"}</Field>
            <Field label="Mes programado">{mesLabel}</Field>
            <Field label="Modalidad">
              {linea.modalidad ? (
                <Badge variant="outline" className="font-normal">
                  {linea.modalidad}
                </Badge>
              ) : (
                "—"
              )}
            </Field>
            <Field label="Fuente">{linea.fuente ?? "—"}</Field>
            <Field label="Estado">
              <Badge variant="outline" className="font-normal">
                {linea.estado}
              </Badge>
            </Field>
            <Field label="Valor programado">
              <span className="text-lg font-semibold tabular-nums">
                {linea.valor != null ? money(Number(linea.valor)) : "—"}
              </span>
            </Field>
            <Field label="Unidad ejecutora">{linea.unidad ?? "—"}</Field>
          </div>

          <Separator />

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Descripción
            </p>
            <p className="mt-1 text-sm whitespace-pre-wrap">
              {linea.descripcion ?? "—"}
            </p>
          </div>

          {linea.eje && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Eje estratégico
              </p>
              <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
                {linea.eje}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <PaccExecutionCard execution={execution} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Procesos asociados ({procesos.length})
            {procesos.length > 0 && (
              <span className="ml-3 text-sm font-normal text-muted-foreground tabular-nums">
                · Total {money(totalProcesos)}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {procesos.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No hay procesos creados para esta línea.
            </p>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Responsable
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Creado
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {procesos.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">
                        <Link
                          href={`/compras/${p.id}`}
                          className="text-primary hover:underline"
                        >
                          {p.codigo}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {money(Number(p.monto))}
                      </TableCell>
                      <TableCell>
                        <EstadoBadge estado={p.estado} />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {p.responsable ?? "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {dateOnly(p.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
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
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}
