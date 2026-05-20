import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Tables, UserRole } from "@/types/database";

export interface UserRow {
  id: string;
  username: string;
  full_name: string | null;
  role: UserRole;
  active: boolean;
  created_at: string;
  email: string | null;
  last_sign_in_at: string | null;
  email_confirmed: boolean;
}

export async function listUsers(): Promise<UserRow[]> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: profiles, error: profilesErr } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (profilesErr) throw profilesErr;

  // Traer auth.users via admin API (no expone hash, solo email/last_sign_in/etc.)
  const { data: authData, error: authErr } = await admin.auth.admin.listUsers({
    perPage: 1000,
  });
  if (authErr) throw authErr;

  const byId = new Map(authData.users.map((u) => [u.id, u]));

  return (profiles ?? []).map((p: Tables<"profiles">): UserRow => {
    const u = byId.get(p.id);
    return {
      id: p.id,
      username: p.username,
      full_name: p.full_name,
      role: p.role,
      active: p.active,
      created_at: p.created_at,
      email: u?.email ?? null,
      last_sign_in_at: u?.last_sign_in_at ?? null,
      email_confirmed: !!u?.email_confirmed_at,
    };
  });
}
