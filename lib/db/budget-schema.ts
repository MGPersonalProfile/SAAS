import { z } from "zod";

export const budgetSchema = z.object({
  concepto: z
    .string()
    .trim()
    .min(3, "El concepto debe tener al menos 3 caracteres")
    .max(150, "Máximo 150 caracteres"),
  monto: z
    .number({ message: "Monto inválido" })
    .nonnegative("El monto no puede ser negativo")
    .finite(),
  nota: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export type BudgetInput = z.infer<typeof budgetSchema>;
