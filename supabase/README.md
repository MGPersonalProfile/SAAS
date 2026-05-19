# Supabase — esquema, migraciones y seeds

Esta carpeta contiene todo lo relacionado con la base de datos del proyecto.

## Estructura prevista

```
supabase/
├── migrations/          SQL versionado, ejecutado en orden alfabético
│   ├── 0001_schema.sql      (Fase 1: tablas + índices)
│   ├── 0002_rls.sql         (Fase 1: políticas Row Level Security)
│   ├── 0003_triggers.sql    (Fase 2: audit append-only, historial procesos)
│   └── 0004_seed.sql        (Fase 2: presupuesto + 593 líneas PACC)
├── seed-pacc.ts         (script Node que lee seed_pacc.json del prototipo y genera 0004_seed.sql)
└── README.md            (este archivo)
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
