"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileIcon, Download, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import {
  registrarDocumento,
  obtenerSignedUrl,
  eliminarDocumento,
} from "@/app/(app)/compras/[id]/documento-actions";
import { dateTime } from "@/lib/format";
import type { Tables } from "@/types/database";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

interface DocumentosPanelProps {
  procesoId: number;
  docs: Tables<"documentos">[];
  canWrite: boolean;
  canDelete: boolean;
}

export function DocumentosPanel({
  procesoId,
  docs,
  canWrite,
  canDelete,
}: DocumentosPanelProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [, startTransition] = useTransition();

  async function handleUpload(file: File) {
    if (file.size > MAX_BYTES) {
      toast.error(`Archivo demasiado grande (máx. 10 MB)`);
      return;
    }
    setUploading(true);
    const supabase = createClient();

    // Path: procesos/{procesoId}/{timestamp}-{nombre}
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
    const storagePath = `procesos/${procesoId}/${Date.now()}-${safeName}`;

    const { error: uploadErr } = await supabase.storage
      .from("documentos")
      .upload(storagePath, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadErr) {
      setUploading(false);
      toast.error("Error al subir: " + uploadErr.message);
      return;
    }

    const result = await registrarDocumento({
      procesoId,
      nombre: file.name,
      storagePath,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
    });

    setUploading(false);

    if (!result.ok) {
      // Si falla el insert, limpiar el archivo del storage
      await supabase.storage.from("documentos").remove([storagePath]);
      toast.error(result.error);
      return;
    }

    toast.success(`"${file.name}" subido`);
    router.refresh();
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  }

  async function handleDownload(doc: Tables<"documentos">) {
    const result = await obtenerSignedUrl(doc.storage_path);
    if (!result.ok || !result.url) {
      toast.error(result.ok ? "Sin URL" : result.error);
      return;
    }
    window.open(result.url, "_blank");
  }

  function handleDelete(doc: Tables<"documentos">) {
    if (!confirm(`¿Eliminar "${doc.nombre}"?`)) return;
    startTransition(async () => {
      const result = await eliminarDocumento(doc.id, doc.storage_path, procesoId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Documento eliminado");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {canWrite && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`rounded-lg border-2 border-dashed p-6 text-center transition ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30"
          }`}
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm">
            Arrastra un archivo aquí o{" "}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-primary underline-offset-4 hover:underline"
              disabled={uploading}
            >
              elige uno
            </button>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF, imágenes, Office. Máx. 10 MB.
          </p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.xls,.xlsx,.doc,.docx"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
              e.target.value = "";
            }}
          />
          {uploading && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Subiendo…
            </div>
          )}
        </div>
      )}

      {docs.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Sin documentos adjuntos.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {docs.map((d) => (
            <li
              key={d.id}
              className="flex items-center gap-3 px-3 py-2 hover:bg-muted/30"
            >
              <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{d.nombre}</p>
                <p className="text-xs text-muted-foreground">
                  {dateTime(d.uploaded_at)}
                  {d.size_bytes ? ` · ${formatBytes(d.size_bytes)}` : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDownload(d)}
                aria-label="Descargar"
              >
                <Download className="h-4 w-4" />
              </Button>
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(d)}
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      <Separator className="opacity-0" />
    </div>
  );
}

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}
