import { NextResponse } from "next/server";
import { requireModule } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function csv(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const profile = await requireModule("reportes");
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("procesos")
    .select(
      "id, codigo, linea_pacc, objeto, descripcion, monto, estado, responsable, prioridad, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("audit_log").insert({
    usuario_id: profile.id,
    username: profile.username,
    accion: "Descargó Procesos CSV",
    modulo: "Reportes",
    detalle: `${data?.length ?? 0} procesos`,
  });

  const headers = [
    "id",
    "codigo",
    "linea_pacc",
    "objeto",
    "descripcion",
    "monto",
    "estado",
    "responsable",
    "prioridad",
    "created_at",
    "updated_at",
  ];

  const lines: string[] = [headers.join(",")];
  for (const r of data ?? []) {
    lines.push(headers.map((h) => csv(r[h as keyof typeof r])).join(","));
  }
  const body = "﻿" + lines.join("\n");

  const ts = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="procesos_${ts}.csv"`,
    },
  });
}
