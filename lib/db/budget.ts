import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

/**
 * Lectura del presupuesto. Apunta a `budget_view`, no a `budget` directamente,
 * para que las partidas de tipo `derivado` (Comprometido, Ejecutado, Disponible
 * real) lleguen ya calculadas desde los procesos del sistema.
 */
export async function listBudget(): Promise<Tables<"budget_view">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget_view")
    .select("*")
    .order("id");
  if (error) throw error;
  return data ?? [];
}

export async function getBudget(
  id: number,
): Promise<Tables<"budget_view"> | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget_view")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
