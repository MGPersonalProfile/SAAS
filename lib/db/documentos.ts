import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type DocumentoConProceso = Tables<"documentos"> & {
  procesos: { codigo: string; descripcion: string | null } | null;
};

export async function listDocumentosByProceso(
  procesoId: number,
): Promise<Tables<"documentos">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documentos")
    .select("*")
    .eq("proceso_id", procesoId)
    .order("uploaded_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listAllDocumentos(
  limit = 50,
): Promise<DocumentoConProceso[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documentos")
    .select("*, procesos(codigo, descripcion)")
    .order("uploaded_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as DocumentoConProceso[];
}

export async function getSignedUrl(storagePath: string, expiresIn = 300) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("documentos")
    .createSignedUrl(storagePath, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
