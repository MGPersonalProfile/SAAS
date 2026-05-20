import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

const VENTANA_DIAS = 90;
const THRESHOLD = 500_000; // L. Suma total que dispara la alerta.
const MIN_COUNT = 3; // Número mínimo de procesos en el grupo.

export interface AlertaFraccionamiento {
  responsable: string;
  objeto_prefix: string;
  count: number;
  total: number;
  procesos: Pick<Tables<"procesos">, "id" | "codigo" | "descripcion" | "monto" | "estado" | "created_at">[];
}

/**
 * Detecta posibles casos de fraccionamiento: 3+ procesos con el mismo
 * responsable y prefijo de objeto presupuestario en una ventana de 90 días,
 * cuya suma total supera L 500,000.
 *
 * Heurística simple — la fuente de verdad sigue siendo el revisor humano.
 */
export async function getFraccionamientoAlertas(): Promise<
  AlertaFraccionamiento[]
> {
  const supabase = await createClient();
  const cutoff = new Date(
    Date.now() - VENTANA_DIAS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from("procesos")
    .select("id, codigo, descripcion, monto, estado, created_at, responsable, objeto")
    .gte("created_at", cutoff)
    .not("responsable", "is", null)
    .not("estado", "eq", "Cerrado");
  if (error) throw error;

  // Agrupar en JS (Supabase JS client no expone GROUP BY directo).
  const groups = new Map<string, AlertaFraccionamiento>();
  for (const p of data ?? []) {
    if (!p.responsable) continue;
    const objetoPrefix = (p.objeto ?? "").slice(0, 3) || "—";
    const key = `${p.responsable}::${objetoPrefix}`;
    const prev = groups.get(key);
    const proceso = {
      id: p.id,
      codigo: p.codigo,
      descripcion: p.descripcion,
      monto: p.monto,
      estado: p.estado,
      created_at: p.created_at,
    };
    if (prev) {
      prev.count += 1;
      prev.total += Number(p.monto ?? 0);
      prev.procesos.push(proceso);
    } else {
      groups.set(key, {
        responsable: p.responsable,
        objeto_prefix: objetoPrefix,
        count: 1,
        total: Number(p.monto ?? 0),
        procesos: [proceso],
      });
    }
  }

  return Array.from(groups.values())
    .filter((g) => g.count >= MIN_COUNT && g.total > THRESHOLD)
    .sort((a, b) => b.total - a.total);
}

export const FRACCIONAMIENTO_CONFIG = {
  ventanaDias: VENTANA_DIAS,
  threshold: THRESHOLD,
  minCount: MIN_COUNT,
};
