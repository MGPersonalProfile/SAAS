import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export interface AuditFilters {
  usuario?: string;
  modulo?: string;
  desde?: string;
  hasta?: string;
  page?: number;
  pageSize?: number;
}

export interface AuditResult {
  rows: Tables<"audit_log">[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const DEFAULT_PAGE_SIZE = 50;

export async function listAudit(
  filters: AuditFilters = {},
): Promise<AuditResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.max(
    1,
    Math.min(200, filters.pageSize ?? DEFAULT_PAGE_SIZE),
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("audit_log")
    .select("*", { count: "exact" })
    .order("fecha", { ascending: false });

  if (filters.usuario) query = query.eq("username", filters.usuario);
  if (filters.modulo) query = query.eq("modulo", filters.modulo);
  if (filters.desde) query = query.gte("fecha", filters.desde);
  if (filters.hasta) query = query.lte("fecha", filters.hasta);

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

export async function getAuditFacets(): Promise<{
  usuarios: string[];
  modulos: string[];
}> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_log")
    .select("username, modulo")
    .order("fecha", { ascending: false })
    .limit(1000);

  const usuarios = new Set<string>();
  const modulos = new Set<string>();
  for (const r of data ?? []) {
    if (r.username) usuarios.add(r.username);
    if (r.modulo) modulos.add(r.modulo);
  }
  return {
    usuarios: Array.from(usuarios).sort(),
    modulos: Array.from(modulos).sort(),
  };
}
