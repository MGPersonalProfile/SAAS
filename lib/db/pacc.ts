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

export interface PaccLineExecution {
  pacc_id: number;
  planeado: number;
  comprometido: number;
  ejecutado: number;
  disponible_linea: number;
  pct_ejecucion: number; // 0..100+ (puede pasarse de 100 si excede)
  procesos_count: number;
}

/**
 * Ejecución agregada de una línea PACC concreta. Usa la vista
 * `pacc_execution_view` (migración 0009). Si la vista no existe todavía,
 * cae a 0/sin-datos para no romper la página.
 */
export async function getPaccLineExecution(
  paccId: number,
): Promise<PaccLineExecution> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pacc_execution_view")
    .select("pacc_id, planeado, comprometido, ejecutado, procesos_count")
    .eq("pacc_id", paccId)
    .maybeSingle();

  if (error || !data) {
    // Fallback: calcular en aplicación.
    const [paccRes, procesosRes] = await Promise.all([
      supabase.from("pacc").select("valor").eq("id", paccId).maybeSingle(),
      supabase.from("procesos").select("estado, monto").eq("pacc_id", paccId),
    ]);
    const planeado = Number(paccRes.data?.valor ?? 0);
    const procs = procesosRes.data ?? [];
    let comprometido = 0;
    let ejecutado = 0;
    for (const p of procs) {
      const m = Number(p.monto);
      if (p.estado === "Pagado" || p.estado === "Cerrado") ejecutado += m;
      else if (p.estado !== "Solicitud creada") comprometido += m;
    }
    const disponible_linea = planeado - comprometido - ejecutado;
    const pct_ejecucion = planeado > 0 ? ((comprometido + ejecutado) / planeado) * 100 : 0;
    return {
      pacc_id: paccId,
      planeado,
      comprometido,
      ejecutado,
      disponible_linea,
      pct_ejecucion,
      procesos_count: procs.length,
    };
  }

  const planeado = Number(data.planeado ?? 0);
  const comprometido = Number(data.comprometido ?? 0);
  const ejecutado = Number(data.ejecutado ?? 0);
  return {
    pacc_id: data.pacc_id,
    planeado,
    comprometido,
    ejecutado,
    disponible_linea: planeado - comprometido - ejecutado,
    pct_ejecucion: planeado > 0 ? ((comprometido + ejecutado) / planeado) * 100 : 0,
    procesos_count: Number(data.procesos_count ?? 0),
  };
}

/**
 * Ejecución de varias líneas a la vez. Devuelve un Map indexado por pacc_id.
 * Útil para enriquecer el listado del PACC con el % ejecución de cada fila.
 */
export async function getPaccExecutionByIds(
  paccIds: number[],
): Promise<Map<number, PaccLineExecution>> {
  const out = new Map<number, PaccLineExecution>();
  if (paccIds.length === 0) return out;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pacc_execution_view")
    .select("pacc_id, planeado, comprometido, ejecutado, procesos_count")
    .in("pacc_id", paccIds);

  if (error || !data) return out; // fallback silencioso: la UI mostrará "—".

  for (const row of data) {
    const planeado = Number(row.planeado ?? 0);
    const comprometido = Number(row.comprometido ?? 0);
    const ejecutado = Number(row.ejecutado ?? 0);
    out.set(row.pacc_id, {
      pacc_id: row.pacc_id,
      planeado,
      comprometido,
      ejecutado,
      disponible_linea: planeado - comprometido - ejecutado,
      pct_ejecucion: planeado > 0 ? ((comprometido + ejecutado) / planeado) * 100 : 0,
      procesos_count: Number(row.procesos_count ?? 0),
    });
  }
  return out;
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
