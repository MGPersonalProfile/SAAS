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
}

/**
 * Una sola pasada por la BD para todo lo que necesita el dashboard.
 * Server-side. RLS garantiza que el usuario solo vea lo que su rol permite.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  const [budgetViewRes, paccCountRes, paccValoresRes, procesosRes] =
    await Promise.all([
      // Lee de la vista, no de la tabla, para obtener los montos derivados
      // ya calculados (Comprometido, Ejecutado, Disponible real).
      supabase.from("budget_view").select("*").order("id"),
      supabase.from("pacc").select("*", { count: "exact", head: true }),
      supabase.from("pacc").select("valor").not("valor", "is", null),
      supabase.from("procesos").select("estado, monto"),
    ]);

  // Fallback si la migración 0006 no está aplicada todavía.
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
  const ESTADOS_INACTIVOS: ProcesoEstado[] = ["Pagado", "Cerrado"];
  const activos = procesos.filter(
    (p) => !ESTADOS_INACTIVOS.includes(p.estado),
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
  };
}
