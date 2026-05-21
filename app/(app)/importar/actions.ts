"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { roleCanWrite } from "@/lib/auth/permissions";
import { PROCESO_ESTADOS, PROCESO_PRIORIDADES } from "@/lib/db/procesos-schema";
import type { ProcesoEstado, ProcesoPrioridad } from "@/types/database";

export type ImportResult =
  | { ok: true; inserted: number; updated: number; warnings?: string[] }
  | { ok: false; error: string; errors?: string[] };

const budgetRowSchema = z.object({
  concepto: z.string().trim().min(3).max(150),
  monto: z.number().nonnegative().finite(),
  nota: z.string().trim().max(500).optional().or(z.literal("")).nullable(),
});

const paccRowSchema = z.object({
  linea: z.string().trim().min(1, "linea es obligatorio").max(50),
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

const procesoRowSchema = z.object({
  codigo: z.string().trim().min(3).max(80),
  linea_pacc: z.string().trim().max(50).optional().nullable(),
  objeto: z.string().trim().max(50).optional().nullable(),
  descripcion: z.string().trim().min(5).max(2000),
  monto: z.number().nonnegative().finite(),
  estado: z.string().trim().max(50).optional().nullable(),
  responsable: z.string().trim().max(150).optional().nullable(),
  prioridad: z.string().trim().max(20).optional().nullable(),
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
    if (profile.role !== "admin") {
      return {
        ok: false,
        error: "Solo admin puede reemplazar el PACC completo.",
      };
    }
    await supabase.from("pacc").delete().neq("id", -1);
  }

  // Detecta duplicados de `linea` dentro del propio CSV: el upsert por
  // onConflict falla si la misma clave aparece dos veces en el mismo batch.
  // Si hay duplicados internos, los colapsamos en uno (queda la última
  // ocurrencia, que es lo que un usuario espera al re-cargar un Excel
  // editado) y avisamos por warnings.
  const byLinea = new Map<string, z.infer<typeof paccRowSchema>>();
  let internalDupes = 0;
  for (const r of valid) {
    if (byLinea.has(r.linea)) internalDupes += 1;
    byLinea.set(r.linea, r);
  }
  const deduped = Array.from(byLinea.values());

  // Upsert por `linea`. Requiere migración 0008 (UNIQUE en linea). Si la
  // migración no está aplicada, cae al insert tradicional como fallback.
  let inserted = 0;
  let updated = 0;
  const BATCH = 500;
  const upsertFailed: string[] = [];

  for (let i = 0; i < deduped.length; i += BATCH) {
    const slice = deduped.slice(i, i + BATCH).map((r) => ({
      linea: r.linea,
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

    // Determina cuántas líneas del batch ya existen para clasificar el
    // resultado entre inserted y updated.
    const lineas = slice.map((s) => s.linea);
    const { data: existing } = await supabase
      .from("pacc")
      .select("linea")
      .in("linea", lineas);
    const existingSet = new Set((existing ?? []).map((e) => e.linea));

    const { error } = await supabase
      .from("pacc")
      .upsert(slice, { onConflict: "linea" });

    if (error) {
      upsertFailed.push(error.message);
      // Fallback: insert directo (sin dedup). El usuario verá duplicados
      // pero al menos la importación no se queda muerta.
      const { error: insertErr } = await supabase.from("pacc").insert(slice);
      if (!insertErr) inserted += slice.length;
    } else {
      for (const s of slice) {
        if (existingSet.has(s.linea)) updated += 1;
        else inserted += 1;
      }
    }
  }

  const warnings: string[] = [];
  if (internalDupes > 0) {
    warnings.push(
      `Se detectaron ${internalDupes} líneas duplicadas dentro del archivo. Se conservó la última ocurrencia de cada una.`,
    );
  }
  if (upsertFailed.length > 0) {
    warnings.push(
      `Aviso técnico: upsert falló en algún batch (${upsertFailed[0]}). Se usó insert simple como respaldo. Verifica que la migración 0008 esté aplicada.`,
    );
  }

  await supabase.from("audit_log").insert({
    usuario_id: profile.id,
    username: profile.username,
    accion: replaceAll ? "Reemplazó PACC CSV" : "Importó PACC CSV (upsert)",
    modulo: "Importar",
    detalle: `${inserted} nuevos, ${updated} actualizados${errors.length ? `, ${errors.length} errores` : ""}${internalDupes ? `, ${internalDupes} dupes internos colapsados` : ""}`,
  });

  revalidatePath("/pacc");
  revalidatePath("/dashboard");
  revalidatePath("/importar");
  return { ok: true, inserted, updated, warnings: warnings.length ? warnings : undefined };
}

export async function importProcesos(
  rows: unknown[],
): Promise<ImportResult> {
  const profile = await requireProfile();
  if (!roleCanWrite(profile.role)) {
    return { ok: false, error: "Sin permiso para importar procesos." };
  }

  const errors: string[] = [];
  const valid: z.infer<typeof procesoRowSchema>[] = [];
  rows.forEach((r, i) => {
    const parsed = procesoRowSchema.safeParse(r);
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

  // Resuelve linea_pacc → pacc_id en una sola query batch.
  const lineas = Array.from(
    new Set(valid.map((r) => r.linea_pacc).filter((l): l is string => !!l && l.trim() !== "")),
  );
  const paccByLinea = new Map<string, number>();
  if (lineas.length > 0) {
    const { data: paccRows } = await supabase
      .from("pacc")
      .select("id, linea")
      .in("linea", lineas);
    for (const row of paccRows ?? []) {
      if (row.linea) paccByLinea.set(row.linea, row.id);
    }
  }

  // Detecta duplicados de `codigo` dentro del CSV: se conserva la última
  // ocurrencia para evitar conflictos en el batch upsert.
  const byCodigo = new Map<string, z.infer<typeof procesoRowSchema>>();
  let internalDupes = 0;
  for (const r of valid) {
    if (byCodigo.has(r.codigo)) internalDupes += 1;
    byCodigo.set(r.codigo, r);
  }
  const deduped = Array.from(byCodigo.values());

  // Normaliza estado y prioridad contra los enums conocidos. Valores no
  // reconocidos caen al default ("Solicitud creada" / "Normal").
  const estadoSet = new Set<string>(PROCESO_ESTADOS);
  const prioridadSet = new Set<string>(PROCESO_PRIORIDADES);
  let unknownEstado = 0;
  let unknownPrioridad = 0;
  let linesNoMatch = 0;

  let inserted = 0;
  let updated = 0;
  const BATCH = 500;
  const upsertFailed: string[] = [];

  for (let i = 0; i < deduped.length; i += BATCH) {
    const slice = deduped.slice(i, i + BATCH).map((r) => {
      const linea = r.linea_pacc?.trim() || null;
      const paccId = linea ? paccByLinea.get(linea) ?? null : null;
      if (linea && !paccId) linesNoMatch += 1;

      const estadoRaw = r.estado?.trim();
      const estadoOk = estadoRaw && estadoSet.has(estadoRaw);
      if (estadoRaw && !estadoOk) unknownEstado += 1;

      const prioridadRaw = r.prioridad?.trim();
      const prioridadOk = prioridadRaw && prioridadSet.has(prioridadRaw);
      if (prioridadRaw && !prioridadOk) unknownPrioridad += 1;

      return {
        codigo: r.codigo,
        linea_pacc: linea,
        pacc_id: paccId,
        objeto: r.objeto ?? null,
        descripcion: r.descripcion,
        monto: r.monto,
        estado: (estadoOk ? estadoRaw : "Solicitud creada") as ProcesoEstado,
        responsable: r.responsable ?? null,
        prioridad: (prioridadOk ? prioridadRaw : "Normal") as ProcesoPrioridad,
        created_by: profile.id,
        updated_by: profile.id,
      };
    });

    const codigos = slice.map((s) => s.codigo);
    const { data: existing } = await supabase
      .from("procesos")
      .select("codigo")
      .in("codigo", codigos);
    const existingSet = new Set((existing ?? []).map((e) => e.codigo));

    // Primer intento: upsert con pacc_id.
    const { error } = await supabase
      .from("procesos")
      .upsert(slice, { onConflict: "codigo" });

    if (error && /pacc_id/i.test(error.message)) {
      // Fallback: sin pacc_id (migración 0007 no aplicada).
      const sliceNoFk = slice.map(({ pacc_id: _omit, ...rest }) => rest);
      const { error: retry } = await supabase
        .from("procesos")
        .upsert(sliceNoFk, { onConflict: "codigo" });
      if (retry) upsertFailed.push(retry.message);
      else {
        for (const s of slice) {
          if (existingSet.has(s.codigo)) updated += 1;
          else inserted += 1;
        }
      }
    } else if (error) {
      upsertFailed.push(error.message);
    } else {
      for (const s of slice) {
        if (existingSet.has(s.codigo)) updated += 1;
        else inserted += 1;
      }
    }
  }

  const warnings: string[] = [];
  if (internalDupes > 0) {
    warnings.push(
      `${internalDupes} códigos duplicados dentro del archivo. Se conservó la última ocurrencia.`,
    );
  }
  if (linesNoMatch > 0) {
    warnings.push(
      `${linesNoMatch} procesos referenciaban una línea PACC que no existe. Se importaron sin vínculo PACC.`,
    );
  }
  if (unknownEstado > 0) {
    warnings.push(
      `${unknownEstado} filas tenían un estado no reconocido. Se asignó "Solicitud creada".`,
    );
  }
  if (unknownPrioridad > 0) {
    warnings.push(
      `${unknownPrioridad} filas tenían una prioridad no reconocida. Se asignó "Normal".`,
    );
  }
  if (upsertFailed.length > 0) {
    warnings.push(
      `Aviso técnico: upsert falló (${upsertFailed[0]}).`,
    );
  }

  await supabase.from("audit_log").insert({
    usuario_id: profile.id,
    username: profile.username,
    accion: "Importó procesos CSV (upsert)",
    modulo: "Importar",
    detalle: `${inserted} nuevos, ${updated} actualizados${errors.length ? `, ${errors.length} errores` : ""}`,
  });

  revalidatePath("/compras");
  revalidatePath("/dashboard");
  revalidatePath("/presupuesto");
  revalidatePath("/importar");
  return { ok: true, inserted, updated, warnings: warnings.length ? warnings : undefined };
}
