import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

/**
 * Lectura del presupuesto. Apunta a `budget_view`, no a `budget` directamente,
 * para que las partidas de tipo `derivado` (Comprometido, Ejecutado, Disponible
 * real) lleguen ya calculadas desde los procesos del sistema.
 *
 * Fallback: si la vista todavía no existe (migración 0006 sin aplicar),
 * cae a `budget` y marca todas las filas como 'estatico'. La app queda
 * funcionando sin interconexión hasta que se aplique la migración.
 */
export async function listBudget(): Promise<Tables<"budget_view">[]> {
  const supabase = await createClient();
  const viewRes = await supabase.from("budget_view").select("*").order("id");
  if (!viewRes.error) return viewRes.data ?? [];

  const tableRes = await supabase.from("budget").select("*").order("id");
  if (tableRes.error) throw tableRes.error;
  return (tableRes.data ?? []).map((r) => ({ ...r, tipo: "estatico" as const }));
}

export async function getBudget(
  id: number,
): Promise<Tables<"budget_view"> | null> {
  const supabase = await createClient();
  const viewRes = await supabase
    .from("budget_view")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!viewRes.error) return viewRes.data;

  const tableRes = await supabase
    .from("budget")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (tableRes.error) throw tableRes.error;
  return tableRes.data
    ? { ...tableRes.data, tipo: "estatico" as const }
    : null;
}
