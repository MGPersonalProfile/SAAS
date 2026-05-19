# Supabase — esquema, migraciones y seeds

Esta carpeta contiene todo lo relacionado con la base de datos del proyecto.

## Estructura actual

```
supabase/
├── migrations/                 SQL versionado, ejecutado en orden alfabético
│   ├── 0001_schema.sql              Fase 1 ✓ — 7 tablas + 3 enums + índices + FTS
│   ├── 0002_rls.sql                 Fase 1 ✓ — RLS, helpers, handle_new_user, audit immutable
│   ├── 0003_triggers.sql            Fase 2 ✓ — updated_at, tracking de estado, RPC change_proceso_estado
│   └── 0004_seed.sql                Fase 2 ✓ — presupuesto + 593 líneas PACC (generado)
├── seed-pacc.mjs               Fase 2 ✓ — generador de 0004 a partir del JSON del prototipo
└── README.md                   (este archivo)
```

## Regenerar el seed

Si cambia el `seed_pacc.json` del prototipo:

```bash
node supabase/seed-pacc.mjs
```

Sobrescribe `migrations/0004_seed.sql` con los datos actualizados.
El SQL generado es idempotente (`ON CONFLICT` en budget, `DELETE` previo en pacc),
así que se puede re-aplicar tantas veces como haga falta sin duplicar.

## Aplicar migraciones

Con la CLI de Supabase enlazada al proyecto remoto:

```bash
supabase db push
```

Para generar tipos TypeScript a partir del esquema vivo:

```bash
supabase gen types typescript --linked > ../types/database.ts
```

## Importar el seed del PACC

El archivo fuente (593 líneas, ~L 260,297,850) vive en:
`../../CHFM_Sistema_Profesional_PC_MAC/seed_pacc.json`

El script `seed-pacc.ts` (a implementar en Fase 2) leerá ese JSON y generará el SQL de inserción versionado.
