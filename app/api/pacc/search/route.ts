import { NextResponse } from "next/server";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Búsqueda rápida de líneas PACC para el combobox del formulario de
 * proceso. Devuelve hasta 20 resultados ordenados por valor descendente,
 * con campos mínimos para mostrar en la lista.
 */
export async function GET(request: Request) {
  await requireProfile();
  const supabase = await createClient();
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  let query = supabase
    .from("pacc")
    .select("id, linea, objeto, descripcion, modalidad, valor")
    .order("valor", { ascending: false, nullsFirst: false })
    .limit(20);

  if (q) {
    query = query.or(
      `descripcion.ilike.%${q}%,objeto.ilike.%${q}%,linea.ilike.%${q}%`,
    );
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}
