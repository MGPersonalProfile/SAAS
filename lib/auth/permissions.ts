import type { UserRole } from "@/types/database";

/**
 * Módulos de navegación de la aplicación.
 * Se usan tanto para mostrar/ocultar items del sidebar como para
 * proteger rutas server-side.
 */
export const MODULES = [
  "dashboard",
  "presupuesto",
  "pacc",
  "compras",
  "reportes",
  "documentos",
  "alertas",
  "importar",
  "usuarios",
  "auditoria",
] as const;

export type Module = (typeof MODULES)[number];

/**
 * Espejo del diccionario `PERMS` del prototipo (app.py:17).
 * RLS en Postgres es la fuente de verdad para escritura; este mapa controla
 * la navegación y la visibilidad de botones de acción en la UI.
 */
export const PERMISSIONS: Record<UserRole, ReadonlySet<Module>> = {
  admin: new Set([
    "dashboard",
    "presupuesto",
    "pacc",
    "compras",
    "reportes",
    "documentos",
    "alertas",
    "importar",
    "usuarios",
    "auditoria",
  ]),
  editor: new Set([
    "dashboard",
    "presupuesto",
    "pacc",
    "compras",
    "reportes",
    "documentos",
    "importar",
  ]),
  viewer: new Set(["dashboard", "reportes"]),
  gerencia: new Set(["dashboard", "reportes", "alertas", "auditoria"]),
};

export function roleCanAccess(role: UserRole, module: Module): boolean {
  return PERMISSIONS[role]?.has(module) ?? false;
}

/**
 * Roles que pueden crear/editar registros (mirror de RLS `is_editor_or_admin`).
 */
export function roleCanWrite(role: UserRole): boolean {
  return role === "admin" || role === "editor";
}

export function roleIsAdmin(role: UserRole): boolean {
  return role === "admin";
}

/**
 * Etiquetas amigables por rol (UI).
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  editor: "Operativo",
  viewer: "Consulta",
  gerencia: "Gerencia",
};

export const MODULE_LABELS: Record<Module, string> = {
  dashboard: "Dashboard",
  presupuesto: "Presupuesto",
  pacc: "PACC",
  compras: "Compras",
  reportes: "Reportes",
  documentos: "Documentos",
  alertas: "Alertas",
  importar: "Importar",
  usuarios: "Usuarios",
  auditoria: "Auditoría",
};
