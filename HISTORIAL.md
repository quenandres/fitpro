# HISTORIAL — Mapeo general de la app vs fases de desarrollo

> Snapshot puntual (no reemplaza a `CONTEXT.md`, que es la fuente de verdad viva).
> Este documento existe para dejar registro de **qué había realmente en el código**
> en una fecha dada, comparado contra las 7 fases del roadmap (`CONTEXT.md §7`).
> Al hacer el próximo mapeo, agregar una entrada nueva debajo en vez de borrar esta.

---

## 2026-08-18 — Mapeo #1

Basado en inspección directa del código (no solo de `CONTEXT.md`, que estaba
desactualizado en partes — última revisión de fases ahí: 2026-04-16, con
adiciones puntuales hasta 2026-07-10). Commit HEAD: `b005893` (2026-07-21,
rama `dev`).

### 1. Mapa de la aplicación (qué existe hoy)

| Área | Archivos clave | Estado |
|---|---|---|
| Routing | [App.tsx](src/App.tsx) | Ver hallazgo crítico #1 abajo |
| Auth | [AuthContext.tsx](src/context/AuthContext.tsx) | Mock: `localStorage.setItem('fitpro-auth','true')`, sin backend |
| Supabase | [lib/supabase.ts](src/lib/supabase.ts) | 100% comentado, cliente no instanciado |
| Datos dominio | [store/useDataStore.ts](src/store/useDataStore.ts) | `zustand/persist` sobre `localStorage`, seed desde `src/data/*.json` |
| Player de entreno | [store/useWorkoutStore.ts](src/store/useWorkoutStore.ts), [pages/WorkoutPlayer.tsx](src/pages/WorkoutPlayer.tsx) | En memoria, sin persistencia → sin historial de sesiones |
| Planes de usuario | [pages/UserPlansPage.tsx](src/pages/UserPlansPage.tsx) (600 líneas) + `components/userPlans/*` (Vista Día/Semana/Mes/Total, drag&drop con `@dnd-kit`) | UI de calendario bastante avanzada, pero `useState(usuariosData)` → no persiste |
| Admin | `pages/admin/*` (Shell, Rutinas, Catálogo, Planes, Unidades, Datos) + `AdminLayout`/`AdminSubNav` unificados | CRUD local funcional, sin roles ni gating |
| Biblioteca (`/library`) | `pages/library/*` (Hub, catálogos ExerciseDB, chat IA, 3 formularios de rutina por nivel, galería de presets) | Nueva desde jul-2026, integrada con ExerciseDB (RapidAPI) vía `lib/exercisedb/*` + TanStack Query |
| IA para rutinas | `hooks/useAiRoutineChat.ts`, `lib/ai/deepseek.ts`, `pages/library/AIRoutineChatPage.tsx`, backend hermano `fitpro_api` (FastAPI + DeepSeek, `POST /api/ai/routine`) | Funcional: chat → propuesta → resolución contra ExerciseDB → guardar |
| Anatomía | `components/anatomy/*` (Viewer, Heatmap, Recovery) | Selector anatómico y heatmap de recuperación funcionando, enlazado a ejercicios y rutinas |
| Modelo de datos | [types/index.ts](src/types/index.ts) | Sigue siendo `EjercicioRutina{nombre,series,valor,unidad_id,...}` — **Fase 2.5 no iniciada** |
| Tests / Observabilidad | — | Cero tests, cero Sentry/PostHog, confirmado |

### 2. Comparación contra las fases (`CONTEXT.md §7`)

| Fase | % documentado (CONTEXT.md, abr-jul 2026) | % real observado hoy | Comentario |
|---|---|---|---|
| 1 — Base del sistema | ~95% | ~95%, sin cambios | Routing, theming, layout estables |
| 2 — CRUD local | ~70% | **~80%** (subió) | Admin + Biblioteca ahora comparten shell (`AppShell`), import/export JSON, reset a default. Pero sigue sin persistir `tipo`/`rest_between_sets`/`notes` de forma consistente en todos los flujos (ver hallazgo #2) |
| 2.5 — Rediseño del modelo `[BLOQUEANTE]` | 0% | **0%, sin cambios** | `EjercicioRutina` sigue plano (nombre+series+valor+unidad). No existe `Bloque/BloqueItem/SerieDef`. Todo el trabajo nuevo (presets, IA, formularios por nivel) se construyó **sobre el modelo viejo**, aumentando la deuda de migración futura |
| 3 — Supabase + Auth real | 0% | **0%, sin cambios** | `lib/supabase.ts` sigue comentado. `AuthContext` sigue mock. Lo único nuevo tipo "BD" es `scripts/init.sql` (Postgres) para la tabla `exercises` del backend `fitpro_api`, **no** para el dominio de rutinas/usuarios de la app principal — no confundir con integración real de Supabase |
| 4 — Tracking real de sesiones | ~10% | **~10%, sin cambios** | `useWorkoutStore` sigue sin persistir. Sin esto, sigue sin haber "producto" según el propio diagnóstico del proyecto |
| 5 — Multi-tenant entrenador↔cliente | ~5% | **~5-10%** | La UI de planes de usuario avanzó mucho (vistas día/semana/mes/total, drag&drop), pero sigue sin persistencia real ni vínculo trainer↔cliente. No hay tabla `trainer_client_links` ni roles en código (a pesar de que el mensaje del último commit menciona "estructura RBAC users/roles", **no se encontró implementación de roles en `src/`**) |
| 6 — Monetización | 0% | 0%, sin cambios | — |
| 7 — Analytics + IA + móvil | 0% | **IA adelantada fuera de orden**: el chat IA de generación de rutinas (`/library/ia`) ya funciona end-to-end contra DeepSeek + ExerciseDB, antes de completar Fases 2.5–5. Analytics y móvil siguen en 0% | |

### 3. Hallazgos nuevos (no estaban en CONTEXT.md)

1. **🔴 Posible regresión de routing crítica.** En [App.tsx](src/App.tsx#L34-L97),
   *todas* las rutas — incluyendo `/admin/*`, `/library/*`, `/player`,
   `/workout/:id`, `/anatomytracker` y hasta `/` — están envueltas en
   `PublicRoute`, no en `ProtectedRoute`. `PublicRoute` redirige a `/` cuando
   `isAuthenticated === true`. Si esto no es intencional, un usuario logueado
   **no puede entrar a `/admin` ni a `/library`**: cualquier intento lo rebota
   al Dashboard. `ProtectedRoute` existe en el archivo pero ya no se usa en
   ningún `<Route>`. Esto contradice lo documentado en `CLAUDE.md §7` ("Rutas
   protegidas: `/`, `/admin/*`, `/workout/:id`, `/anatomytracker`"). Revisar si
   fue un cambio deliberado (¿se quitó el gating a propósito mientras no hay
   auth real?) o un error de refactor al mover rutas a `AdminShell`/`LibraryLayout`.
2. **La Biblioteca (`/library`) creció mucho más rápido que el modelo de datos.**
   Hay tres formularios de rutina (`básica/intermedia/avanzada`), un chat IA y
   una galería de ~20 presets, todos escribiendo contra el `Rutina`/`EjercicioRutina`
   plano de siempre. Cuantas más superficies escriban contra el modelo viejo,
   más caro será migrar a `Bloque/BloqueItem/SerieDef` en Fase 2.5.
3. **`scripts/init.sql` es fácil de confundir con "ya integramos Supabase".**
   Es un script para una tabla `exercises` en Postgres consumida por
   `fitpro_api` (backend de IA), no para el dominio principal de la app. No
   cambia el diagnóstico de Fase 3 en 0%.
4. **RBAC mencionado en commit, no implementado en código.** El mensaje del
   commit `b005893` dice "estructura RBAC users/roles", pero no se encontró
   ningún tipo `Rol`/campo de rol en `src/types/index.ts` ni en `src/data/`.
   Tratar como intención/nota, no como trabajo hecho.
5. **`UserPlansPage` sigue sin persistir** pese a que su UI (vistas
   día/semana/mes/total + drag&drop con `@dnd-kit`) es ahora la parte más
   sofisticada de la app. Es la brecha UI-vs-dato más grande del repo: mucho
   pulido visual sobre un `useState` que se pierde al refrescar.

### 4. Conclusión / siguiente paso

El diagnóstico de `CONTEXT.md` ("25-30% del MVP real, no 60% como sugiere el
pulido visual") **sigue vigente y se agranda**: se agregó superficie nueva
(Biblioteca, IA, calendario de planes) sin tocar los tres bloqueantes de
fondo — modelo de datos (Fase 2.5), backend real (Fase 3) y persistencia de
sesiones (Fase 4). Cada feature nueva construida sobre el modelo plano
incrementa el costo de la migración pendiente.

**Siguiente tarea crítica sigue siendo la misma que en `CONTEXT.md §11`:**
Fase 2.5 — rediseñar `Rutina → Bloque[] → BloqueItem[] → SerieDef[]`. Antes
de eso, revisar y confirmar/corregir el hallazgo #1 (routing), porque si es
un bug real, bloquea el uso de casi toda la app para un usuario autenticado.

---

## 2026-08-27 — Mapeo #2

Auditoría exhaustiva (3 subagentes en paralelo: auth/gateway, rutas/modelo de
datos, tooling/dependencias) tras implementar el módulo Comunidades. Commit
HEAD: `a300e00` (2026-08-27, rama `dev-supabase`). Confirma que **el hallazgo
#1 del Mapeo #1 (routing roto) ya no existe** — fue corregido en algún punto
entre el 18 y el 24 de agosto.

### 1. Cambios de fondo desde el Mapeo #1

| Área | Mapeo #1 (2026-08-18) | Mapeo #2 (2026-08-27) |
|---|---|---|
| Routing | 🔴 Todo envuelto en `PublicRoute`, posible bug crítico | ✅ `ProtectedRoute`/`PublicRoute` correctos |
| Auth | Mock (`localStorage.setItem('fitpro-auth','true')`) | ✅ Real: `AuthContext` → `gym-gateway` (FastAPI) → Supabase Auth (JWT ES256+JWKS), sesión con refresh automático |
| RBAC | No encontrado en código | Real **server-side** en `gym-gateway` (`require_role`/`require_admin` contra `users.profiles`); **no conectado al frontend** |
| Rutas `/admin/*` | Existían (Admin CRUD) | Eliminadas (commits `298ff26`, `604cd38`); solo redirects legacy a `/library/*` |
| `RoutinePage.tsx` | Wizard monolítico de 683 líneas, con bug de pérdida de datos | Reducido a 23 líneas (solo `RoutinePageRedirect`); bug corregido, guardado real en `useRoutineForm.ts` |
| Módulo Comunidades | No existía | Implementado completo (22 pantallas, ~20 modales), 100% mock |
| Supabase | Comentado en frontend, sin uso real en ningún lado | Comentado en frontend (a propósito) pero **real en `gym-gateway`** |

### 2. Backend nuevo no documentado hasta ahora: `gym-gateway`

Repo hermano (`/home/quenandres/Projects/personal/lodem/gymapp/gym-gateway`),
FastAPI + `supabase-py`, actúa como proxy/gateway entre el frontend y
Supabase:
- `app/routes/auth.py` — signup/login/refresh/logout/user, reenvía a
  Supabase Auth (`/auth/v1/...`).
- `app/routes/proxy.py` — proxy genérico a PostgREST.
- `app/core/auth.py` — valida JWT ES256 contra JWKS real de Supabase.
- `app/core/deps.py` — `require_role`/`require_admin`/`require_admin_or_trainer`,
  RBAC real consultando `users.profiles`.
- Rate limiting (`slowapi`) y logging de acceso.
- **Sin tests.** Migraciones SQL (`sql/001_...`, `sql/002_...`) documentadas
  en su README pero el directorio `sql/` no existe en el checkout — no
  versionadas, no verificables desde el código.
- Posible bug detectado (no confirmado con test): `app/routes/auth.py`, el
  endpoint de `logout` parece usar el user id (`sub`) como si fuera el access
  token al llamar a Supabase — revisar si es intencional.

### 3. Estado de dependencias y build

`npm ls @tanstack/react-query @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @daypicker/react`
→ las 5 vacías. `npm run build` (`tsc -b && vite build`) **falla hoy** por
`TS2307: Cannot find module` en esas 5 dependencias, todas declaradas en
`package.json` pero ausentes de `node_modules` — parece un `npm install`
pendiente en este entorno, no un problema del código (que está bien
tipado/estructurado alrededor de ellas). Además: Node local v18.19.1 vs
`Dockerfile` con `node:20-alpine` vs requisito de Vite 8 (≥20.19/22.12) —
desalineación a resolver antes de diagnosticar fallos de `vite`/`tsc` como
bugs de código.

Zod (`^3.24.2`) sí está instalado y en uso real (`lib/gateway/schemas`,
`lib/exercisedb/schemas`). Cero tests (sin Vitest, sin `*.test.ts`), cero
Sentry/PostHog — sin cambios respecto al Mapeo #1.

### 4. Hallazgos nuevos menores

1. **Ruta huérfana:** `ROUTES.library.unidades` definida en `paths.ts` y
   referenciada por redirects legacy, pero sin `<Route>` registrada en
   `App.tsx` — navegar ahí cae al catch-all (`*` → `/`).
2. **Páginas huérfanas:** `LibraryDatosPage.tsx` y
   `LibraryMisEjerciciosPage.tsx` no están enrutadas ni importadas desde
   ningún otro archivo.
3. **`useCitasStore` vs `useDataStore` inconsistentes:** el primero (citas
   del calendario) no persiste y no tiene `updateCita`; el segundo sí
   persiste con `zustand/persist`. La UI de `CalendarPage.tsx` (304 líneas)
   es mucho más rica que el store que la respalda.
4. **`UserPlansPage.tsx`** creció a 508 líneas (vistas día/semana/mes/total +
   drag&drop con `@dnd-kit`) pero sigue en `useState(usuariosData)` sin
   persistir — la brecha UI-vs-dato más grande del repo, sin cambios de
   fondo respecto al Mapeo #1.
5. **Código muerto ya limpiado** (no repetir en próximas auditorías):
   `RoutineWizard.tsx`, `WizardProgress.tsx`, `UnitManager.tsx`,
   `components/admin/` completo. `components/common/` ya no está vacía (10
   primitivas reales en uso). Sigue pendiente: `create-admin.js`,
   `components/player/` y `components/workout/` (vacías).

### 5. Módulo Comunidades (nuevo, 2026-08-27)

Implementado completo como UI pura: tipos en `src/types/community.ts`,
fixtures en `src/data/communities/*.json`, store `useCommunitiesStore`
(sin `persist`), ~15 páginas bajo `src/pages/communities/`, componentes bajo
`src/components/communities/`. Rutas registradas en `App.tsx` bajo
`/communities/*`. Sistema de roles (`useCommunityPermissions`) mock,
desacoplado a propósito del RBAC real de `gym-gateway`. No conectado a
Supabase, sin persistencia, sin fecha de conexión a backend definida. No
está dentro de las 7 fases del roadmap numerado — tratarlo como módulo
paralelo/prototipo hasta que se decida priorizarlo.

### 6. Conclusión / siguiente paso

El diagnóstico de fondo no cambia: **Fase 2.5 (rediseño del modelo de
Rutina) sigue siendo el bloqueante crítico**, sin iniciar. Lo que sí cambió
es que dos de los tres pilares de infraestructura pendientes en el Mapeo #1
avanzaron de forma real: auth (antes 0%, mock) y RBAC (antes inexistente)
ahora existen y funcionan, vía un backend (`gym-gateway`) no anticipado en
el plan original de "Supabase directo desde el frontend". El tercer pilar
(persistencia de sesiones de entrenamiento, Fase 4) sigue en ~10%, sin
cambios. Antes de seguir construyendo sobre Biblioteca o Comunidades, correr
`npm install` para desbloquear el build, y decidir si el módulo Comunidades
entra al roadmap numerado o se mantiene como prototipo aparte.
