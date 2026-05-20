import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireModule } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getDashboardData } from "@/lib/db/dashboard";
import { ReporteEjecutivo } from "@/components/pdf/reporte-ejecutivo";

export const runtime = "nodejs";

export async function GET() {
  const profile = await requireModule("reportes");
  const data = await getDashboardData();

  const pdfBuffer = await renderToBuffer(
    <ReporteEjecutivo
      generadoPor={profile.full_name || profile.username}
      generadoEn={new Date().toLocaleString("es-HN", {
        dateStyle: "long",
        timeStyle: "short",
      })}
      budget={data.budget.map((b) => ({
        concepto: b.concepto,
        monto: Number(b.monto),
        nota: b.nota,
      }))}
      paccTotal={data.pacc.total}
      paccCount={data.pacc.count}
      procesosTotal={data.procesos.total}
      procesosMonto={data.procesos.montoTotal}
      procesosPorEstado={data.procesos.porEstado.map((p) => ({
        estado: p.estado,
        count: p.count,
        monto: p.monto,
      }))}
    />,
  );

  const supabase = await createClient();
  await supabase.from("audit_log").insert({
    usuario_id: profile.id,
    username: profile.username,
    accion: "Descargó Reporte Ejecutivo PDF",
    modulo: "Reportes",
  });

  const ts = new Date().toISOString().slice(0, 10);
  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="reporte_ejecutivo_${ts}.pdf"`,
    },
  });
}
