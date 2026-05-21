#!/usr/bin/env tsx
/**
 * Genera MANUAL_CHFM.pdf en el directorio raíz del proyecto.
 *
 * Uso:
 *   npx tsx scripts/generate-manual.tsx [ruta-de-salida.pdf]
 *
 * Por defecto guarda en `../MANUAL_CHFM.pdf` (un nivel arriba de chfm-app)
 * para que aparezca junto al prototipo y sea fácil de encontrar.
 */

import { renderToFile } from "@react-pdf/renderer";
import { resolve, dirname, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { ManualPdf } from "../components/pdf/manual";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const arg = process.argv[2];
  const defaultOut = resolve(__dirname, "..", "..", "MANUAL_CHFM.pdf");
  const out = arg
    ? isAbsolute(arg)
      ? arg
      : resolve(process.cwd(), arg)
    : defaultOut;

  console.log("Generando manual…");
  console.log("Destino:", out);

  await renderToFile(ManualPdf() as never, out);

  console.log("✓ Generado correctamente");
}

main().catch((err) => {
  console.error("Error generando el manual:", err);
  process.exit(1);
});
