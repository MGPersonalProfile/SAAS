import { NextResponse } from "next/server";
import { requireModule } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function csvField(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: Request) {
  // requireModule redirige si no hay permiso; con módulo "reportes" exigimos
  // que el usuario tenga acceso a reportes para descargar (consistente con dashboard).
  const profile = await requireModule("pacc");
  const supabase = await createClient();

  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const mes = url.searchParams.get("mes");
  const modalidad = url.searchParams.get("modalidad");
  const fuente = url.searchParams.get("fuente");

  let query = supabase
    .from("pacc")
    .select("linea, objeto, descripcion, mes, modalidad, fuente, valor, unidad, eje, estado")
    .order("valor", { ascending: false, nullsFirst: false });

  if (q && q.trim()) {
    const term = q.trim();
    query = query.or(
      `descripcion.ilike.%${term}%,objeto.ilike.%${term}%,linea.ilike.%${term}%`,
    );
  }
  if (mes) query = query.eq("mes", mes);
  if (modalidad) query = query.eq("modalidad", modalidad);
  if (fuente) query = query.eq("fuente", fuente);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("audit_log").insert({
    usuario_id: profile.id,
    username: profile.username,
    accion: "Descargó PACC CSV",
    modulo: "PACC",
    detalle: `${data?.length ?? 0} líneas`,
  });

  const headers = [
    "linea",
    "objeto",
    "descripcion",
    "mes",
    "modalidad",
    "fuente",
    "valor",
    "unidad",
    "eje",
    "estado",
  ];

  const lines: string[] = [headers.join(",")];
  for (const r of data ?? []) {
    lines.push(headers.map((h) => csvField(r[h as keyof typeof r])).join(","));
  }
  const csv = "﻿" + lines.join("\n"); // BOM para Excel UTF-8

  const ts = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pacc_${ts}.csv"`,
    },
  });
}
