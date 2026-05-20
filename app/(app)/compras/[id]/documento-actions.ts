"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { roleCanWrite } from "@/lib/auth/permissions";

export type DocumentoActionResult =
  | { ok: true; url?: string }
  | { ok: false; error: string };

export async function registrarDocumento(input: {
  procesoId: number;
  nombre: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
}): Promise<DocumentoActionResult> {
  const profile = await requireProfile();
  if (!roleCanWrite(profile.role)) {
    return { ok: false, error: "Sin permiso para subir documentos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("documentos").insert({
    proceso_id: input.procesoId,
    nombre: input.nombre,
    storage_path: input.storagePath,
    mime_type: input.mimeType,
    size_bytes: input.sizeBytes,
    uploaded_by: profile.id,
  });
  if (error) return { ok: false, error: error.message };

  await supabase.from("audit_log").insert({
    usuario_id: profile.id,
    username: profile.username,
    accion: "Subió documento",
    modulo: "Documentos",
    detalle: `proceso #${input.procesoId}: ${input.nombre}`,
  });

  revalidatePath(`/compras/${input.procesoId}`);
  revalidatePath("/documentos");
  return { ok: true };
}

export async function obtenerSignedUrl(
  storagePath: string,
): Promise<DocumentoActionResult> {
  await requireProfile();
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("documentos")
    .createSignedUrl(storagePath, 300);
  if (error || !data) return { ok: false, error: error?.message ?? "Error" };
  return { ok: true, url: data.signedUrl };
}

export async function eliminarDocumento(
  id: number,
  storagePath: string,
  procesoId: number,
): Promise<DocumentoActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "admin") {
    return { ok: false, error: "Solo admin puede eliminar documentos." };
  }

  const supabase = await createClient();

  const { error: storageErr } = await supabase.storage
    .from("documentos")
    .remove([storagePath]);
  if (storageErr) return { ok: false, error: storageErr.message };

  const { error: dbErr } = await supabase
    .from("documentos")
    .delete()
    .eq("id", id);
  if (dbErr) return { ok: false, error: dbErr.message };

  await supabase.from("audit_log").insert({
    usuario_id: profile.id,
    username: profile.username,
    accion: "Eliminó documento",
    modulo: "Documentos",
    detalle: `proceso #${procesoId}: ${storagePath}`,
  });

  revalidatePath(`/compras/${procesoId}`);
  revalidatePath("/documentos");
  return { ok: true };
}
