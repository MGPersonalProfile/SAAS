"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { roleCanWrite } from "@/lib/auth/permissions";
import { budgetSchema, type BudgetInput } from "@/lib/db/budget-schema";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function upsertBudget(
  input: BudgetInput & { id?: number },
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!roleCanWrite(profile.role)) {
    return { ok: false, error: "Sin permiso para editar el presupuesto." };
  }

  const parsed = budgetSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { concepto, monto, nota } = parsed.data;
  const supabase = await createClient();

  if (input.id) {
    // Bloquear edición de partidas derivadas: su monto se calcula desde procesos.
    const { data: existing } = await supabase
      .from("budget")
      .select("tipo")
      .eq("id", input.id)
      .maybeSingle();
    if (existing?.tipo === "derivado") {
      return {
        ok: false,
        error:
          "Esta partida se calcula automáticamente desde los procesos del sistema. No es editable.",
      };
    }

    const { error } = await supabase
      .from("budget")
      .update({
        concepto,
        monto,
        nota: nota || null,
        updated_by: profile.id,
      })
      .eq("id", input.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("budget").insert({
      concepto,
      monto,
      nota: nota || null,
      updated_by: profile.id,
    });
    if (error) return { ok: false, error: error.message };
  }

  await supabase.from("audit_log").insert({
    usuario_id: profile.id,
    username: profile.username,
    accion: input.id ? "Actualizó partida" : "Creó partida",
    modulo: "Presupuesto",
    detalle: concepto,
  });

  revalidatePath("/presupuesto");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteBudget(id: number): Promise<ActionResult> {
  const profile = await requireProfile();
  if (profile.role !== "admin") {
    return { ok: false, error: "Solo admin puede eliminar partidas." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("budget")
    .select("concepto, tipo")
    .eq("id", id)
    .maybeSingle();

  if (existing?.tipo === "derivado") {
    return {
      ok: false,
      error:
        "Esta partida se calcula automáticamente desde los procesos. No se puede eliminar.",
    };
  }

  const { error } = await supabase.from("budget").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  await supabase.from("audit_log").insert({
    usuario_id: profile.id,
    username: profile.username,
    accion: "Eliminó partida",
    modulo: "Presupuesto",
    detalle: existing?.concepto ?? `id=${id}`,
  });

  revalidatePath("/presupuesto");
  revalidatePath("/dashboard");
  return { ok: true };
}
