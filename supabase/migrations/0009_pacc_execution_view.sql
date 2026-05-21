-- ============================================================================
-- CHFM — Vista de ejecución por línea PACC
-- ============================================================================
-- Calcula, para cada línea del PACC, cuánto del valor planeado ya está
-- comprometido (procesos activos) y cuánto está ejecutado (Pagado/Cerrado).
-- El estado inicial `Solicitud creada` no cuenta — replica la misma lógica
-- que `budget_derivado_value` usa para el balance global.
-- ============================================================================

create or replace view public.pacc_execution_view
with (security_invoker = true)
as
select
  p.id as pacc_id,
  p.linea,
  p.valor as planeado,
  coalesce(sum(case
    when pr.estado in (
      'Validado PACC',
      'Validado presupuesto',
      'Enviado a Tegucigalpa',
      'Observado',
      'Subsanado',
      'En proceso UCP',
      'Adjudicado',
      'Recibido'
    ) then pr.monto else 0
  end), 0) as comprometido,
  coalesce(sum(case
    when pr.estado in ('Pagado', 'Cerrado') then pr.monto else 0
  end), 0) as ejecutado,
  count(pr.id) as procesos_count
from public.pacc p
left join public.procesos pr on pr.pacc_id = p.id
group by p.id, p.linea, p.valor;

comment on view public.pacc_execution_view is
  'Ejecución agregada por línea PACC: planeado (pacc.valor), comprometido y ejecutado calculados desde procesos.';

grant select on public.pacc_execution_view to authenticated;
