# CLAUDE.md — Contexto del proyecto FitPro

> Archivo de arranque para el asistente. Contiene el mínimo indispensable para
> trabajar sin romper nada. Para el deep-dive (diagnóstico, modelo objetivo,
> fases, ADR, backlog) leer siempre **[CONTEXT.md](./CONTEXT.md)** — es la
> fuente de verdad. Este archivo es el *resumen ejecutivo*.
>
> Última revisión: 2026-08-27 (auditoría de código completa — ver `CONTEXT.md §12`)

---

## 1. Qué es FitPro

SaaS fitness donde entrenadores crean rutinas/ejercicios/planes semanales y
clientes los ejecutan y ven progreso. Modelo comercial por nº de clientes
(Free / Pro / Gym).

- **Idioma por defecto:** español (UI, commits, docs, nombres de variables de dominio).
- **Estado del MVP:** el modelo de dominio (rutinas/ejercicios) sigue plano y
  sin persistencia real de sesiones — eso sigue bloqueando el producto core.
  Pero auth, routing y biblioteca avanzaron mucho más de lo que sugería la
  revisión anterior. Ver `CONTEXT.md §2` para el detalle.

---

## 2. Stack

| Capa | Hoy | Objetivo |
|---|---|---|
| UI | React 19 + Vite 8 + TypeScript 5.9 (estricto) | — |
| Routing | `react-router-dom` v7 | — |
| Estado UI efímero | Zustand 5 (`useWorkoutStore`, `useCitasStore`, `useCommunitiesStore`) | Zustand (solo UI) |
| Estado local con `persist` | `useDataStore` (rutinas/ejercicios/unidades en localStorage) — hoy sigue así, sin cambios de código | **Migrar a Supabase vía `gym-gateway`, dentro de la Fase 2** (cambio de objetivo 2026-08-27, ver `CONTEXT.md §7`) |
| Estado servidor | TanStack Query **declarado y cableado en código** (`src/main.tsx`, `src/lib/exercisedb/hooks.ts`) pero **no instalado** en `node_modules` — el build falla hoy por esto | TanStack Query funcionando |
| Validación runtime | Zod ya instalado y en uso real (`src/lib/gateway/schemas/*`, `src/lib/exercisedb/schemas.ts`) | Extender a `importData` y formularios |
| Backend auth/datos | **`gym-gateway`** (FastAPI, repo hermano) — proxy real hacia **Supabase Auth + PostgREST**, JWT ES256 vía JWKS, RBAC server-side (`require_role`/`require_admin`) | Mismo, con migraciones SQL versionadas |
| Backend IA | **FastAPI** (`../fitpro_api`) + DeepSeek, `POST /api/ai/routine` | — |
| Supabase en el frontend | Cliente **comentado** en `src/lib/supabase.ts` — el frontend nunca habla con Supabase directo, todo pasa por `gym-gateway` | Mantener así (gateway como única puerta) |
| Estilos | Tailwind 4 + tokens CSS (`@theme` en `index.css`) — **D8 resuelto** 2026-08-24 | Migración oportunista del inline restante |
| Pagos | — | Stripe |
| Observabilidad | — | Sentry + PostHog |
| Tests | — (cero infraestructura: sin Vitest, sin `*.test.ts`) | Vitest + @testing-library/react |

**Dependencias declaradas en `package.json` pero AUSENTES de `node_modules`
(el build rompe por esto — `npm install` pendiente de correr en este
entorno):** `@tanstack/react-query`, `@dnd-kit/core`, `@dnd-kit/sortable`,
`@dnd-kit/utilities`, `@daypicker/react`. Antes de asumir "TanStack Query no
está" o "el drag&drop no funciona": el código que las usa está bien escrito,
solo falta instalar. Correr `npm install` primero si el entorno lo permite.

**Node.js:** el sistema local tiene **v18.19.1**; `Dockerfile` usa
`node:20-alpine` y Vite 8 pide Node ≥20.19/22.12. Puede haber comandos que
fallen localmente (`vite`, `tsc -b`) por esta desalineación — no asumir que es
un bug del código antes de revisar la versión de Node activa.

---

## 3. Estructura del repo

```
fitpro/
├── api/                   # Colecciones Bruno para probar API
├── data/                  # Datos auxiliares (seeds, anatomy)
├── public/
├── scripts/               # Ej: download-anatomy-svgs.mjs
├── src/
│   ├── App.tsx            # Routing + ProtectedRoute/PublicRoute
│   ├── components/
│   │   ├── anatomy/
│   │   ├── calendar/      # Sidebar, Header, Scheduler, CitaForm, FiltersSheet…
│   │   ├── common/        # Sheet, Skeleton, Toast, Avatar, EmptyState, ErrorState,
│   │   │                  # ActionMenu, ConfirmDialog, MediaViewer, Fab — TODO en uso
│   │   ├── communities/   # Módulo Comunidades (UI mock, ver más abajo)
│   │   ├── dashboard/
│   │   ├── exercise/
│   │   ├── layout/        # AppShell, Navbar (+ campana notif.), ThemeToggle
│   │   ├── library/       # LibraryLayout, catálogos, formularios de rutina
│   │   ├── player/        # (vacía — candidata a limpieza)
│   │   ├── userPlans/     # DiaCard, VistaDia, EjercicioSortable (@dnd-kit)
│   │   └── workout/       # (vacía — candidata a limpieza)
│   ├── context/           # AuthContext (REAL, vía gateway), ThemeContext
│   ├── data/              # ejercicios.json, rutinas.json, unidades.json, usuarios.json
│   │   └── communities/   # Fixtures mock del módulo Comunidades (8 JSON)
│   ├── hooks/             # useUnits, useMediaQuery, useNow, useCommunityPermissions…
│   ├── lib/
│   │   ├── gateway/       # Cliente HTTP real hacia gym-gateway (auth, sesión, errores)
│   │   ├── exercisedb/    # Cliente ExerciseDB + hooks TanStack Query + Zod schemas
│   │   ├── ai/            # Helpers del chat IA (fitpro_api)
│   │   └── supabase.ts    # COMENTADO — no se usa (todo pasa por gateway)
│   ├── pages/             # admin/AdminDashboardPage (inicio), CalendarPage, WorkoutPlayer, library/*, communities/*
│   ├── routes/paths.ts    # ROUTES tipado + redirects legacy
│   ├── store/             # useDataStore (persist), useCitasStore (NO persist),
│   │                      # useUsuariosStore (planes/usuarios mock compartido),
│   │                      # useWorkoutStore (NO persist), useCommunitiesStore (NO persist, mock)
│   ├── types/             # index.ts (modelo de rutinas — sigue plano) + community.ts
│   └── utils/             # validators, suggestions, routineMuscles
├── CONTEXT.md             # Fuente de verdad del estado/roadmap
├── HISTORIAL.md           # Snapshots fechados de auditorías de código
├── CLAUDE.md              # Este archivo
├── create-admin.js        # Script legacy (candidato a borrar, sigue presente)
├── docker-compose.yml     # db (Postgres) + app + api (fitpro_api)
└── Dockerfile

gym-gateway/                 # Hermano del repo — FastAPI, proxy hacia Supabase
├── app/routes/auth.py       # signup/login/refresh/logout/user vía Supabase Auth
├── app/routes/proxy.py      # Proxy genérico a PostgREST
├── app/core/auth.py         # Validación JWT ES256 contra JWKS de Supabase
├── app/core/deps.py         # require_role / require_admin (RBAC real, server-side)
└── (sin tests; migraciones SQL documentadas en README pero no versionadas en /sql)

fitpro_api/                  # Hermano del repo — FastAPI + DeepSeek
├── app/main.py              # GET /health, POST /api/ai/routine
├── app/services/deepseek.py
└── requirements.txt
```

**Módulo Comunidades** (`components/communities/`, `pages/communities/`,
`store/useCommunitiesStore.ts`, `data/communities/`): implementado completo
(Fases 0-6 de su propio plan) como **UI pura sobre datos mock en memoria**,
sin backend, sin persistencia, sin relación con el auth real ni con
`gym-gateway`. Ver `CONTEXT.md §12` (entrada 2026-08-27) para el detalle.

**Código muerto confirmado:** `components/player/`, `components/workout/`
(carpetas vacías), `create-admin.js` en raíz. `RoutineWizard.tsx`,
`WizardProgress.tsx`, `UnitManager.tsx`, `components/admin/` **ya no
existen** (limpieza ya realizada, no hace falta repetirla).
`pages/library/LibraryDatosPage.tsx` y `LibraryMisEjerciciosPage.tsx` no
están enrutadas en `App.tsx` — huérfanas, confirmar antes de tocarlas.

---

## 4. Comandos

```bash
npm install                 # pendiente en este entorno: faltan 3 deps en node_modules (ver §2)
npm run dev                 # Vite dev server en http://localhost:5173
npm run build               # tsc -b && vite build — FALLA hoy sin npm install (§2)
npm run lint                # ESLint (flat config, strict TS + react-hooks + react-refresh)
npm run preview
npm run download:anatomy    # descarga SVGs de anatomía

docker-compose up --build   # db (Postgres) + frontend en :5174 + api en :8000
docker-compose up api       # solo backend IA en :8000

# Backend IA (local sin Docker):
# cd ../fitpro_api && uvicorn app.main:app --reload --port 8000

# Backend gateway (auth + proxy Supabase, local sin Docker):
# cd ../gym-gateway && uvicorn app.main:app --reload
```

Variables de entorno: copiar `.env.example` → `.env`. Ver `VITE_GATEWAY_URL`
(gym-gateway, auth real), `VITE_API_URL` (backend IA), `VITE_RAPIDAPI_KEY`
(ExerciseDB). `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` están en el
`.env.example` marcadas como "futuro" — **no se usan** porque el cliente
Supabase del frontend está comentado; Supabase real se habla solo desde
`gym-gateway` (`.env` de ese repo).

---

## 5. Advertencias críticas (leer antes de editar)

1. **Auth YA NO es mock — es real.** `AuthContext` llama a `gym-gateway`
   (`src/lib/gateway/`), que valida contra Supabase Auth (JWT ES256 + JWKS) y
   devuelve tokens reales persistidos en `localStorage` (`fitpro-session`)
   con refresh automático. **No reintroducir un mock** ni asumir que
   cualquier email/password entra — hoy hay validación real de credenciales.
2. **RBAC existe en el backend, no en el frontend.** `gym-gateway` tiene
   `require_role`/`require_admin` server-side y funcionando. El frontend
   recibe `AuthUser.role` pero **no lo usa para gatear rutas ni UI** — no
   asumir gating por rol en `src/` sin verificarlo primero.
3. **Supabase sigue sin cablear en el frontend** (`src/lib/supabase.ts`
   comentado, a propósito). Todo el tráfico a Supabase pasa por
   `gym-gateway`. No descomentar/instanciar el cliente del frontend sin
   discutirlo — sería una segunda vía de acceso a Supabase, redundante con el
   gateway.
4. **El bug histórico de pérdida de datos del wizard (`tipo`/
   `rest_between_sets`/`notes`) está corregido.** `RoutinePage.tsx` ya no
   existe como formulario (solo un redirect legacy); el guardado real vive en
   `src/hooks/useRoutineForm.ts` (`toRutinaPayload`), que sí incluye esos
   campos según el nivel del formulario (básica los omite a propósito;
   intermedia/avanzada los persisten). No repetir esta advertencia como si
   siguiera vigente.
5. **Ejercicios siguen referenciados por `nombre: string`**, no por ID.
   Renombrar un ejercicio rompe rutinas existentes. Migración a
   `ejercicio_id: number` sigue pendiente (deuda técnica de Fase 2, ya no es
   una fase bloqueante separada — ver `CONTEXT.md §7`), **sin iniciar**.
6. **`useWorkoutStore` sigue sin persistir.** No hay historial de entrenos: al
   refrescar se pierde peso/RPE/reps/duración. **Sin esto no hay producto.**
7. **`UserPlansPage` y `CalendarPage` comparten `useUsuariosStore`** (seed
   desde `usuarios.json`). Asignaciones desde calendario y edición en
   `/library/planes` mutan el mismo estado en memoria — se pierde al recargar
   (sin persistencia Supabase aún).
8. **`useCitasStore` (calendario) tampoco persiste** — `addCita`/`addCitas`/
   `deleteCita`; tipo `entrenamiento` | `medidas`; sin `updateCita`. IDs
   autoincrementales en variable de módulo que se resetean en cada carga.
9. **Modelo de datos de rutinas sigue plano.** `EjercicioRutina` creció con
   opcionales (`rpe`, `grupo_superset`, `exerciseDbId`, `musculos_anatomia`)
   pero sigue sin bloques/series estructuradas. No soporta dropsets reales,
   %1RM, tempo, warmup vs working como conceptos de primera clase. **La
   Fase 2 ahora incluye migrar este dominio a Supabase** (§8) — al diseñar
   ese schema, resolver el modelo `Bloque/BloqueItem/SerieDef` de una vez
   (§5 de `CONTEXT.md`) en vez de llevar `EjercicioRutina` tal cual a
   Supabase y tener que rediseñarlo otra vez después. Sigue sin iniciar.
10. **`importData` sigue sin validar con Zod** — solo comprueba que existan
    las claves `rutinas/ejercicios/unidades`, no la forma de sus items
    (vector de corrupción).
11. **El módulo Comunidades (`/communities/*`) es 100% UI mock.** No toca
    Supabase, no toca `gym-gateway`, no persiste (sin `persist` en
    `useCommunitiesStore`). Su sistema de roles (`useCommunityPermissions`)
    es un mock explícito y **no tiene relación con el auth real ni con el
    RBAC de `gym-gateway`** — no confundir ambos sistemas de roles al tocar
    permisos.
12. **Páginas god hoy:** `UserPlansPage.tsx` (508 líneas) y
    `AIRoutineChatPage.tsx` (472 líneas) son las más grandes. El antiguo
    `RoutinePage.tsx` monolítico ya no existe (se descompuso en chooser +
    3 formularios + galería de presets, cada uno <300 líneas) — no citarlo
    como ejemplo de página god.
13. **Tres dependencias declaradas no están instaladas** (`@tanstack/react-query`,
    `@dnd-kit/*`, `@daypicker/react`) — ver §2 y §4. `npm run build` falla
    hoy por esto. No es un bug del código que las usa.

---

## 6. Convenciones y decisiones fijadas

Extracto de `CONTEXT.md §9`. No desviarse sin abrir una ADR nueva allí.

- **D1** — Supabase puro al inicio; FastAPI solo cuando duela. **En la
  práctica:** Supabase se habla vía `gym-gateway` (backend propio), no
  directo desde el frontend.
- **D2** — TanStack Query para datos servidor. Ya cableado en `src/lib/`,
  pendiente de `npm install` en este entorno.
- **D3** — Zustand **solo** para UI efímera (wizard, player runtime, modales,
  módulo Comunidades). Nada de datos de dominio persistidos en localStorage
  cuando haya server real (auth ya cumple esto; rutinas/citas siguen en
  local por migrar en Fase 3).
- **D4** — Zod para validación runtime de todo lo que entra del exterior. Ya
  en uso real en `gateway/schemas` y `exercisedb/schemas`; **pendiente** en
  `importData` y en los formularios de rutina.
- **D5** — RLS obligatorio desde día 1. Client-side gating es barrera
  secundaria. Confirmar que las migraciones SQL de `gym-gateway` (RLS)
  queden versionadas en su repo, no solo documentadas.
- **D6** — Ejercicios referenciados por ID, nunca por nombre. **Sin
  iniciar.**
- **D7** — Modelo `Rutina → Bloque[] → BloqueItem[] → SerieDef[]`
  (ver `CONTEXT.md §5` para el shape completo). **Sin iniciar.**
- **D8** — **Resuelto 2026-08-24:** Tailwind 4 + tokens `@theme` como
  sistema de estilos; `AppShell` progresivo (`narrow`/`default`/`wide`);
  `Sheet` como base de todos los overlays/modales.
- **D9** — Tests con Vitest + @testing-library/react; validators y stores
  primero. **Sin iniciar** — cero infraestructura de testing hoy.
- **D10** — No subir nada a prod sin Sentry + PostHog. **Sin iniciar.**

### Convenciones de código

- **TypeScript estricto y obligatorio** en `src/` (`tsconfig.app.json` ya
  tiene `strict`, `noUnusedLocals`, `noUnusedParameters`): no relajar ni
  suprimir errores del compilador salvo caso puntual y comentado; preferir
  `unknown` + narrow o tipos explícitos.
- **Principios SOLID** al diseñar módulos, hooks y componentes: una razón de
  cambio por unidad (SRP), extender sin modificar consumidores cuando baste
  (OCP), contratos sustituibles (LSP), APIs mínimas expuestas (ISP), depender
  de abstracciones tipadas frente a detalles de infraestructura (DIP).
- Componentes en PascalCase, hooks en `useCamelCase`, stores `useXxxStore`.
- Nombres de dominio en español (`Rutina`, `Ejercicio`, `Bloque`,
  `SerieDef`, `Comunidad`, `Miembro`). Nombres técnicos en inglés.
- No crear archivos nuevos si editar uno existente basta.
- No agregar comentarios que narren el código; solo comentar intención no
  obvia, trade-offs o restricciones.
- **Formularios:** siempre `fp-input` + `fp-btn` con variante (`fp-btn-primary`,
  `fp-btn-secondary`, `fp-btn-ghost`). No recrear campos con `bg-overlay` +
  `rounded-xl`. Búsqueda con icono: `fp-input-group`. Referencia viva:
  [`CitaCreateSheet.tsx`](src/components/calendar/CitaCreateSheet.tsx).
- **Calendario (`/calendario`):** dos flujos separados — **(1) Agendar cita**
  (`CitaCreateSheet`: tipo `entrenamiento` | `medidas`, multi-cliente vía
  `ClienteMultiPicker`, bulk `addCitas`) y **(2) Asignar entrenamiento**
  (`AsignarEntrenoSheet`: rutina obligatoria, multi-cliente, muta plan semana 1
  vía `useUsuariosStore.assignRutinaToUsers`). Desktop: dos CTAs en
  `CalendarHeader`; móvil: FAB → `CalendarActionSheet`. El admin puede ajustar
  planes con flexibilidad; calendario y `/library/planes` comparten
  `useUsuariosStore`.
- **Overlays (`Sheet`):** CTA de envío siempre visible en móvil (cuerpo con
  scroll + botón `shrink-0` abajo, o footer fijo). `Sheet` default `zIndex`
  60 (por encima del bottom nav). Usar `flexColumn` en formularios largos.
- Al editar una página god (`UserPlansPage.tsx`, `AIRoutineChatPage.tsx`),
  **extraer** en vez de seguir agregando.

---

## 7. Rutas principales

Definidas en [src/App.tsx](./src/App.tsx) + [src/routes/paths.ts](./src/routes/paths.ts):

- **Públicas:** `/login`, `/register`.
- **App principal (protegidas):** `/` (dashboard de métricas por rol),
  `/calendario`, `/tracking` (historial mock por cliente; Fase 4 pendiente),
  `/workout/:id`, `/player`, `/anatomytracker`.
- **Biblioteca** (bajo `LibraryLayout`, todo protegido): `/library` (hub),
  `/library/rutinas`, `/library/rutinas/nueva` (chooser de nivel),
  `/library/rutinas/plantillas`, `/library/rutinas/nueva/{basica,intermedia,avanzada}`,
  `/library/catalogo/{ejercicios,partes,equipo,tipos,musculos}`, `/library/ia`,
  `/library/planes`.
- **Comunidades** (mock, UI pura): `/communities` (Explorar),
  `/communities/invitations`, `/communities/:id` (redirect → home) y todo el
  árbol `/communities/:id/{home,posts,posts/create,posts/:postId,events,
  events/create,events/:eventId,events/:eventId/participants,discussions,
  discussions/:discussionId,members,about,admin,admin/members,admin/moderation}`.
- **Otras:** `/notifications`.
- **Redirects legacy:** rutas viejas `/admin/*`, `/library/ejercicios`,
  `/library/rutina/*` → equivalentes canónicos actuales (ver
  `LEGACY_LIBRARY_REDIRECTS` / `LEGACY_ROUTINE_FORM_LEVELS` en `paths.ts`).
  `/admin/dashboard` redirige a `/` (la pantalla de inicio es el dashboard).
- **Ruta huérfana detectada:** `ROUTES.library.unidades`
  (`/library/unidades`) está definida en `paths.ts` y referenciada por
  redirects legacy, pero **no tiene `<Route>` registrada** en `App.tsx` — cae
  al catch-all (`*` → `/`). No hay página de gestión de unidades hoy.

Todo bajo `ProtectedRoute` salvo login/register (bajo `PublicRoute`). Sin
gating por rol — pendiente tras Fase 3, y desconectado del RBAC real que ya
existe en `gym-gateway`.

---

## 8. Roadmap resumido

Detalle en `CONTEXT.md §7`. **Reestructurado 2026-08-27** a pedido del
usuario, en dos pasadas el mismo día: (1) se eliminó la Fase 2.5 (rediseño
del modelo) y la Fase 6 (Monetización) como fases numeradas; Comunidades
pasó a ser la Fase 6. (2) La Fase 2 cambió de objetivo: CRUD local
(`localStorage`) → **CRUD respaldado en Supabase** (vía `gym-gateway`).
Ambos son cambios de **plan**, no de código — nada de la migración a
Supabase de rutinas/ejercicios/unidades está implementado todavía. Estado
actual:

1. Fase 1 — Base del sistema (UI, routing, theming) → **~95%**
2. Fase 2 — CRUD vía Supabase + Biblioteca → **UI ~80% / persistencia real
   en Supabase 0%**. La UI/Biblioteca (hub, catálogos ExerciseDB, 3
   formularios por nivel, galería de presets, chat IA) sigue tan completa
   como antes, corriendo sobre `useDataStore` + `localStorage`. Lo nuevo
   (0% iniciado): diseñar schema Supabase + RLS para rutinas/ejercicios/
   unidades, exponerlo vía `gym-gateway`, migrar `useDataStore` a TanStack
   Query. El rediseño del modelo (`Rutina → Bloque[] → BloqueItem[] →
   SerieDef[]`, ex-Fase 2.5) se resuelve **como parte de este diseño de
   schema**, no aparte — evita migrar el modelo plano y rediseñarlo otra
   vez después.
3. Fase 3 — Supabase + Auth real + TanStack Query → **~35%** (auth real y
   RBAC server-side ya existen vía `gym-gateway`; falta TanStack Query
   instalado, migrar `useCitasStore` a servidor — `useDataStore` se movió a
   Fase 2 —, y gating por rol en el frontend)
4. Fase 4 — Tracking real de sesiones (historial) → ~10% (sin cambios)
5. Fase 5 — Multi-tenant entrenador ↔ cliente → ~5-10% (UI de planes avanzó
   mucho; sigue sin persistencia ni `trainer_client_links`)
6. **Fase 6 — Comunidades** → UI ~100% completa como mock (22 pantallas,
   ~20 modales), **0% backend real**. Falta: esquema de datos, decidir si
   pasa por `gym-gateway`, migrar `useCommunitiesStore` a servidor, y
   resolver la relación entre el rol de comunidad y `AuthUser.role`.
7. Fase 7 — Analytics + IA + móvil → IA de generación de rutinas ya funciona
   end-to-end (adelantada fuera de orden); analytics/móvil en 0%

**Fuera del roadmap:** Monetización (Stripe/`subscriptions`) — despriorizada,
no cancelada; retomar cuando el resto avance más.

**Siguiente tarea crítica:** no hay un gate bloqueante formal. Prioridad
sugerida: diseñar el schema Supabase de Fase 2 (rutinas/ejercicios/unidades,
resolviendo de paso el modelo `Bloque/BloqueItem/SerieDef`), en paralelo a
Fase 3 (`npm install`, `useCitasStore` a servidor, gating por rol) y a
definir el backend de la Fase 6 (Comunidades) antes de seguir ampliando su
UI. No agregar más superficie de escritura contra `EjercicioRutina` plano
sin necesidad — cada formulario nuevo encarece la migración a Supabase.

---

## 9. Cómo trabajar con este repo (protocolo para el asistente)

1. Al arrancar una tarea, leer este `CLAUDE.md` y la sección relevante de
   `CONTEXT.md`.
2. Si la tarea toca datos de dominio (rutinas, ejercicios, sesiones),
   **revisar antes el modelo actual en `src/types/index.ts`** y tener presente
   el modelo objetivo (`CONTEXT.md §5`).
3. Si la tarea implica cambiar auth o el gateway: la autenticación **ya es
   real** (no hay que "migrarla desde mock"). Cambios ahí tocan
   `src/lib/gateway/` y potencialmente el repo `gym-gateway` — avisar al
   usuario si cruza ese límite de repos.
4. Si la tarea implica gating por rol en el frontend: el RBAC ya existe
   server-side en `gym-gateway`; conectar el frontend a eso en vez de crear
   un sistema de roles nuevo (y no confundirlo con el mock de
   `useCommunityPermissions`, que es solo del módulo Comunidades).
5. Si la tarea implica el modelo de rutinas o Supabase como base de datos de
   dominio: **estás tocando la Fase 2** (que desde 2026-08-27 apunta a
   Supabase vía `gym-gateway`, ver §8) y la deuda técnica más cara del repo
   (modelo plano, ex-Fase 2.5, sin fase bloqueante formal). No tocar sin
   avisar — si se diseña el schema de Supabase, resolver el modelo
   `Bloque/BloqueItem/SerieDef` ahí mismo; riesgo de doble migración si se
   lleva `EjercicioRutina` tal cual a Supabase.
6. Al completar una tarea relevante:
   - Si es una decisión técnica → añadirla a `CONTEXT.md §13` (ADR).
   - Si es contexto nuevo de negocio/feedback → `CONTEXT.md §12` con fecha.
   - Si cambia el estado de una fase → actualizar `%` en `CONTEXT.md §7` y
     en este archivo (§8).
   - Si es una auditoría/mapeo completo del código → agregar entrada nueva en
     `HISTORIAL.md` (no reemplazar las anteriores).
7. Nunca borrar código "por estética". Si es código muerto, confirmarlo
   contra `CONTEXT.md §10` antes (y contra la lista de §3 de este archivo).
8. No commitear sin que el usuario lo pida explícitamente.

---

## 10. Archivos de referencia rápida

- [CONTEXT.md](./CONTEXT.md) — fuente de verdad completa.
- [HISTORIAL.md](./HISTORIAL.md) — snapshots fechados de auditorías de código.
- [README.md](./README.md) — documentación del modelo de datos (desactualizada
  en partes; confiar en `CONTEXT.md`/`CLAUDE.md` sobre auth y estructura).
- [src/App.tsx](./src/App.tsx) / [src/routes/paths.ts](./src/routes/paths.ts) — routing.
- [src/pages/admin/AdminDashboardPage.tsx](./src/pages/admin/AdminDashboardPage.tsx) — pantalla de inicio (`/`).
- [src/types/index.ts](./src/types/index.ts) — modelo de datos de rutinas
  (a rediseñar; deuda técnica sin fase bloqueante formal, ver `CONTEXT.md §7`).
- [src/types/community.ts](./src/types/community.ts) — modelo del módulo
  Comunidades (mock, independiente).
- [src/lib/supabase.ts](./src/lib/supabase.ts) — cliente Supabase del
  frontend (comentado a propósito; Supabase real vive detrás de `gym-gateway`).
- [src/lib/gateway/](./src/lib/gateway/) — cliente HTTP real de auth/sesión
  contra `gym-gateway`.
- [src/context/AuthContext.tsx](./src/context/AuthContext.tsx) — auth real
  (ya no mock).
- [src/store/useDataStore.ts](./src/store/useDataStore.ts) — CRUD local
  (persist), pendiente de migrar a Supabase vía `gym-gateway` (Fase 2, ver §8).
- [src/store/useCitasStore.ts](./src/store/useCitasStore.ts) — citas del
  calendario (sin persist; `addCitas` bulk; tipo entrenamiento/medidas).
- [src/store/useUsuariosStore.ts](./src/store/useUsuariosStore.ts) — usuarios y
  planes compartidos entre calendario y `/library/planes` (sin persist).
- [src/store/useSesionesStore.ts](./src/store/useSesionesStore.ts) — historial
  de entrenos mock (`sesiones.json`); ruta `/tracking` (Fase 4 pendiente).
- [src/store/useWorkoutStore.ts](./src/store/useWorkoutStore.ts) — runtime
  del player (sin persistencia).
- [src/store/useCommunitiesStore.ts](./src/store/useCommunitiesStore.ts) —
  módulo Comunidades (mock, sin persist).
- [src/hooks/useRoutineForm.ts](./src/hooks/useRoutineForm.ts) — lógica de
  guardado real de los formularios de rutina (ya no pierde `tipo`/`rest`/`notes`).
- [src/utils/validators.ts](./src/utils/validators.ts) — validadores
  reutilizables de formularios.
