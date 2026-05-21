"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { roleCanWrite } from "@/lib/auth/permissions";
import { paccSchema, type PaccInput } from "@/lib/db/pacc-schema";

export type PaccActionResult =
  | { ok: true; id?: number }
  | { ok: false; error: string };

function normalize(input: PaccInput) {
  return {
    linea: input.linea,
    objeto: input.objeto || null,
    descripcion: input.descripcion,
    mes: input.mes || null,
    modalidad: input.modalidad || null,
    fuente: input.fuente || null,
    valor: input.valor ?? null,
    unidad: input.unidad || null,
    eje: input.eje || null,
    estado: input.estado || "Programado",
  };
}

export async function createPaccLine(
  input: PaccInput,
): Promise<PaccActionResult> {
  const profile = await requireProfile();
  if (!roleCanWrite(profile.role)) {
    return { ok: false, error: "Sin permiso para crear líneas del PACC." };
  }

  const parsed = paccSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pacc")
    .insert(normalize(parsed.data))
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  await supabase.from("audit_log").insert({
    usuario_id: profile.id,
    username: profile.username,
    accion: "Creó línea PACC",
    modulo: "PACC",
    detalle: `Línea ${parsed.data.linea}: ${parsed.data.descripcion.slice(0, 80)}`,
  });

  revalidatePath("/pacc");
  revalidatePath("/dashboard");
  return { ok: true, id: data.id };
}

export async function updatePaccLine(
  id: number,
  input: PaccInput,
): Promise<PaccActionResult> {
  const profile = await requireProfile();
  if (!roleCanWrite(profile.role)) {
    return { ok: false, error: "Sin permiso para editar líneas del PACC." };
  }

  const parsed = paccSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("pacc")
    .update(normalize(parsed.data))
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  await supabase.from("audit_log").insert({
    usuario_id: profile.id,
    username: profile.username,
    accion: "Editó línea PACC",
    modulo: "PACC",
    detalle: `Línea ${parsed.data.linea}: ${parsed.data.descripcion.slice(0, 80)}`,
  });

  revalidatePath(`/pacc/${id}`);
  revalidatePath("/pacc");
  revalidatePath("/dashboard");
  return { ok: true, id };
}

export async function deletePaccLine(id: number): Promise<PaccActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "admin") {
    return { ok: false, error: "Solo admin puede eliminar líneas del PACC." };
  }

  const supabase = await createClient();

  // Bloqueo si hay procesos vinculados (la FK ON DELETE RESTRICT lo haría
  // de todos modos, pero un mensaje claro vale más que un error de Postgres).
  const { count: procesosCount } = await supabase
    .from("procesos")
    .select("*", { count: "exact", head: true })
    .eq("pacc_id", id);
  if ((procesosCount ?? 0) > 0) {
    return {
      ok: false,
      error: `No se puede eliminar: hay ${procesosCount} proceso(s) de compra asociado(s) a esta línea.`,
    };
  }

  const { data: existing } = await supabase
    .from("pacc")
    .select("linea, descripcion")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("pacc").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  await supabase.from("audit_log").insert({
    usuario_id: profile.id,
    username: profile.username,
    accion: "Eliminó línea PACC",
    modulo: "PACC",
    detalle: existing
      ? `Línea ${existing.linea}: ${(existing.descripcion ?? "").slice(0, 80)}`
      : `id=${id}`,
  });

  revalidatePath("/pacc");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function createPaccAndRedirect(input: PaccInput) {
  const result = await createPaccLine(input);
  if (result.ok && result.id) {
    redirect(`/pacc/${result.id}`);
  }
  return result;
}
