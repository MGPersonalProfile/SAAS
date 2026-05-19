-- ============================================================================
-- CHFM — Esquema base
-- ============================================================================
-- Tablas, enums e índices. Las políticas RLS y triggers viven en 0002_rls.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'editor', 'viewer', 'gerencia');

create type public.proceso_estado as enum (
  'Solicitud creada',
  'Validado PACC',
  'Validado presupuesto',
  'Enviado a Tegucigalpa',
  'Observado',
  'Subsanado',
  'En proceso UCP',
  'Adjudicado',
  'Recibido',
  'Pagado',
  'Cerrado'
);

create type public.proceso_prioridad as enum ('Normal', 'Media', 'Alta');

-- ----------------------------------------------------------------------------
-- profiles — extiende auth.users con username, rol y estado
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  full_name text,
  role public.user_role not null default 'viewer',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);

comment on table public.profiles is 'Perfil aplicativo ligado a auth.users (rol, username, estado activo).';

-- ----------------------------------------------------------------------------
-- budget — partidas presupuestarias
-- ----------------------------------------------------------------------------
create table public.budget (
  id bigint primary key generated always as identity,
  concepto text unique not null,
  monto numeric(18, 2) not null default 0,
  nota text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

comment on table public.budget is 'Partidas presupuestarias del CHFM (concepto único, monto, nota).';

-- ----------------------------------------------------------------------------
-- pacc — Plan Anual de Compras y Contrataciones (con full-text search)
-- ----------------------------------------------------------------------------
create table public.pacc (
  id bigint primary key generated always as identity,
  linea text,
  objeto text,
  descripcion text,
  mes text,
  modalidad text,
  fuente text,
  valor numeric(18, 2),
  unidad text,
  eje text,
  estado text not null default 'Programado',
  search_vector tsvector generated always as (
    setweight(to_tsvector('spanish', coalesce(descripcion, '')), 'A')
    || setweight(to_tsvector('spanish', coalesce(objeto, '')), 'B')
    || setweight(to_tsvector('spanish', coalesce(linea, '')), 'C')
  ) stored
);

create index pacc_search_idx on public.pacc using gin (search_vector);
create index pacc_mes_idx on public.pacc (mes);
create index pacc_modalidad_idx on public.pacc (modalidad);
create index pacc_fuente_idx on public.pacc (fuente);
create index pacc_valor_idx on public.pacc (valor desc nulls last);

comment on table public.pacc is 'Plan Anual de Compras y Contrataciones — catálogo precargado (~593 líneas).';

-- ----------------------------------------------------------------------------
-- procesos — procesos de compra
-- ----------------------------------------------------------------------------
create table public.procesos (
  id bigint primary key generated always as identity,
  codigo text unique not null,
  linea_pacc text,
  objeto text,
  descripcion text,
  monto numeric(18, 2) not null default 0,
  estado public.proceso_estado not null default 'Solicitud creada',
  responsable text,
  prioridad public.proceso_prioridad not null default 'Normal',
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

create index procesos_estado_idx on public.procesos (estado);
create index procesos_prioridad_idx on public.procesos (prioridad);
create index procesos_created_at_idx on public.procesos (created_at desc);

comment on table public.procesos is 'Procesos de compra con workflow de 10+ estados.';

-- ----------------------------------------------------------------------------
-- proceso_historial — cambios de estado (append-only)
-- ----------------------------------------------------------------------------
create table public.proceso_historial (
  id bigint primary key generated always as identity,
  proceso_id bigint not null references public.procesos (id) on delete cascade,
  estado_anterior public.proceso_estado,
  estado_nuevo public.proceso_estado not null,
  comentario text,
  changed_at timestamptz not null default now(),
  changed_by uuid references public.profiles (id) on delete set null
);

create index proceso_historial_proceso_id_idx on public.proceso_historial (proceso_id, changed_at desc);

comment on table public.proceso_historial is 'Historial inmutable de cambios de estado de cada proceso.';

-- ----------------------------------------------------------------------------
-- documentos — archivos vinculados a procesos (storage_path apunta a Supabase Storage)
-- ----------------------------------------------------------------------------
create table public.documentos (
  id bigint primary key generated always as identity,
  proceso_id bigint not null references public.procesos (id) on delete cascade,
  nombre text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_at timestamptz not null default now(),
  uploaded_by uuid references public.profiles (id) on delete set null
);

create index documentos_proceso_id_idx on public.documentos (proceso_id);

comment on table public.documentos is 'Documentos adjuntos a procesos (referencia a Supabase Storage bucket "documentos").';

-- ----------------------------------------------------------------------------
-- audit_log — bitácora append-only (UPDATE/DELETE bloqueados por trigger en 0002)
-- ----------------------------------------------------------------------------
create table public.audit_log (
  id bigint primary key generated always as identity,
  fecha timestamptz not null default now(),
  usuario_id uuid references public.profiles (id) on delete set null,
  username text,
  accion text not null,
  modulo text not null,
  detalle text,
  ip text,
  user_agent text
);

create index audit_log_fecha_idx on public.audit_log (fecha desc);
create index audit_log_usuario_idx on public.audit_log (usuario_id);
create index audit_log_modulo_idx on public.audit_log (modulo);

comment on table public.audit_log is 'Bitácora inmutable de acciones del sistema.';
