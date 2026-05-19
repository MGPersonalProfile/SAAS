# Supabase — esquema, migraciones y seeds

Esta carpeta contiene todo lo relacionado con la base de datos del proyecto.

## Estructura actual

```
supabase/
├── migrations/                 SQL versionado, ejecutado en orden alfabético
│   ├── 0001_schema.sql              Fase 1 ✓: 7 tablas + 3 enums + índices + FTS
│   └── 0002_rls.sql                 Fase 1 ✓: RLS, helpers, handle_new_user, audit immutable
└── README.md                   (este archivo)
```

## Por implementar (próximas fases)

```
supabase/
├── migrations/
│   ├── 0003_triggers.sql            Fase 2: trigger updated_at + historial automático de procesos
│   └── 0004_seed.sql                Fase 2: presupuesto inicial + 593 líneas PACC
└── seed-pacc.ts                Fase 2: script Node que lee seed_pacc.json del prototipo
```

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
