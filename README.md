# CHFM — Sistema de Gestión

Sistema web institucional para la gestión presupuestaria, el PACC y los procesos de compra del Centro Hospitalario.

Reescritura moderna del prototipo Python + SQLite que vive en `../CHFM_Sistema_Profesional_PC_MAC/`. El prototipo se conserva como **especificación viva** — no se reutiliza código, solo el dato semilla del PACC (`seed_pacc.json`) y la lógica de negocio documentada.

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilos | Tailwind CSS 3 |
| Componentes | shadcn/ui (estilo "new-york") |
| Tablas | TanStack Table v8 |
| Gráficos | Recharts |
| Formularios | react-hook-form + Zod |
| PDF | @react-pdf/renderer |
| Notificaciones | Sonner |
| Backend / BD | Supabase (Postgres + Auth + Storage + RLS + Realtime) |
| Edge / WAF | Cloudflare delante de Vercel |
| Hosting | Vercel (front) + Supabase (back) |

## Estado actual

**Fase 0 — Setup** completada:
- Proyecto Next.js inicializado con la plantilla oficial `with-supabase`.
- Componentes shadcn instalados: button, card, dialog, dropdown-menu, form, input, label, select, separator, sheet, sidebar, skeleton, sonner, table, tabs, tooltip, avatar, badge, checkbox.
- Paleta CHFM aplicada (azul `#0b3d62` = `hsl(206 80% 21%)`).
- Plantilla limpia (eliminados componentes tutorial, hero, deploy-button, etc.).
- Layout raíz con `ThemeProvider`, `TooltipProvider`, `Sonner Toaster`, `lang="es"`, fuente Inter.
- Estructura de `supabase/migrations/` lista para Fase 1.

**Fase 1 — Auth, roles, layout y RLS** completada:
- Migraciones SQL versionadas en [supabase/migrations/](supabase/migrations/):
  - `0001_schema.sql`: 7 tablas (profiles, budget, pacc, procesos, proceso_historial, documentos, audit_log) + 3 enums + índices + full-text search en PACC.
  - `0002_rls.sql`: funciones helper (`current_user_role`, `is_admin`, `is_editor_or_admin`, `can_view_audit`), RLS habilitado en todas las tablas, políticas por rol, trigger `handle_new_user` que crea perfil al registrarse, trigger `audit_log_immutable` que bloquea UPDATE/DELETE.
- [types/database.ts](types/database.ts) con tipos de las 7 tablas, 3 enums y 5 funciones RPC (sincronizar a mano hasta que se instale Supabase CLI).
- Clientes Supabase tipados (`lib/supabase/{server,client,proxy}.ts`).
- [lib/auth/](lib/auth/): `permissions.ts` con mapa rol→módulos, `index.ts` con `getCurrentProfile`, `requireProfile`, `requireModule`.
- Layout autenticado [app/(app)/layout.tsx](app/\(app\)/layout.tsx) con sidebar colapsable shadcn (drawer en móvil), topbar con toggle + theme switcher, persistencia de estado abierto/cerrado vía cookie.
- Componentes layout: `AppSidebar` (filtra módulos por rol), `UserMenu` (dropdown con logout), `PageHeader` (header consistente).
- 8 páginas placeholder con `requireModule()` enforcement: dashboard, presupuesto, pacc, compras, reportes, documentos, usuarios, auditoría.
- `proxy.ts` redirige `/` y `/auth/login` a `/dashboard` si hay sesión, y a `/auth/login` si no hay sesión en ruta privada.
- Formularios de auth traducidos: login, sign-up (con nombre completo + validación de 12 caracteres), forgot-password, update-password, sign-up-success, error.

**Fase 2 — Triggers de negocio + seed de datos** completada:
- [0003_triggers.sql](supabase/migrations/0003_triggers.sql): trigger `set_updated_at` (en `budget` y `procesos`), trigger `proceso_track_estado_change` que registra cada cambio de estado (INSERT y UPDATE) en `proceso_historial`, RPC `change_proceso_estado(id, estado, comentario)` para cambios desde la app pasando comentario vía variable de sesión.
- [seed-pacc.mjs](supabase/seed-pacc.mjs): script Node que lee el `seed_pacc.json` del prototipo y genera el SQL.
- [0004_seed.sql](supabase/migrations/0004_seed.sql) generado: 5 conceptos de presupuesto inicial + 593 líneas del PACC (total **L 260,297,850**), con `ON CONFLICT` idempotente.
- `types/database.ts` actualizado con la firma de `change_proceso_estado`.

**Próximo: Fase 3** — Módulos core con datos reales. Dashboard con métricas en tiempo real, Presupuesto CRUD, PACC con búsqueda y filtros, Compras con workflow de estados, Reportes CSV+PDF.

## Cómo correr el proyecto localmente

### 1. Requisitos

- Node.js ≥ 18.18 (instalado: v24).
- npm ≥ 9.

### 2. Configurar Supabase (manual, una sola vez)

1. Crear cuenta en [supabase.com](https://supabase.com) (gratuita).
2. Crear un nuevo proyecto:
   - Nombre: `chfm-sistema`
   - Región: `East US (North Virginia)` o la más cercana a Honduras.
   - Contraseña de Postgres: generar y guardar en gestor de contraseñas.
3. En el panel del proyecto → **Settings** → **API**, copiar:
   - `Project URL` → será `NEXT_PUBLIC_SUPABASE_URL`
   - `Publishable key` (o `anon` key) → será `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `Service role key` (¡secreta!) → será `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
# Editar .env.local con los valores del paso anterior
```

### 4. Instalar dependencias y arrancar

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Nota sobre errores TLS (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`)

Si `npm install` o `npx` falla con error de certificado TLS (común en redes con antivirus o firewall corporativo que intercepta HTTPS), correr siempre con:

```bash
NODE_OPTIONS="--use-system-ca" npm install
NODE_OPTIONS="--use-system-ca" npx ...
```

Para hacerlo permanente en Windows (PowerShell, una sola vez como admin):

```powershell
[Environment]::SetEnvironmentVariable("NODE_OPTIONS", "--use-system-ca", "User")
```

Reabrir la terminal después.

## Estructura del proyecto

```
chfm-app/
├── app/
│   ├── (app)/                      Rutas privadas (sidebar + auth obligatoria)
│   │   ├── layout.tsx              SidebarProvider + AppSidebar + topbar
│   │   ├── dashboard/page.tsx      Página principal post-login
│   │   ├── presupuesto/page.tsx
│   │   ├── pacc/page.tsx
│   │   ├── compras/page.tsx
│   │   ├── reportes/page.tsx
│   │   ├── documentos/page.tsx
│   │   ├── usuarios/page.tsx
│   │   └── auditoria/page.tsx
│   ├── auth/                       Páginas públicas de auth
│   │   ├── login/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── sign-up-success/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── update-password/page.tsx
│   │   ├── confirm/route.ts        Handler de email confirmation
│   │   └── error/page.tsx
│   ├── globals.css                 Tema CSS variables (paleta CHFM)
│   ├── layout.tsx                  Layout raíz (providers, fuente, metadata)
│   └── page.tsx                    Landing pública
├── components/
│   ├── ui/                         shadcn/ui (no editar a mano)
│   ├── layout/
│   │   ├── app-sidebar.tsx         Sidebar con nav filtrada por rol
│   │   ├── user-menu.tsx           Dropdown usuario (logout, perfil)
│   │   └── page-header.tsx         Header consistente por módulo
│   ├── auth-button.tsx             Botón de auth para landing
│   ├── login-form.tsx              Formularios de auth (en español)
│   ├── sign-up-form.tsx
│   ├── forgot-password-form.tsx
│   ├── update-password-form.tsx
│   ├── logout-button.tsx
│   └── theme-switcher.tsx          Toggle de tema claro/oscuro
├── lib/
│   ├── supabase/                   Clientes Supabase tipados (browser, server, proxy)
│   ├── auth/                       getCurrentProfile, requireProfile, requireModule, permissions
│   └── utils.ts                    cn() helper + hasEnvVars
├── types/
│   └── database.ts                 Tipos generados a mano del esquema Postgres
├── supabase/
│   ├── migrations/
│   │   ├── 0001_schema.sql         Tablas + enums + índices + FTS
│   │   └── 0002_rls.sql            RLS + helpers + handle_new_user + audit immutable
│   └── README.md                   Documentación del esquema
├── proxy.ts                        Middleware de Next.js 16 (sesión + redirects por auth)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Pasos manuales pendientes (fuera de código)

Estos pasos no los puede hacer el agente — requieren cuentas propias:

### Antes de Fase 1
- [x] Crear proyecto en Supabase y obtener las 3 keys.
- [x] Llenar `.env.local` con esas keys.

### Después de Fase 1 (para que el sistema funcione end-to-end)

**Aplicar las migraciones SQL** (una sola vez):

Opción A — Supabase Studio (más rápido):
1. Abrir [app.supabase.com](https://app.supabase.com) → proyecto → **SQL Editor**.
2. Pegar y ejecutar **en orden**:
   1. `supabase/migrations/0001_schema.sql` — tablas, enums, índices.
   2. `supabase/migrations/0002_rls.sql` — RLS, helpers, triggers de auth/audit.
   3. `supabase/migrations/0003_triggers.sql` — `updated_at`, tracking de estado, RPC.
   4. `supabase/migrations/0004_seed.sql` — presupuesto inicial + 593 líneas PACC.
3. Verificar en **Table Editor**:
   - 7 tablas presentes.
   - `budget`: 5 filas.
   - `pacc`: 593 filas (`select count(*), sum(valor) from pacc;` debe dar `593 | 260297850.00`).

Opción B — Supabase CLI:
```bash
npm install -g supabase
supabase login
supabase link --project-ref asqcmtdvzfkfgtjqnnjh
supabase db push
```

**Crear los 4 usuarios semilla** (manual en Studio):
1. En Supabase Studio → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Crear estos 4 usuarios (marcar **Auto Confirm User**):

| Email | Password | Rol asignar después |
|---|---|---|
| `admin@chfm.gob.hn` | (mínimo 12 caracteres) | admin |
| `operativo@chfm.gob.hn` | (mínimo 12 caracteres) | editor |
| `visor@chfm.gob.hn` | (mínimo 12 caracteres) | viewer |
| `gerencia@chfm.gob.hn` | (mínimo 12 caracteres) | gerencia |

3. Después de crearlos, ir al **SQL Editor** y ejecutar:
```sql
update public.profiles set role = 'admin'    where username = 'admin';
update public.profiles set role = 'editor'   where username = 'operativo';
update public.profiles set role = 'viewer'   where username = 'visor';
update public.profiles set role = 'gerencia' where username = 'gerencia';
```

(El trigger `handle_new_user` los crea automáticamente con rol `viewer` por defecto; estos `UPDATE` los promueven.)

**Verificar end-to-end**:
- `npm run dev`
- Ir a [http://localhost:3000](http://localhost:3000) → debería redirigir a `/auth/login`.
- Login como `admin@chfm.gob.hn` → debería ir a `/dashboard` y mostrar los 8 items en el sidebar.
- Logout → login como `visor@chfm.gob.hn` → debería ver solo Dashboard y Reportes.
- Probar entrar directo a `/usuarios` como visor → debería redirigir a `/dashboard` (bloqueo por `requireModule`).

### Antes de subir a producción (Fase 5)
- [ ] Crear cuenta en Vercel, conectar este repo de GitHub.
- [ ] En Vercel → Settings → Environment Variables, copiar las mismas 3 keys.
- [ ] Comprar dominio (recomendado: `chfm-sistema.hn` o similar).
- [ ] Crear cuenta en Cloudflare, transferir DNS del dominio.
- [ ] Configurar Cloudflare delante de Vercel: WAF managed rules, Bot Fight Mode, force HTTPS.
- [ ] En Supabase → Auth → URL Configuration, agregar el dominio de producción como `Site URL` y a la lista de `Redirect URLs`.
- [ ] En Supabase → Auth → Providers, habilitar MFA (TOTP).
- [ ] En Supabase → Auth → Policies, configurar política de contraseñas: mínimo 12 caracteres, complejidad.

## Referencias

- Plantilla base: [Next.js Supabase Starter](https://github.com/vercel/next.js/tree/canary/examples/with-supabase)
- Plan completo del proyecto: `../../.claude/plans/encapsulated-dancing-peacock.md`
- Prototipo de referencia: `../CHFM_Sistema_Profesional_PC_MAC/`
