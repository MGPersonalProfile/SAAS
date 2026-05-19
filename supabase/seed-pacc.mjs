#!/usr/bin/env node
/**
 * Genera `migrations/0004_seed.sql` a partir de:
 *   - El JSON del PACC del prototipo (../../CHFM_Sistema_Profesional_PC_MAC/seed_pacc.json)
 *   - Los 5 conceptos de presupuesto inicial del prototipo (app.py:118-123)
 *
 * Idempotente: usa `ON CONFLICT` para que correr el SQL varias veces no duplique.
 *
 * Uso: node supabase/seed-pacc.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..", "..");
const PROTOTIPO = resolve(
  REPO_ROOT,
  "CHFM_Sistema_Profesional_PC_MAC",
  "seed_pacc.json",
);
const OUTPUT = join(__dirname, "migrations", "0004_seed.sql");

// ---------------------------------------------------------------------------
// Presupuesto inicial — sacado de CHFM_Sistema_Profesional_PC_MAC/app.py:118-123
// ---------------------------------------------------------------------------
const PV = 295_397_644.0;
const DS = 245_962_617.87;
const DR = 134_529_745.7;

const BUDGET_ROWS = [
  ["Presupuesto vigente", PV, "Presupuesto CHFM 2026"],
  [
    "Disponible SIAFI",
    DS,
    "Disponible según referencia presupuestaria",
  ],
  [
    "Disponible real estimado",
    DR,
    "Disponible ajustado para control interno",
  ],
  [
    "Comprometido referencial",
    PV - DR,
    "Diferencia contra disponible real",
  ],
  [
    "Ejecutado estimado",
    PV - DS,
    "Diferencia contra disponible SIAFI",
  ],
];

// ---------------------------------------------------------------------------
// Helpers de SQL
// ---------------------------------------------------------------------------
const sqlString = (v) => {
  if (v === null || v === undefined || v === "") return "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
};

const sqlNumeric = (v) => {
  if (v === null || v === undefined || v === "") return "NULL";
  const n = Number(v);
  if (!Number.isFinite(n)) return "NULL";
  return n.toFixed(2);
};

// ---------------------------------------------------------------------------
// Leer y validar el JSON del PACC
// ---------------------------------------------------------------------------
let pacc;
try {
  pacc = JSON.parse(readFileSync(PROTOTIPO, "utf8"));
} catch (err) {
  console.error(`No se pudo leer ${PROTOTIPO}:`, err.message);
  process.exit(1);
}

if (!Array.isArray(pacc)) {
  console.error("El JSON no es un array");
  process.exit(1);
}

const totalValor = pacc.reduce(
  (sum, r) => sum + (Number(r.valor) || 0),
  0,
);

console.error(`Leídas ${pacc.length} líneas del PACC.`);
console.error(`Total valor: L ${totalValor.toLocaleString("en-US")}`);

// ---------------------------------------------------------------------------
// Generar SQL
// ---------------------------------------------------------------------------
const lines = [];
lines.push("-- ============================================================================");
lines.push("-- CHFM — Seed (presupuesto inicial + 593 líneas del PACC)");
lines.push("-- ============================================================================");
lines.push("-- Generado automáticamente por supabase/seed-pacc.mjs a partir de");
lines.push("-- ../CHFM_Sistema_Profesional_PC_MAC/seed_pacc.json");
lines.push("-- NO editar a mano: regenerar con `node supabase/seed-pacc.mjs`.");
lines.push("-- ============================================================================");
lines.push("");
lines.push("-- ----------------------------------------------------------------------------");
lines.push("-- Presupuesto inicial");
lines.push("-- ----------------------------------------------------------------------------");
lines.push("insert into public.budget (concepto, monto, nota, updated_at) values");
const budgetValues = BUDGET_ROWS.map(
  ([concepto, monto, nota]) =>
    `  (${sqlString(concepto)}, ${sqlNumeric(monto)}, ${sqlString(nota)}, now())`,
);
lines.push(budgetValues.join(",\n"));
lines.push("on conflict (concepto) do update");
lines.push("  set monto = excluded.monto,");
lines.push("      nota = excluded.nota,");
lines.push("      updated_at = excluded.updated_at;");
lines.push("");
lines.push("-- ----------------------------------------------------------------------------");
lines.push(`-- PACC: ${pacc.length} líneas, total L ${totalValor.toLocaleString("en-US")}`);
lines.push("-- ----------------------------------------------------------------------------");
lines.push("-- Limpiar antes de re-insertar para mantener idempotencia.");
lines.push("delete from public.pacc;");
lines.push("");
lines.push(
  "insert into public.pacc (linea, objeto, descripcion, mes, modalidad, fuente, valor, unidad, eje, estado) values",
);

const paccValues = pacc.map((r) => {
  return (
    "  (" +
    [
      sqlString(r.linea),
      sqlString(r.objeto),
      sqlString(r.descripcion),
      sqlString(r.mes),
      sqlString(r.modalidad),
      sqlString(r.fuente),
      sqlNumeric(r.valor),
      sqlString(r.unidad),
      sqlString(r.eje),
      sqlString(r.estado || "Programado"),
    ].join(", ") +
    ")"
  );
});

lines.push(paccValues.join(",\n") + ";");
lines.push("");

writeFileSync(OUTPUT, lines.join("\n"), "utf8");
console.error(
  `Escrito ${relative(REPO_ROOT, OUTPUT)} (${(lines.join("\n").length / 1024).toFixed(1)} KB)`,
);
