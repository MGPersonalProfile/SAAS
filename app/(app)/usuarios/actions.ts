"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/lib/db/users-schema";
import type { UserRole } from "@/types/database";

export type UserActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

async function requireAdmin() {
  const profile = await requireProfile();
  if (profile.role !== "admin") {
    throw new Error("Solo admin puede gestionar usuarios.");
  }
  return profile;
}

export async function createUser(
  input: CreateUserInput,
): Promise<UserActionResult> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      username: parsed.data.username,
      full_name: parsed.data.full_name,
      role: parsed.data.role,
    },
  });
  if (error) return { ok: false, error: error.message };

  // El trigger handle_new_user creó el profile con el rol del metadata.
  // Por seguridad, forzamos el username/full_name/role aquí también.
  if (data.user) {
    const supabase = await createClient();
    await supabase
      .from("profiles")
      .update({
        username: parsed.data.username,
        full_name: parsed.data.full_name,
        role: parsed.data.role,
        active: true,
      })
      .eq("id", data.user.id);

    await supabase.from("audit_log").insert({
      usuario_id: actor.id,
      username: actor.username,
      accion: "Creó usuario",
      modulo: "Usuarios",
      detalle: `${parsed.data.email} (${parsed.data.role})`,
    });
  }

  revalidatePath("/usuarios");
  return { ok: true, message: "Usuario creado" };
}

export async function updateUser(
  userId: string,
  input: UpdateUserInput,
): Promise<UserActionResult> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  if (userId === actor.id && parsed.data.role && parsed.data.role !== "admin") {
    return {
      ok: false,
      error: "No puedes quitarte tu propio rol de admin.",
    };
  }
  if (userId === actor.id && parsed.data.active === false) {
    return { ok: false, error: "No puedes desactivar tu propia cuenta." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", userId);
  if (error) return { ok: false, error: error.message };

  await supabase.from("audit_log").insert({
    usuario_id: actor.id,
    username: actor.username,
    accion: "Actualizó usuario",
    modulo: "Usuarios",
    detalle: `${userId}: ${JSON.stringify(parsed.data)}`,
  });

  revalidatePath("/usuarios");
  return { ok: true };
}

export async function setUserRole(
  userId: string,
  role: UserRole,
): Promise<UserActionResult> {
  return updateUser(userId, { role });
}

export async function setUserActive(
  userId: string,
  active: boolean,
): Promise<UserActionResult> {
  return updateUser(userId, { active });
}

export async function sendPasswordReset(
  email: string,
): Promise<UserActionResult> {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });
  if (error) return { ok: false, error: error.message };

  const supabase = await createClient();
  await supabase.from("audit_log").insert({
    usuario_id: actor.id,
    username: actor.username,
    accion: "Generó reset de contraseña",
    modulo: "Usuarios",
    detalle: email,
  });

  return {
    ok: true,
    message: `Enlace de recuperación enviado a ${email}`,
  };
}
