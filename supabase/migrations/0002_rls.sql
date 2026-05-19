-- ============================================================================
-- CHFM — Row Level Security, helpers de rol y triggers de seguridad
-- ============================================================================
-- Habilita RLS en todas las tablas, define funciones helper para rol,
-- crea políticas por tabla, registra el trigger handle_new_user y bloquea
-- modificaciones en audit_log.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Helpers de rol (SECURITY DEFINER para poder consultar profiles desde RLS)
-- ----------------------------------------------------------------------------

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
    and active = true;
$$;

comment on function public.current_user_role is 'Rol del usuario autenticado (NULL si no logueado o inactivo).';

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.current_user_role() = 'admin';
$$;

create or replace function public.is_editor_or_admin()
returns boolean
language sql
stable
as $$
  select public.current_user_role() in ('admin', 'editor');
$$;

create or replace function public.can_view_audit()
returns boolean
language sql
stable
as $$
  select public.current_user_role() in ('admin', 'gerencia');
$$;

create or replace function public.is_authenticated_active()
returns boolean
language sql
stable
as $$
  select public.current_user_role() is not null;
$$;

-- ----------------------------------------------------------------------------
-- Trigger: auto-crear profile cuando se registra un usuario en auth.users
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
  v_role public.user_role;
begin
  v_username := coalesce(
    new.raw_user_meta_data ->> 'username',
    split_part(new.email, '@', 1)
  );

  -- Si el role enviado en metadata es válido, úsalo; si no, viewer.
  begin
    v_role := coalesce(
      (new.raw_user_meta_data ->> 'role')::public.user_role,
      'viewer'::public.user_role
    );
  exception when others then
    v_role := 'viewer'::public.user_role;
  end;

  insert into public.profiles (id, username, full_name, role)
  values (
    new.id,
    v_username,
    new.raw_user_meta_data ->> 'full_name',
    v_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Trigger: audit_log append-only (bloquea UPDATE y DELETE para TODOS los roles)
-- ----------------------------------------------------------------------------

create or replace function public.audit_log_immutable()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_log es append-only: no se permite % en esta tabla', tg_op
    using errcode = 'insufficient_privilege';
end;
$$;

drop trigger if exists audit_log_no_update on public.audit_log;
create trigger audit_log_no_update
  before update on public.audit_log
  for each row execute function public.audit_log_immutable();

drop trigger if exists audit_log_no_delete on public.audit_log;
create trigger audit_log_no_delete
  before delete on public.audit_log
  for each row execute function public.audit_log_immutable();

-- ============================================================================
-- Row Level Security — habilitar en todas las tablas
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.budget enable row level security;
alter table public.pacc enable row level security;
alter table public.procesos enable row level security;
alter table public.proceso_historial enable row level security;
alter table public.documentos enable row level security;
alter table public.audit_log enable row level security;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
create policy "profiles: lectura propia o admin"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

create policy "profiles: admin inserta"
  on public.profiles for insert
  to authenticated
  with check (public.is_admin());

create policy "profiles: admin actualiza"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "profiles: admin elimina"
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- budget — lectura cualquier autenticado activo; escritura editor/admin
-- ----------------------------------------------------------------------------
create policy "budget: lectura autenticados"
  on public.budget for select
  to authenticated
  using (public.is_authenticated_active());

create policy "budget: editor/admin inserta"
  on public.budget for insert
  to authenticated
  with check (public.is_editor_or_admin());

create policy "budget: editor/admin actualiza"
  on public.budget for update
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy "budget: admin elimina"
  on public.budget for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- pacc — lectura cualquier autenticado activo; escritura editor/admin
-- ----------------------------------------------------------------------------
create policy "pacc: lectura autenticados"
  on public.pacc for select
  to authenticated
  using (public.is_authenticated_active());

create policy "pacc: editor/admin inserta"
  on public.pacc for insert
  to authenticated
  with check (public.is_editor_or_admin());

create policy "pacc: editor/admin actualiza"
  on public.pacc for update
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy "pacc: admin elimina"
  on public.pacc for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- procesos
-- ----------------------------------------------------------------------------
create policy "procesos: lectura autenticados"
  on public.procesos for select
  to authenticated
  using (public.is_authenticated_active());

create policy "procesos: editor/admin inserta"
  on public.procesos for insert
  to authenticated
  with check (public.is_editor_or_admin());

create policy "procesos: editor/admin actualiza"
  on public.procesos for update
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy "procesos: admin elimina"
  on public.procesos for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- proceso_historial — lectura para autenticados; insert para editor/admin;
-- update y delete prohibidos a todos (no se crean policies = sin acceso bajo RLS).
-- ----------------------------------------------------------------------------
create policy "proceso_historial: lectura autenticados"
  on public.proceso_historial for select
  to authenticated
  using (public.is_authenticated_active());

create policy "proceso_historial: editor/admin inserta"
  on public.proceso_historial for insert
  to authenticated
  with check (public.is_editor_or_admin());

-- ----------------------------------------------------------------------------
-- documentos
-- ----------------------------------------------------------------------------
create policy "documentos: lectura autenticados"
  on public.documentos for select
  to authenticated
  using (public.is_authenticated_active());

create policy "documentos: editor/admin inserta"
  on public.documentos for insert
  to authenticated
  with check (public.is_editor_or_admin());

create policy "documentos: editor/admin actualiza"
  on public.documentos for update
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

create policy "documentos: admin elimina"
  on public.documentos for delete
  to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- audit_log — lectura solo admin/gerencia; insert para cualquier autenticado;
-- update/delete bloqueado por trigger en TODOS los roles (incluido service_role).
-- ----------------------------------------------------------------------------
create policy "audit_log: lectura admin/gerencia"
  on public.audit_log for select
  to authenticated
  using (public.can_view_audit());

create policy "audit_log: insert autenticados"
  on public.audit_log for insert
  to authenticated
  with check (public.is_authenticated_active());
