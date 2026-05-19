/**
 * Formatters para mostrar montos, números y fechas en la UI.
 */

const moneyFormatter = new Intl.NumberFormat("es-HN", {
  style: "currency",
  currency: "HNL",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formatea un monto en Lempiras: `L 1,234,567.89`.
 * El locale es-HN devuelve "HNL 1,234,567.89", lo reemplazamos por "L ".
 */
export function money(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "L 0.00";
  return moneyFormatter.format(Number(n)).replace("HNL", "L");
}

/**
 * Formato compacto: `L 1.2M`, `L 595k`. Útil para tarjetas de KPI cuando hay poco espacio.
 */
const compactFormatter = new Intl.NumberFormat("es-HN", {
  notation: "compact",
  compactDisplay: "short",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

export function moneyCompact(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "L 0";
  return `L ${compactFormatter.format(Number(n))}`;
}

const numberFormatter = new Intl.NumberFormat("es-HN");

export function number(n: number | null | undefined): string {
  if (n === null || n === undefined) return "0";
  return numberFormatter.format(Number(n));
}

/**
 * Porcentaje con un decimal: `12.5%`. Recibe valor 0..1 o 0..100 (auto-detecta).
 */
export function percent(value: number, total: number): string {
  if (!total || total === 0) return "0%";
  const ratio = value / total;
  return `${(ratio * 100).toFixed(1)}%`;
}

/**
 * Fecha relativa simple: "hace 5 min", "hace 3 h", "hace 2 d".
 */
export function relativeTime(iso: string): string {
  const date = new Date(iso);
  const diffSec = (Date.now() - date.getTime()) / 1000;
  if (diffSec < 60) return "ahora";
  if (diffSec < 3600) return `hace ${Math.floor(diffSec / 60)} min`;
  if (diffSec < 86400) return `hace ${Math.floor(diffSec / 3600)} h`;
  if (diffSec < 604800) return `hace ${Math.floor(diffSec / 86400)} d`;
  return date.toLocaleDateString("es-HN");
}

/**
 * Fecha legible: "19 may 2026, 14:30".
 */
const dateFormatter = new Intl.DateTimeFormat("es-HN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function dateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return dateFormatter.format(new Date(iso));
}

const dateOnlyFormatter = new Intl.DateTimeFormat("es-HN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function dateOnly(iso: string | null | undefined): string {
  if (!iso) return "—";
  return dateOnlyFormatter.format(new Date(iso));
}
