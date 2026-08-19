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
