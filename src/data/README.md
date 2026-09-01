# Datos locales de referencia (no autoritativos)

Los archivos de esta carpeta fueron scaffolding visual durante el MVP.
**No son fuente de verdad en runtime** desde la migración a Supabase vía `gym-gateway`.

| Archivo | Uso actual |
|---------|------------|
| `ejercicios.json` | Referencia histórica. Catálogo runtime → schema `exercises` en Supabase. |
| `rutinas.json` | Referencia para seeds futuros. Rutinas runtime → schema `routines` en Supabase. |
| `routinePresets.ts` | Referencia para galería/presets. Plantillas canónicas se siembran en Supabase bajo aprobación. |
| `unidades.json` | **Catálogo estático activo** — unidades de medida de UI (no hay tabla remota). |
| `usuarios.json`, `sesiones.json` | Fixtures mock de módulos aplazados (planes, tracking). |
| `communities/*` | Fixtures mock del módulo Comunidades (sin backend). |
| `adminDashboard/*` | Métricas mock del dashboard de inicio. |

No importar estos JSON desde pantallas de Biblioteca, formularios de rutina ni pickers de ejercicios en flujos de producción.
