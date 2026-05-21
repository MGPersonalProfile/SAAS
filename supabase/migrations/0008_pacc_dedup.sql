-- ============================================================================
-- CHFM — Dedup del PACC + UNIQUE en `linea`
-- ============================================================================
-- Hasta ahora `pacc.linea` no tenía restricción de unicidad. El importador
-- insertaba filas nuevas cada vez, lo que provocó duplicados (593 originales
-- crecieron a 774). Esta migración:
--   1. Redirige `procesos.pacc_id` desde duplicados hacia la fila que sobrevive
--      (max(id) por `linea`).
--   2. Elimina los duplicados.
--   3. Añade UNIQUE en `pacc.linea` para que el importador pueda hacer upsert.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Redirigir FK de procesos a la fila sobreviviente
-- ----------------------------------------------------------------------------
-- Por cada grupo de duplicados (misma `linea` no nula), la fila sobreviviente
-- es la de mayor id. Todos los procesos que apuntan a un id distinto se
-- reenrutan a la sobreviviente. Si no hay procesos vinculados a duplicados,
-- esta sentencia no actualiza nada.
with sobreviviente as (
  select linea, max(id) as keeper_id
    from public.pacc
   where linea is not null and linea <> ''
   group by linea
  having count(*) > 1
)
update public.procesos p
   set pacc_id = s.keeper_id
  from public.pacc dup
  join sobreviviente s on s.linea = dup.linea
 where p.pacc_id = dup.id
   and dup.id <> s.keeper_id;

-- ----------------------------------------------------------------------------
-- 2. Eliminar los duplicados (todas las filas que NO son el max(id) de su línea)
-- ----------------------------------------------------------------------------
delete from public.pacc
 where id in (
   select dup.id
     from public.pacc dup
     join (
       select linea, max(id) as keeper_id
         from public.pacc
        where linea is not null and linea <> ''
        group by linea
       having count(*) > 1
     ) s on s.linea = dup.linea
    where dup.id <> s.keeper_id
 );

-- ----------------------------------------------------------------------------
-- 3. UNIQUE en `pacc.linea`
-- ----------------------------------------------------------------------------
-- Se usa un índice único parcial: NULL/cadena vacía no participan (multiples
-- NULLs son legales en Postgres por defecto, pero conviene ser explícito y
-- también permitir varias filas con cadena vacía durante la carga inicial).
create unique index pacc_linea_unique_idx
    on public.pacc (linea)
 where linea is not null and linea <> '';

comment on index public.pacc_linea_unique_idx is
  'Unicidad por línea PACC (excluye NULL/empty). Permite upsert por `linea` en el importador.';
