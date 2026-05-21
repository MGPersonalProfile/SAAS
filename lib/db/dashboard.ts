import { createClient } from "@/lib/supabase/server";
import type { Tables, ProcesoEstado } from "@/types/database";

export interface DashboardData {
  budget: Tables<"budget_view">[];
  pacc: {
    count: number;
    total: number;
  };
  procesos: {
    total: number;
    activos: number;
    observados: number;
    montoTotal: number;
    porEstado: { estado: ProcesoEstado; count: number; monto: number }[];
  };
  byModalidad: { modalidad: string; monto: number; count: number }[];
  topPaccLines: {
    pacc_id: number;
    linea: string;
    descripcion: string | null;
    planeado: number;
    ejecutado: number;
    pct: number;
  }[];
  executionTimeline: { mes: string; ejecutado: number }[];
}

const ESTADOS_EJECUTADOS = new Set<ProcesoEstado>(["Pagado", "Cerrado"]);

/**
 * Una sola pasada por la BD para todo lo que necesita el dashboard.
 * Server-side. RLS garantiza que el usuario solo vea lo que su rol permite.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  const [
    budgetViewRes,
    paccCountRes,
    paccValoresRes,
    procesosRes,
    procesosWithPaccRes,
    historialRes,
  ] = await Promise.all([
    supabase.from("budget_view").select("*").order("id"),
    supabase.from("pacc").select("*", { count: "exact", head: true }),
    supabase.from("pacc").select("valor").not("valor", "is", null),
    supabase.from("procesos").select("estado, monto"),
    // Para los gráficos por modalidad / top líneas necesitamos JOIN con pacc.
    // Si la migración 0007 no está aplicada, este select falla y caemos a [].
    supabase
      .from("procesos")
      .select("estado, monto, pacc_id, pacc:pacc_id(id, linea, descripcion, modalidad, valor)"),
    // Timeline de ejecución mes a mes: usamos el cambio de estado a Pagado
    // como fecha de ejecución (refleja cuándo el dinero salió, no cuándo se
    // creó el proceso).
    supabase
      .from("proceso_historial")
      .select("changed_at, estado_nuevo, proceso_id")
      .eq("estado_nuevo", "Pagado")
      .order("changed_at", { ascending: true }),
  ]);

  // Budget fallback si la migración 0006 no está aplicada todavía.
  let budget: DashboardData["budget"];
  if (budgetViewRes.error) {
    const tableRes = await supabase.from("budget").select("*").order("id");
    if (tableRes.error) throw tableRes.error;
    budget = (tableRes.data ?? []).map((r) => ({
      ...r,
      tipo: "estatico" as const,
    }));
  } else {
    budget = budgetViewRes.data ?? [];
  }

  const paccCount = paccCountRes.count ?? 0;
  const paccTotal = (paccValoresRes.data ?? []).reduce(
    (sum, r) => sum + Number(r.valor ?? 0),
    0,
  );

  const procesos = procesosRes.data ?? [];
  const activos = procesos.filter(
    (p) => !ESTADOS_EJECUTADOS.has(p.estado),
  ).length;
  const observados = procesos.filter((p) => p.estado === "Observado").length;
  const montoTotal = procesos.reduce((sum, p) => sum + Number(p.monto ?? 0), 0);

  const porEstadoMap = new Map<
    ProcesoEstado,
    { count: number; monto: number }
  >();
  for (const p of procesos) {
    const prev = porEstadoMap.get(p.estado) ?? { count: 0, monto: 0 };
    porEstadoMap.set(p.estado, {
      count: prev.count + 1,
      monto: prev.monto + Number(p.monto ?? 0),
    });
  }
  const porEstado = Array.from(porEstadoMap.entries())
    .map(([estado, { count, monto }]) => ({ estado, count, monto }))
    .sort((a, b) => b.count - a.count);

  // ----- byModalidad: agrupa procesos por modalidad de la línea PACC asociada
  type ProcesoConPacc = {
    estado: ProcesoEstado;
    monto: number;
    pacc_id: number | null;
    pacc:
      | {
          id: number;
          linea: string | null;
          descripcion: string | null;
          modalidad: string | null;
          valor: number | null;
        }
      | null;
  };

  const procesosWithPacc = procesosWithPaccRes.error
    ? []
    : ((procesosWithPaccRes.data ?? []) as unknown as ProcesoConPacc[]);

  const modMap = new Map<string, { monto: number; count: number }>();
  for (const p of procesosWithPacc) {
    const mod = p.pacc?.modalidad?.trim() || "Sin modalidad";
    const prev = modMap.get(mod) ?? { monto: 0, count: 0 };
    modMap.set(mod, {
      monto: prev.monto + Number(p.monto ?? 0),
      count: prev.count + 1,
    });
  }
  const byModalidad = Array.from(modMap.entries())
    .map(([modalidad, v]) => ({ modalidad, ...v }))
    .sort((a, b) => b.monto - a.monto);

  // ----- topPaccLines: top 10 líneas con más ejecución (Pagado/Cerrado)
  const topMap = new Map<
    number,
    {
      linea: string;
      descripcion: string | null;
      planeado: number;
      ejecutado: number;
    }
  >();
  for (const p of procesosWithPacc) {
    if (!ESTADOS_EJECUTADOS.has(p.estado)) continue;
    if (!p.pacc) continue;
    const prev = topMap.get(p.pacc.id) ?? {
      linea: p.pacc.linea ?? "",
      descripcion: p.pacc.descripcion,
      planeado: Number(p.pacc.valor ?? 0),
      ejecutado: 0,
    };
    prev.ejecutado += Number(p.monto ?? 0);
    topMap.set(p.pacc.id, prev);
  }
  const topPaccLines = Array.from(topMap.entries())
    .map(([pacc_id, v]) => ({
      pacc_id,
      ...v,
      pct: v.planeado > 0 ? (v.ejecutado / v.planeado) * 100 : 0,
    }))
    .sort((a, b) => b.ejecutado - a.ejecutado)
    .slice(0, 10);

  // ----- executionTimeline: ejecución mes a mes
  // Usamos el monto del proceso al momento del cambio de estado a Pagado.
  // Como `proceso_historial` no guarda monto, hacemos un lookup contra procesos
  // por id. Asume que el monto al momento de Pagado es el monto actual del
  // proceso — aceptable para una visualización del prototipo.
  type HistRow = { changed_at: string; estado_nuevo: ProcesoEstado; proceso_id: number };
  const historialRows: HistRow[] = historialRes.error
    ? []
    : (historialRes.data ?? []) as HistRow[];

  let timelineByMes: { mes: string; ejecutado: number }[] = [];
  if (historialRows.length > 0) {
    const procIds = Array.from(new Set(historialRows.map((h) => h.proceso_id)));
    const { data: procRows } = await supabase
      .from("procesos")
      .select("id, monto")
      .in("id", procIds);
    const montoById = new Map<number, number>();
    for (const r of procRows ?? []) montoById.set(r.id, Number(r.monto ?? 0));

    const mesMap = new Map<string, number>();
    for (const h of historialRows) {
      const d = new Date(h.changed_at);
      const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      mesMap.set(mes, (mesMap.get(mes) ?? 0) + (montoById.get(h.proceso_id) ?? 0));
    }
    timelineByMes = Array.from(mesMap.entries())
      .map(([mes, ejecutado]) => ({ mes, ejecutado }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }

  return {
    budget,
    pacc: { count: paccCount, total: paccTotal },
    procesos: {
      total: procesos.length,
      activos,
      observados,
      montoTotal,
      porEstado,
    },
    byModalidad,
    topPaccLines,
    executionTimeline: timelineByMes,
  };
}
