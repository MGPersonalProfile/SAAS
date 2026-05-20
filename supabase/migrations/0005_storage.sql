-- ============================================================================
-- CHFM — Políticas RLS para el bucket "documentos" de Supabase Storage
-- ============================================================================
-- El bucket "documentos" se crea vía Storage API (privado). Estas políticas
-- controlan quién puede leer, subir y borrar archivos.
-- ============================================================================

-- SELECT: cualquier usuario autenticado activo puede listar/descargar.
drop policy if exists "documentos_select" on storage.objects;
create policy "documentos_select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documentos'
    and public.is_authenticated_active()
  );

-- INSERT: editor o admin pueden subir.
drop policy if exists "documentos_insert" on storage.objects;
create policy "documentos_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documentos'
    and public.is_editor_or_admin()
  );

-- DELETE: solo admin.
drop policy if exists "documentos_delete" on storage.objects;
create policy "documentos_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documentos'
    and public.is_admin()
  );
