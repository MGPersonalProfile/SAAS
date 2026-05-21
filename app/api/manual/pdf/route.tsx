import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireProfile } from "@/lib/auth";
import { ManualPdf } from "@/components/pdf/manual";

export const runtime = "nodejs";

/**
 * Descarga el manual de usuario en PDF. Accesible para cualquier usuario
 * autenticado (no requiere rol especial).
 */
export async function GET() {
  await requireProfile();

  const pdfBuffer = await renderToBuffer(<ManualPdf />);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="CHFM_Manual_de_Usuario.pdf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
