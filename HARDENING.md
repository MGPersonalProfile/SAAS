# Endurecimiento para producción institucional

Checklist de pasos manuales para subir el listón de seguridad antes de exponer la app a usuarios reales. Algunos los hace el código (✅), otros requieren tocar Supabase, Vercel o Cloudflare (☐).

## Capa 1 — Aplicación (Next.js)

- ✅ **Headers de seguridad** en [next.config.ts](next.config.ts): CSP estricto, HSTS 2 años, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy bloqueando cámara/micro/geolocalización/etc.
- ✅ **RLS en todas las tablas** (`0001_schema.sql` + `0002_rls.sql`). Service_role solo en código server.
- ✅ **Audit log append-only** con trigger Postgres que rechaza UPDATE/DELETE incluso para service_role.
- ✅ **Auto-protección de admin**: no puedes desactivarte o quitarte tu propio rol desde la UI.
- ✅ **URLs firmadas** de 5 min para descarga de documentos (no exposición directa de paths de Storage).
- ✅ **Validación Zod** en todas las server actions.

## Capa 2 — Supabase

Pasos en [app.supabase.com](https://app.supabase.com) → tu proyecto:

### Authentication → Policies
- ☐ **Password policy**: `Settings` → cambiar mínimo a 12 caracteres, exigir letras + números + símbolos.
- ☐ **Rate limit de login**: Supabase ya limita a 30 req/min por IP por defecto. Considerar bajar a 10 para `/token` en `Rate Limits`.
- ☐ **Session timeout**: bajar `JWT expiry` de 3600s (1h) a 900s (15 min) si querés más rotación.

### Authentication → Providers
- ☐ **Habilitar MFA TOTP** (`Settings` → `Multi-factor authentication` → enable).
- ☐ **Forzar email confirmation** en signup (debería estar on por defecto).
- ☐ **Deshabilitar magic link** si no se usa (`Email` provider → toggle off "Enable email signup with magic link").

### Authentication → URL Configuration
- ☐ **Site URL**: poner el dominio final (ej. `https://chfm.gob.hn`), no la URL `.vercel.app`.
- ☐ **Redirect URLs**: añadir `https://chfm.gob.hn/**` y quitar localhost cuando se vaya a producción.

### Storage → documentos
- ☐ Verificar que el bucket sigue **privado** (`public: false`).
- ☐ Verificar que las policies de `0005_storage.sql` están aplicadas (`Policies` tab).

### Database → Backups
- ☐ **Free tier**: backups diarios automáticos retenidos 7 días. Suficiente para empezar.
- ☐ **Pro tier** ($25/mes): backups con PITR (point-in-time recovery) hasta 7 días atrás. Recomendado para producción real.

## Capa 3 — Vercel

- ☐ **Variables de entorno**: confirmar que las 3 keys de Supabase están en `Production` y no expuestas en `Preview`/`Development` si esos entornos no se usan.
- ☐ **Branch protection en GitHub**: solo permitir merge a `main` con PR aprobado (no requerido inicialmente, sí cuando haya más manos).
- ☐ **Vercel Authentication** (opcional, plan Pro): proteger los Preview deployments con login para que no estén públicos en internet.
- ☐ **Custom domain**: cuando se compre el dominio (ej. `chfm.gob.hn`), configurarlo en `Settings` → `Domains`. Vercel emite el cert SSL automático.

## Capa 4 — Cloudflare (delante de Vercel)

Pasos en [dash.cloudflare.com](https://dash.cloudflare.com):

- ☐ **Añadir el dominio** a Cloudflare. Cambiar los nameservers en el registrador a los de Cloudflare.
- ☐ **DNS**: apuntar `chfm.gob.hn` (o `www.`) al dominio `.vercel.app` con un CNAME proxied (nube naranja).
- ☐ **SSL/TLS**: modo `Full (strict)`.
- ☐ **Always Use HTTPS**: ON.
- ☐ **Min TLS Version**: TLS 1.2 mínimo (1.3 recomendado).
- ☐ **HSTS**: enable con preload (ya está en los headers de Next, pero Cloudflare lo refuerza).
- ☐ **WAF → Managed Rules**: enable `Cloudflare Managed Ruleset` (gratis en Free plan).
- ☐ **Bot Fight Mode**: ON (Free plan).
- ☐ **Rate Limiting Rules**:
   - 10 requests/min a `/auth/login` por IP → block 15 min.
   - 5 requests/min a `/auth/sign-up` por IP → challenge.
   - 100 requests/min a `/api/*` por IP → challenge.
- ☐ **Page Rules / Cache Rules**: dejar `/api/*` y `/auth/*` como `Cache Bypass`. Estáticos (`/_next/static/*`) pueden cachearse agresivamente.

## Capa 5 — Operativa

- ☐ **Procedimiento de respuesta a incidentes** documentado: a quién llamar, dónde están los backups, cómo invalidar todas las sesiones (`auth.admin.signOut(userId)` para cada usuario sospechoso).
- ☐ **Rotación de keys**: rotar `SUPABASE_SERVICE_ROLE_KEY` cada 6 meses (Settings → API → Reset). Actualizar en Vercel sin downtime.
- ☐ **Monitoreo**:
  - Supabase tiene un dashboard de auth events + métricas.
  - Vercel tiene logs de runtime + analytics.
  - Considerar `Sentry` para errores en producción (free tier alcanza para 5K eventos/mes).
- ☐ **Manual breve por rol** para los 100 usuarios reales (sobre todo `editor` y `gerencia`).

## Pen-test ligero (antes de producción)

- ☐ Probar **SQL injection** en cada input (debería estar bloqueado por queries parametrizadas de Supabase).
- ☐ Probar **XSS** poniendo `<script>` en descripciones/notas (React escapa por defecto, debería renderizarse como texto).
- ☐ Probar **acceso directo a /api/\* sin sesión** (debería rebotar a login).
- ☐ Probar **escalación de privilegios**: como `viewer`, intentar POST a `/api/reportes/pdf` (debería fallar por `requireModule`).
- ☐ Probar **descarga de documento ajeno**: intentar adivinar storage_paths (RLS debería bloquear listado y URL firmada solo se genera tras pasar por la app).

## Cuando el proyecto pegue (Fase 6+)

- Migrar Supabase Free → Pro ($25/mes).
- Migrar Vercel Hobby → Pro ($20/mes) para SSO, logs avanzados, password protect.
- Considerar Cloudflare Pro ($20/mes) para WAF custom rules y analytics avanzados.
- Total infra: ~$65/mes para una institución de 100-1000 usuarios.
