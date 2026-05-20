import Link from "next/link";
import { FileIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { requireModule } from "@/lib/auth";
import { listAllDocumentos } from "@/lib/db/documentos";
import { dateTime } from "@/lib/format";

export const metadata = { title: "Documentos" };

function formatBytes(b: number | null): string {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function DocumentosPage() {
  await requireModule("documentos");
  const docs = await listAllDocumentos(100);

  return (
    <>
      <PageHeader
        title="Documentos"
        description="Archivos adjuntos a procesos de compra. Los últimos 100, ordenados por fecha de subida."
      />

      <Card>
        <CardContent className="pt-6">
          {docs.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Aún no se han subido documentos. Adjúntalos desde la página de
              cada proceso.
            </div>
          ) : (
            <ul className="divide-y">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-3">
                  <FileIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{d.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.procesos ? (
                        <Link
                          href={`/compras/${d.proceso_id}`}
                          className="hover:underline"
                        >
                          {d.procesos.codigo}
                        </Link>
                      ) : (
                        `Proceso #${d.proceso_id}`
                      )}
                      {" · "}
                      {dateTime(d.uploaded_at)}
                      {d.size_bytes ? ` · ${formatBytes(d.size_bytes)}` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/compras/${d.proceso_id}`}
                    className="text-xs text-primary underline-offset-4 hover:underline"
                  >
                    Ver proceso →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
