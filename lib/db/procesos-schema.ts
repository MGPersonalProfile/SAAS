import { z } from "zod";

export const PROCESO_ESTADOS = [
  "Solicitud creada",
  "Validado PACC",
  "Validado presupuesto",
  "Enviado a Tegucigalpa",
  "Observado",
  "Subsanado",
  "En proceso UCP",
  "Adjudicado",
  "Recibido",
  "Pagado",
  "Cerrado",
] as const;

export const PROCESO_PRIORIDADES = ["Normal", "Media", "Alta"] as const;

export const procesoSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(3, "El código debe tener al menos 3 caracteres")
    .max(80, "Máximo 80 caracteres"),
  pacc_id: z.number().int().positive().nullable().optional(),
  linea_pacc: z.string().trim().max(50).optional().or(z.literal("")),
  objeto: z.string().trim().max(50).optional().or(z.literal("")),
  descripcion: z
    .string()
    .trim()
    .min(5, "Describe el proceso (mínimo 5 caracteres)")
    .max(2000),
  monto: z
    .number({ message: "Monto inválido" })
    .nonnegative("El monto no puede ser negativo")
    .finite(),
  estado: z.enum(PROCESO_ESTADOS),
  responsable: z.string().trim().max(150).optional().or(z.literal("")),
  prioridad: z.enum(PROCESO_PRIORIDADES),
});

export type ProcesoInput = z.infer<typeof procesoSchema>;

export const cambioEstadoSchema = z.object({
  proceso_id: z.number().int().positive(),
  estado_nuevo: z.enum(PROCESO_ESTADOS),
  comentario: z
    .string()
    .trim()
    .min(3, "El comentario es obligatorio (mínimo 3 caracteres)")
    .max(500, "Máximo 500 caracteres"),
});

export type CambioEstadoInput = z.infer<typeof cambioEstadoSchema>;
