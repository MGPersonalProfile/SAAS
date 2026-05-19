import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export async function listBudget(): Promise<Tables<"budget">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget")
    .select("*")
    .order("id");
  if (error) throw error;
  return data ?? [];
}

export async function getBudget(id: number): Promise<Tables<"budget"> | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
