import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export interface PaccFilters {
  q?: string;
  mes?: string;
  modalidad?: string;
  fuente?: string;
  page?: number;
  pageSize?: number;
}

export interface PaccResult {
  rows: Tables<"pacc">[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 25;

export async function listPacc(filters: PaccFilters = {}): Promise<PaccResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.max(1, Math.min(100, filters.pageSize ?? DEFAULT_PAGE_SIZE));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("pacc")
    .select("*", { count: "exact" })
    .order("valor", { ascending: false, nullsFirst: false });

  if (filters.q && filters.q.trim()) {
    const term = filters.q.trim();
    // Búsqueda full-text en español sobre el campo search_vector definido en
    // el esquema (descripcion + objeto + linea, con pesos A/B/C). Para
    // tolerar consultas multi-palabra, transformamos a websearch syntax.
    query = query.textSearch("search_vector", term, {
      type: "websearch",
      config: "spanish",
    });
  }
  if (filters.mes) query = query.eq("mes", filters.mes);
  if (filters.modalidad) query = query.eq("modalidad", filters.modalidad);
  if (filters.fuente) query = query.eq("fuente", filters.fuente);

  const { data, count, error } = await query.range(from, to);
  if (error) throw error;

  const total = count ?? 0;
  return {
    rows: data ?? [],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Valores únicos para los selects de filtros (mes, modalidad, fuente).
 * Cached implícitamente por Next.js si la página es estática; aquí es dinámica.
 */
export async function getPaccFacets(): Promise<{
  meses: string[];
  modalidades: string[];
  fuentes: string[];
}> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pacc")
    .select("mes, modalidad, fuente");

  const meses = new Set<string>();
  const modalidades = new Set<string>();
  const fuentes = new Set<string>();
  for (const row of data ?? []) {
    if (row.mes) meses.add(row.mes);
    if (row.modalidad) modalidades.add(row.modalidad);
    if (row.fuente) fuentes.add(row.fuente);
  }

  return {
    meses: Array.from(meses).sort((a, b) => Number(a) - Number(b)),
    modalidades: Array.from(modalidades).sort(),
    fuentes: Array.from(fuentes).sort(),
  };
}
