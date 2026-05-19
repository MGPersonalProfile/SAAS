-- ============================================================================
-- CHFM — Triggers de negocio
-- ============================================================================
-- - Trigger updated_at automático en tablas mutables.
-- - Trigger que registra cada cambio de estado de un proceso en proceso_historial.
-- - RPC change_proceso_estado(id, estado, comentario) para cambios desde la app.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Función genérica para mantener updated_at
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists budget_set_updated_at on public.budget;
create trigger budget_set_updated_at
  before update on public.budget
  for each row execute function public.set_updated_at();

drop trigger if exists procesos_set_updated_at on public.procesos;
create trigger procesos_set_updated_at
  before update on public.procesos
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Trigger que registra cambios de estado de procesos
-- ----------------------------------------------------------------------------
-- Aplica a INSERT (estado inicial) y UPDATE (cuando estado cambia).
-- El comentario se toma de la variable de sesión `chfm.estado_comentario`
-- (la setea la RPC `change_proceso_estado`; si se hace UPDATE manual, queda NULL).
-- ----------------------------------------------------------------------------

create or replace function public.proceso_track_estado_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_comentario text;
  v_changed_by uuid;
begin
  -- auth.uid() puede ser NULL si la operación viene del service_role (seeds, etc.)
  v_changed_by := auth.uid();

  if tg_op = 'INSERT' then
    insert into public.proceso_historial (
      proceso_id,
      estado_anterior,
      estado_nuevo,
      comentario,
      changed_by
    ) values (
      new.id,
      null,
      new.estado,
      nullif(current_setting('chfm.estado_comentario', true), ''),
      v_changed_by
    );
    -- Limpiar la variable de sesión para no contaminar siguientes inserts
    perform set_config('chfm.estado_comentario', '', true);
    return new;
  end if;

  -- UPDATE: solo registramos si cambió el estado
  if old.estado is distinct from new.estado then
    v_comentario := nullif(current_setting('chfm.estado_comentario', true), '');
    insert into public.proceso_historial (
      proceso_id,
      estado_anterior,
      estado_nuevo,
      comentario,
      changed_by
    ) values (
      new.id,
      old.estado,
      new.estado,
      v_comentario,
      v_changed_by
    );
    perform set_config('chfm.estado_comentario', '', true);
  end if;

  return new;
end;
$$;

drop trigger if exists procesos_track_estado_insert on public.procesos;
create trigger procesos_track_estado_insert
  after insert on public.procesos
  for each row execute function public.proceso_track_estado_change();

drop trigger if exists procesos_track_estado_update on public.procesos;
create trigger procesos_track_estado_update
  after update of estado on public.procesos
  for each row execute function public.proceso_track_estado_change();

-- ----------------------------------------------------------------------------
-- RPC: cambiar estado con comentario
-- ----------------------------------------------------------------------------
-- Uso desde la app:
--   await supabase.rpc('change_proceso_estado', {
--     p_proceso_id: 42,
--     p_estado_nuevo: 'Validado PACC',
--     p_comentario: 'Línea verificada con responsable',
--   });
--
-- Ejecuta en SECURITY INVOKER (respeta RLS del caller). El comentario se pasa
-- al trigger vía variable de sesión.
-- ----------------------------------------------------------------------------

create or replace function public.change_proceso_estado(
  p_proceso_id bigint,
  p_estado_nuevo public.proceso_estado,
  p_comentario text default null
)
returns void
language plpgsql
security invoker
as $$
declare
  v_estado_actual public.proceso_estado;
begin
  select estado into v_estado_actual
  from public.procesos
  where id = p_proceso_id
  for update;

  if v_estado_actual is null then
    raise exception 'Proceso % no encontrado o sin permiso de lectura', p_proceso_id;
  end if;

  if v_estado_actual = p_estado_nuevo then
    raise exception 'El proceso ya está en estado %', p_estado_nuevo
      using errcode = 'check_violation';
  end if;

  -- Pasar comentario al trigger
  perform set_config(
    'chfm.estado_comentario',
    coalesce(p_comentario, ''),
    true
  );

  update public.procesos
  set estado = p_estado_nuevo,
      updated_by = auth.uid()
  where id = p_proceso_id;
end;
$$;

grant execute on function public.change_proceso_estado(bigint, public.proceso_estado, text) to authenticated;
