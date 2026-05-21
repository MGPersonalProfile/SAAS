-- ============================================================================
-- CHFM — Vínculo real entre procesos y líneas del PACC
-- ============================================================================
-- Hasta ahora `procesos.linea_pacc` era un campo de texto libre que apuntaba
-- al `pacc.linea` sin restricción. Cualquier valor era válido. Esta migración
-- añade una FK real y migra los datos existentes.
--
-- `linea_pacc` se mantiene como denormalización para compatibilidad de
-- consultas antiguas y para mostrar el número de línea sin necesidad de JOIN.
-- ============================================================================

alter table public.procesos
  add column pacc_id bigint references public.pacc (id) on delete restrict;

create index procesos_pacc_id_idx on public.procesos (pacc_id);

comment on column public.procesos.pacc_id is
  'FK a la línea del PACC asociada. Nullable para procesos sueltos sin línea, ON DELETE RESTRICT para evitar borrar líneas con procesos activos.';

-- Migración de datos: por cada proceso con linea_pacc no nulo, busca la
-- primera fila de pacc con esa misma `linea` y la asocia. Si no hay match,
-- pacc_id queda null.
update public.procesos p
   set pacc_id = (
     select id from public.pacc
      where linea = p.linea_pacc
      limit 1
   )
 where pacc_id is null
   and linea_pacc is not null
   and linea_pacc <> '';
