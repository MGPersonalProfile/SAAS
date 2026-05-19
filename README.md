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

**Próximo: Fase 1** — Auth, roles, layout autenticado, RLS inicial.

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
├── app/                        Next.js App Router
│   ├── auth/                       Páginas de login, registro, recuperación
│   ├── globals.css                 Tema CSS variables (paleta CHFM)
│   ├── layout.tsx                  Layout raíz (providers, fuente, metadata)
│   └── page.tsx                    Landing pública
├── components/
│   ├── ui/                         shadcn/ui (no editar a mano)
│   ├── auth-button.tsx             Botón de auth para topbar
│   ├── login-form.tsx              Formularios de auth de la plantilla
│   ├── sign-up-form.tsx            (a traducir en Fase 1)
│   ├── forgot-password-form.tsx
│   ├── update-password-form.tsx
│   ├── logout-button.tsx
│   └── theme-switcher.tsx          Toggle de tema claro/oscuro
├── lib/
│   ├── supabase/                   Clientes Supabase (browser, server, proxy)
│   └── utils.ts                    cn() helper + hasEnvVars
├── supabase/
│   ├── migrations/                 SQL versionado (vacío hasta Fase 1)
│   └── README.md                   Documentación del esquema
├── proxy.ts                        Middleware de Next.js 16 (renombrado en v16)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Pasos manuales pendientes (fuera de código)

Estos pasos no los puede hacer el agente — requieren cuentas propias:

### Antes de Fase 1
- [ ] Crear proyecto en Supabase y obtener las 3 keys.
- [ ] Llenar `.env.local` con esas keys.
- [ ] (Opcional) Instalar [Supabase CLI](https://supabase.com/docs/guides/cli) para correr migraciones desde tu máquina:
  ```bash
  npm install -g supabase
  supabase login
  supabase link --project-ref <project-ref-del-dashboard>
  ```

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
