-- ============================================================================
-- CHFM — Interconexión Balance ↔ Procesos
-- ============================================================================
-- Tres de las cinco partidas del presupuesto pasan a calcularse en vivo a
-- partir de los procesos de compra. Las otras dos siguen siendo estáticas
-- (representan cifras externas de SIAFI editables manualmente).
--
-- La aplicación lee del `budget_view` (no de `budget`) para obtener
-- automáticamente los valores derivados. La tabla `budget` sigue siendo el
-- almacenamiento y mantiene los valores históricos.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Enum y columna tipo
-- ----------------------------------------------------------------------------
create type public.budget_tipo as enum ('estatico', 'derivado');

alter table public.budget
  add column tipo public.budget_tipo not null default 'estatico';

update public.budget
   set tipo = 'derivado'
 where concepto in (
   'Comprometido referencial',
   'Ejecutado estimado',
   'Disponible real estimado'
 );

comment on column public.budget.tipo is
  'estatico = monto editable manualmente. derivado = monto calculado desde procesos vía budget_view.';

-- ----------------------------------------------------------------------------
-- Función que calcula el valor de cada partida derivada
-- ----------------------------------------------------------------------------

-- Estados que cuentan como "comprometido" (proceso activo que reserva presupuesto)
-- Estados que cuentan como "ejecutado" (pago efectuado, presupuesto consumido)
-- El estado inicial 'Solicitud creada' no afecta el balance.

create or replace function public.budget_derivado_value(p_concepto text)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  with sums as (
    select
      coalesce(sum(case
        when estado in (
          'Validado PACC',
          'Validado presupuesto',
          'Enviado a Tegucigalpa',
          'Observado',
          'Subsanado',
          'En proceso UCP',
          'Adjudicado',
          'Recibido'
        ) then monto else 0
      end), 0) as comprometido,
      coalesce(sum(case
        when estado in ('Pagado', 'Cerrado') then monto else 0
      end), 0) as ejecutado
    from public.procesos
  ),
  vigente as (
    select coalesce(
      (select monto from public.budget where concepto = 'Presupuesto vigente' limit 1),
      0
    ) as v
  )
  select case p_concepto
    when 'Comprometido referencial' then (select comprometido from sums)
    when 'Ejecutado estimado'       then (select ejecutado from sums)
    when 'Disponible real estimado' then
      (select v from vigente) - (select comprometido from sums) - (select ejecutado from sums)
    else
      0::numeric
  end;
$$;

comment on function public.budget_derivado_value is
  'Devuelve el monto calculado para las 3 partidas derivadas (Comprometido, Ejecutado, Disponible real).';

-- ----------------------------------------------------------------------------
-- Vista que la aplicación consulta
-- ----------------------------------------------------------------------------
-- Para partidas 'estatico' devuelve el monto guardado.
-- Para partidas 'derivado' reemplaza el monto por el valor calculado en vivo.
-- ----------------------------------------------------------------------------

create or replace view public.budget_view
with (security_invoker = true)
as
select
  id,
  concepto,
  case
    when tipo = 'derivado'
      then public.budget_derivado_value(concepto)
    else monto
  end as monto,
  nota,
  updated_at,
  updated_by,
  tipo
from public.budget;

comment on view public.budget_view is
  'Lectura del presupuesto con montos derivados calculados al vuelo desde procesos. La app debe leer aquí, no de budget directamente.';

-- ----------------------------------------------------------------------------
-- Permisos
-- ----------------------------------------------------------------------------
grant select on public.budget_view to authenticated;
grant execute on function public.budget_derivado_value(text) to authenticated;
