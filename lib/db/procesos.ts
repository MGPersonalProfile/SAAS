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

  // Construye la query base reutilizable para el intento con embed y el fallback.
  function buildQuery(selectExpr: string) {
    let q = supabase
      .from("procesos")
      .select(selectExpr, { count: "exact" })
      .order("created_at", { ascending: false });
    if (filters.q && filters.q.trim()) {
      const term = filters.q.trim();
      q = q.or(
        `codigo.ilike.%${term}%,descripcion.ilike.%${term}%,objeto.ilike.%${term}%,responsable.ilike.%${term}%`,
      );
    }
    if (filters.estado) q = q.eq("estado", filters.estado);
    if (filters.prioridad) q = q.eq("prioridad", filters.prioridad);
    if (filters.pacc_id) q = q.eq("pacc_id", filters.pacc_id);
    return q.range(from, to);
  }

  // Intenta con JOIN a pacc; si la migración 0007 todavía no se ha aplicado
  // (columna pacc_id inexistente), cae a select básico sin embed.
  const withEmbed = await buildQuery(`*, pacc:pacc_id(${PACC_SELECT})`);
  let data: unknown[] = [];
  let count = 0;
  if (withEmbed.error) {
    const fallback = await buildQuery("*");
    if (fallback.error) throw fallback.error;
    data = (fallback.data ?? []).map((r) => ({
      ...(r as object),
      pacc: null,
    }));
    count = fallback.count ?? 0;
  } else {
    data = withEmbed.data ?? [];
    count = withEmbed.count ?? 0;
  }

  return {
    rows: data as ProcesoWithPacc[],
    total: count,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(count / pageSize)),
  };
}

export async function getProceso(id: number) {
  const supabase = await createClient();

  const [procesoEmbedRes, historialRes] = await Promise.all([
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

  // Fallback si la migración 0007 no se aplicó (sin embed).
  let proceso: ProcesoWithPacc | null;
  if (procesoEmbedRes.error) {
    const fb = await supabase
      .from("procesos")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (fb.error) throw fb.error;
    proceso = fb.data ? ({ ...fb.data, pacc: null } as ProcesoWithPacc) : null;
  } else {
    proceso = procesoEmbedRes.data as ProcesoWithPacc | null;
  }

  if (!proceso) return null;

  return {
    proceso,
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
  // Fallback silencioso si la migración 0007 no se aplicó todavía.
  if (error) return [];
  return data ?? [];
}
