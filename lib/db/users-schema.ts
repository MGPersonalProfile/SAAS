import { z } from "zod";

export const USER_ROLES = ["admin", "editor", "viewer", "gerencia"] as const;

export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  full_name: z
    .string()
    .trim()
    .min(2, "Nombre muy corto")
    .max(120, "Máximo 120 caracteres"),
  username: z
    .string()
    .trim()
    .min(3, "Mínimo 3 caracteres")
    .max(40, "Máximo 40 caracteres")
    .regex(/^[a-zA-Z0-9._-]+$/, "Solo letras, números y . _ -"),
  password: z
    .string()
    .min(6, "Mínimo 6 caracteres (Supabase exige al menos 6)"),
  role: z.enum(USER_ROLES),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  full_name: z.string().trim().min(2).max(120).optional(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[a-zA-Z0-9._-]+$/, "Solo letras, números y . _ -")
    .optional(),
  role: z.enum(USER_ROLES).optional(),
  active: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
