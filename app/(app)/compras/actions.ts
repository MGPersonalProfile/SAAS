"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { roleCanWrite } from "@/lib/auth/permissions";
import {
  cambioEstadoSchema,
  procesoSchema,
  type CambioEstadoInput,
  type ProcesoInput,
} from "@/lib/db/procesos-schema";

export type ActionResult =
  | { ok: true; id?: number }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createProceso(input: ProcesoInput): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!roleCanWrite(profile.role)) {
    return { ok: false, error: "Sin permiso para crear procesos." };
  }

  const parsed = procesoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const baseInsert = {
    codigo: parsed.data.codigo,
    linea_pacc: parsed.data.linea_pacc || null,
    objeto: parsed.data.objeto || null,
    descripcion: parsed.data.descripcion,
    monto: parsed.data.monto,
    estado: parsed.data.estado,
    responsable: parsed.data.responsable || null,
    prioridad: parsed.data.prioridad,
    created_by: profile.id,
    updated_by: profile.id,
  };
  const withPaccId = { ...baseInsert, pacc_id: parsed.data.pacc_id ?? null };

  let { data, error } = await supabase
    .from("procesos")
    .insert(withPaccId)
    .select("id")
    .single();

  // Fallback si la migración 0007 (columna pacc_id) no se ha aplicado.
  if (error && /pacc_id/i.test(error.message)) {
    const retry = await supabase
      .from("procesos")
      .insert(baseInsert)
      .select("id")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Error al crear" };
  }

  await supabase.from("audit_log").insert({
    usuario_id: profile.id,
    username: profile.username,
    accion: "Creó proceso",
    modulo: "Compras",
    detalle: parsed.data.codigo,
  });

  revalidatePath("/compras");
  revalidatePath("/dashboard");
  return { ok: true, id: data.id };
}

export async function updateProceso(
  id: number,
  input: Omit<ProcesoInput, "estado">,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!roleCanWrite(profile.role)) {
    return { ok: false, error: "Sin permiso para editar procesos." };
  }

  // El estado se cambia vía RPC change_proceso_estado para que pase por el trigger
  // de historial; aquí solo permitimos editar el resto de campos.
  const editSchema = procesoSchema.omit({ estado: true });
  const parsed = editSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const baseUpdate = {
    codigo: parsed.data.codigo,
    linea_pacc: parsed.data.linea_pacc || null,
    objeto: parsed.data.objeto || null,
    descripcion: parsed.data.descripcion,
    monto: parsed.data.monto,
    responsable: parsed.data.responsable || null,
    prioridad: parsed.data.prioridad,
    updated_by: profile.id,
  };
  const withPaccId = { ...baseUpdate, pacc_id: parsed.data.pacc_id ?? null };

  let { error } = await supabase
    .from("procesos")
    .update(withPaccId)
    .eq("id", id);

  if (error && /pacc_id/i.test(error.message)) {
    const retry = await supabase
      .from("procesos")
      .update(baseUpdate)
      .eq("id", id);
    error = retry.error;
  }

  if (error) return { ok: false, error: error.message };

  await supabase.from("audit_log").insert({
    usuario_id: profile.id,
    username: profile.username,
    accion: "Actualizó proceso",
    modulo: "Compras",
    detalle: parsed.data.codigo,
  });

  revalidatePath(`/compras/${id}`);
  revalidatePath("/compras");
  return { ok: true, id };
}

export async function cambiarEstado(
  input: CambioEstadoInput,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!roleCanWrite(profile.role)) {
    return { ok: false, error: "Sin permiso para cambiar el estado." };
  }

  const parsed = cambioEstadoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("change_proceso_estado", {
    p_proceso_id: parsed.data.proceso_id,
    p_estado_nuevo: parsed.data.estado_nuevo,
    p_comentario: parsed.data.comentario,
  });

  if (error) return { ok: false, error: error.message };

  await supabase.from("audit_log").insert({
    usuario_id: profile.id,
    username: profile.username,
    accion: `Cambió estado a "${parsed.data.estado_nuevo}"`,
    modulo: "Compras",
    detalle: `proceso #${parsed.data.proceso_id}: ${parsed.data.comentario}`,
  });

  revalidatePath(`/compras/${parsed.data.proceso_id}`);
  revalidatePath("/compras");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function createProcesoAndRedirect(input: ProcesoInput) {
  const result = await createProceso(input);
  if (result.ok && result.id) {
    redirect(`/compras/${result.id}`);
  }
  return result;
}
