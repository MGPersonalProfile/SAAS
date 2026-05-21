import { z } from "zod";

const optionalString = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal("")).nullable();

export const paccSchema = z.object({
  linea: z
    .string()
    .trim()
    .min(1, "La línea es obligatoria")
    .max(50, "Máximo 50 caracteres"),
  objeto: optionalString(50),
  descripcion: z
    .string()
    .trim()
    .min(3, "La descripción es obligatoria")
    .max(2000, "Máximo 2000 caracteres"),
  mes: optionalString(20),
  modalidad: optionalString(150),
  fuente: optionalString(150),
  valor: z.number().nonnegative().finite().nullable().optional(),
  unidad: optionalString(150),
  eje: z.string().trim().max(2000).optional().or(z.literal("")).nullable(),
  estado: z.string().trim().min(1, "El estado es obligatorio").max(50),
});

export type PaccInput = z.infer<typeof paccSchema>;
