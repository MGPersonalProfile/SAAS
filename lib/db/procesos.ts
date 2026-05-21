import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables, ProcesoEstado, ProcesoPrioridad } from "@/types/database";

export type ProcesoWithPacc = Tables<"procesos"> & {
  pacc: Pick<
    Tables<"pacc">,
    "id" | "linea" | "objeto" | "descripcion" | "modalidad" | "valor"
  > | null;
};

export interface ProcesosFilters {
  q?: string;
  estado?: ProcesoEstado;
  prioridad?: ProcesoPrioridad;
  pacc_id?: number;
  page?: number;
  pageSize?: number;
}

export interface ProcesosResult {
  rows: ProcesoWithPacc[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 25;

const PACC_SELECT = "id, linea, objeto, descripcion, modalidad, valor";

export async function listProcesos(
  filters: ProcesosFilters = {},
): Promise<ProcesosResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.max(
    1,
    Math.min(100, filters.pageSize ?? DEFAULT_PAGE_SIZE),
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("procesos")
    .select(`*, pacc:pacc_id(${PACC_SELECT})`, { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.q && filters.q.trim()) {
    const term = filters.q.trim();
    query = query.or(
      `codigo.ilike.%${term}%,descripcion.ilike.%${term}%,objeto.ilike.%${term}%,responsable.ilike.%${term}%`,
    );
  }
  if (filters.estado) query = query.eq("estado", filters.estado);
  if (filters.prioridad) query = query.eq("prioridad", filters.prioridad);
  if (filters.pacc_id) query = query.eq("pacc_id", filters.pacc_id);

  const { data, count, error } = await query.range(from, to);
  if (error) throw error;

  const total = count ?? 0;
  return {
    rows: (data ?? []) as unknown as ProcesoWithPacc[],
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getProceso(id: number) {
  const supabase = await createClient();

  const [procesoRes, historialRes] = await Promise.all([
    supabase
      .from("procesos")
      .select(`*, pacc:pacc_id(${PACC_SELECT})`)
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("proceso_historial")
      .select("*")
      .eq("proceso_id", id)
      .order("changed_at", { ascending: false }),
  ]);

  if (procesoRes.error) throw procesoRes.error;
  if (!procesoRes.data) return null;

  return {
    proceso: procesoRes.data as unknown as ProcesoWithPacc,
    historial: historialRes.data ?? [],
  };
}

/**
 * Procesos asociados a una línea PACC. Útil para la página de detalle de PACC.
 */
export async function listProcesosByPacc(
  paccId: number,
): Promise<Tables<"procesos">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("procesos")
    .select("*")
    .eq("pacc_id", paccId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
