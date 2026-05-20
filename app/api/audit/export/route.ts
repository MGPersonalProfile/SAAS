import { NextResponse } from "next/server";
import { requireModule } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

function csv(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: Request) {
  const profile = await requireModule("auditoria");
  const supabase = await createClient();

  const url = new URL(request.url);
  const usuario = url.searchParams.get("usuario");
  const modulo = url.searchParams.get("modulo");
  const desde = url.searchParams.get("desde");
  const hasta = url.searchParams.get("hasta");

  let query = supabase
    .from("audit_log")
    .select("fecha, username, modulo, accion, detalle")
    .order("fecha", { ascending: false });

  if (usuario) query = query.eq("username", usuario);
  if (modulo) query = query.eq("modulo", modulo);
  if (desde) query = query.gte("fecha", `${desde}T00:00:00Z`);
  if (hasta) query = query.lte("fecha", `${hasta}T23:59:59Z`);

  const { data, error } = await query.limit(10000);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("audit_log").insert({
    usuario_id: profile.id,
    username: profile.username,
    accion: "Descargó Auditoría CSV",
    modulo: "Auditoría",
    detalle: `${data?.length ?? 0} eventos`,
  });

  const headers = ["fecha", "username", "modulo", "accion", "detalle"];
  const lines: string[] = [headers.join(",")];
  for (const r of data ?? []) {
    lines.push(headers.map((h) => csv(r[h as keyof typeof r])).join(","));
  }
  const body = "﻿" + lines.join("\n");

  const ts = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="auditoria_${ts}.csv"`,
    },
  });
}
