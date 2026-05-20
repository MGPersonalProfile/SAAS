"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { roleCanWrite } from "@/lib/auth/permissions";

export type ImportResult =
  | { ok: true; inserted: number; updated: number }
  | { ok: false; error: string; errors?: string[] };

const budgetRowSchema = z.object({
  concepto: z.string().trim().min(3).max(150),
  monto: z.number().nonnegative().finite(),
  nota: z.string().trim().max(500).optional().or(z.literal("")).nullable(),
});

const paccRowSchema = z.object({
  linea: z.string().trim().max(50).optional().nullable(),
  objeto: z.string().trim().max(50).optional().nullable(),
  descripcion: z.string().trim().max(2000).optional().nullable(),
  mes: z.string().trim().max(20).optional().nullable(),
  modalidad: z.string().trim().max(150).optional().nullable(),
  fuente: z.string().trim().max(150).optional().nullable(),
  valor: z.number().finite().optional().nullable(),
  unidad: z.string().trim().max(150).optional().nullable(),
  eje: z.string().trim().optional().nullable(),
  estado: z.string().trim().max(50).optional().nullable(),
});

export async function importBudget(
  rows: unknown[],
): Promise<ImportResult> {
  const profile = await requireProfile();
  if (!roleCanWrite(profile.role)) {
    return { ok: false, error: "Sin permiso para importar presupuesto." };
  }

  const errors: string[] = [];
  const valid: z.infer<typeof budgetRowSchema>[] = [];
  rows.forEach((r, i) => {
    const parsed = budgetRowSchema.safeParse(r);
    if (parsed.success) valid.push(parsed.data);
    else
      errors.push(
        `Fila ${i + 2}: ${parsed.error.issues.map((e) => `${e.path.join(".")} ${e.message}`).join(", ")}`,
      );
  });

  if (errors.length > 0 && valid.length === 0) {
    return { ok: false, error: "Ninguna fila válida.", errors: errors.slice(0, 10) };
  }

  const supabase = await createClient();
  let inserted = 0;
  let updated = 0;

  for (const row of valid) {
    const { data: existing } = await supabase
      .from("budget")
      .select("id")
      .eq("concepto", row.concepto)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("budget")
        .update({
          monto: row.monto,
          nota: row.nota || null,
          updated_by: profile.id,
        })
        .eq("id", existing.id);
      if (!error) updated += 1;
    } else {
      const { error } = await supabase.from("budget").insert({
        concepto: row.concepto,
        monto: row.monto,
        nota: row.nota || null,
        updated_by: profile.id,
      });
      if (!error) inserted += 1;
    }
  }

  await supabase.from("audit_log").insert({
    usuario_id: profile.id,
    username: profile.username,
    accion: "Importó presupuesto CSV",
    modulo: "Importar",
    detalle: `${inserted} insertados, ${updated} actualizados${errors.length ? `, ${errors.length} errores` : ""}`,
  });

  revalidatePath("/presupuesto");
  revalidatePath("/dashboard");
  revalidatePath("/importar");
  return { ok: true, inserted, updated };
}

export async function importPacc(
  rows: unknown[],
  replaceAll: boolean,
): Promise<ImportResult> {
  const profile = await requireProfile();
  if (!roleCanWrite(profile.role)) {
    return { ok: false, error: "Sin permiso para importar PACC." };
  }

  const errors: string[] = [];
  const valid: z.infer<typeof paccRowSchema>[] = [];
  rows.forEach((r, i) => {
    const parsed = paccRowSchema.safeParse(r);
    if (parsed.success) valid.push(parsed.data);
    else
      errors.push(
        `Fila ${i + 2}: ${parsed.error.issues.map((e) => `${e.path.join(".")} ${e.message}`).join(", ")}`,
      );
  });

  if (errors.length > 0 && valid.length === 0) {
    return { ok: false, error: "Ninguna fila válida.", errors: errors.slice(0, 10) };
  }

  const supabase = await createClient();

  if (replaceAll) {
    // Sustituir el PACC completo. Solo admin.
    if (profile.role !== "admin") {
      return {
        ok: false,
        error: "Solo admin puede reemplazar el PACC completo.",
      };
    }
    await supabase.from("pacc").delete().neq("id", -1);
  }

  // Insert por lotes de 500 para evitar timeouts.
  const BATCH = 500;
  let inserted = 0;
  for (let i = 0; i < valid.length; i += BATCH) {
    const slice = valid.slice(i, i + BATCH).map((r) => ({
      linea: r.linea ?? null,
      objeto: r.objeto ?? null,
      descripcion: r.descripcion ?? null,
      mes: r.mes ?? null,
      modalidad: r.modalidad ?? null,
      fuente: r.fuente ?? null,
      valor: r.valor ?? null,
      unidad: r.unidad ?? null,
      eje: r.eje ?? null,
      estado: r.estado || "Programado",
    }));
    const { error } = await supabase.from("pacc").insert(slice);
    if (!error) inserted += slice.length;
  }

  await supabase.from("audit_log").insert({
    usuario_id: profile.id,
    username: profile.username,
    accion: replaceAll ? "Reemplazó PACC CSV" : "Importó PACC CSV",
    modulo: "Importar",
    detalle: `${inserted} líneas${errors.length ? `, ${errors.length} errores` : ""}`,
  });

  revalidatePath("/pacc");
  revalidatePath("/dashboard");
  revalidatePath("/importar");
  return { ok: true, inserted, updated: 0 };
}
