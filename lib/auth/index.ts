import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";
import { roleCanAccess, type Module } from "./permissions";

export type Profile = Tables<"profiles">;

/**
 * Devuelve el perfil del usuario autenticado o `null` si no hay sesión válida.
 *
 * Hace dos llamadas a Supabase: `getClaims()` para el JWT y un `select` a
 * `profiles` para obtener rol/username/estado.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;

  if (!userId) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile) return null;
  if (!profile.active) return null;

  return profile;
}

/**
 * Igual que `getCurrentProfile` pero redirige a `/auth/login` si no hay sesión.
 * Usar en Server Components o Server Actions que requieran autenticación.
 */
export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/auth/login");
  return profile;
}

/**
 * Garantiza que el usuario está autenticado Y tiene acceso al módulo dado.
 * Redirige a `/auth/login` si no hay sesión, o a `/dashboard` si no tiene permiso.
 */
export async function requireModule(module: Module): Promise<Profile> {
  const profile = await requireProfile();
  if (!roleCanAccess(profile.role, module)) {
    redirect("/dashboard");
  }
  return profile;
}
