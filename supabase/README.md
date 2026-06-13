# Supabase Setup

## Ejecutar migraciones

1. Ir al dashboard: https://supabase.com/dashboard/project/icfqhtiujsboyrggxpqu/sql
2. Ejecutar `001_initial_schema.sql` completo
3. Ejecutar `002_admin_profiles.sql` completo

## Crear Storage Buckets

En Storage > New bucket:

| Nombre | Public |
|---|---|
| product-images | ✅ |
| collection-covers | ✅ |

En cada bucket > Policies > New policy "For full customization":

**SELECT policy** (nombre: `public_read`):
```sql
true
```

**INSERT/UPDATE/DELETE policy** (nombre: `admin_write`):
```sql
is_admin_or_editor()
```

## Variables de entorno

Ya configuradas en `.env.local`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_WHATSAPP_NUMBER`
