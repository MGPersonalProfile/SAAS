/**
 * Sugerencia de modalidad de contratación según monto (Honduras).
 *
 * Heurística aproximada basada en los umbrales típicos de la LCE/Disposiciones
 * Generales del Presupuesto. Los rangos exactos cambian cada año, por eso se
 * marcan como sugerencia y no como obligación.
 *
 * Última actualización de umbrales: 2026.
 */

export interface ModalidadSugerida {
  codigo: string;
  nombre: string;
  razon: string;
}

const RANGOS: Array<{
  max: number;
  modalidad: ModalidadSugerida;
}> = [
  {
    max: 200_000,
    modalidad: {
      codigo: "HN-04-Compra_Menor",
      nombre: "Compra Menor",
      razon: "Montos hasta L 200,000 admiten proceso simplificado.",
    },
  },
  {
    max: 800_000,
    modalidad: {
      codigo: "HN-04-Compra_Menor",
      nombre: "Compra Menor",
      razon: "Hasta ~L 800,000 generalmente cabe en Compra Menor según el techo institucional vigente.",
    },
  },
  {
    max: 8_000_000,
    modalidad: {
      codigo: "HN-05-Cotizacion",
      nombre: "Cotización",
      razon: "Entre L 800,000 y L 8,000,000 corresponde proceso de cotización con al menos 3 ofertas.",
    },
  },
  {
    max: 25_000_000,
    modalidad: {
      codigo: "HN-02-Licitacion_Privada",
      nombre: "Licitación Privada",
      razon: "Entre L 8M y L 25M corresponde licitación privada con invitación a oferentes seleccionados.",
    },
  },
];

const LICITACION_PUBLICA: ModalidadSugerida = {
  codigo: "HN-01-Licitacion_Publica",
  nombre: "Licitación Pública",
  razon: "Montos superiores a L 25M requieren licitación pública con convocatoria abierta.",
};

export function suggestModalidad(monto: number): ModalidadSugerida | null {
  if (!Number.isFinite(monto) || monto <= 0) return null;
  for (const r of RANGOS) {
    if (monto <= r.max) return r.modalidad;
  }
  return LICITACION_PUBLICA;
}

/**
 * Detecta fraccionamiento potencial: si el monto está justo debajo de un
 * umbral conocido (dentro de un 10%), avisa que parece evitar la modalidad
 * superior.
 */
export function detectarUmbralCercano(
  monto: number,
): { proximaModalidad: string; threshold: number } | null {
  if (!Number.isFinite(monto) || monto <= 0) return null;
  const thresholds = [
    { value: 200_000, next: "Compra Menor con tope ampliado" },
    { value: 800_000, next: "Cotización" },
    { value: 8_000_000, next: "Licitación Privada" },
    { value: 25_000_000, next: "Licitación Pública" },
  ];
  for (const t of thresholds) {
    if (monto >= t.value * 0.9 && monto < t.value) {
      return { proximaModalidad: t.next, threshold: t.value };
    }
  }
  return null;
}
