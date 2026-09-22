# CLAUDE.md — Contexto del proyecto FitPro

> Archivo de arranque para el asistente. Contiene el mínimo indispensable para
> trabajar sin romper nada. Para el deep-dive (diagnóstico, modelo objetivo,
> fases, ADR, backlog) leer siempre **[CONTEXT.md](./CONTEXT.md)** — es la
> fuente de verdad. Para **crear o modificar pantallas/UI**, leer siempre
> **[DESIGN.md](./DESIGN.md)** antes de tocar `src/`. Este archivo es el
> *resumen ejecutivo*.
>
> Última revisión: 2026-09-09

---

## 1. Qué es FitPro

Herramienta para que un **entrenador** prescriba entrenamientos y vea si sus
**clientes** los cumplen. El producto existe cuando cierra este loop: crear
rutina → invitar cliente → el cliente ejecuta en **su PWA** → el entrenador
ve el log. Detalle en `CONTEXT.md §1`.

- **Dos apps, un backend.** Este repo es **solo** el cockpit del entrenador
  (SPA). El cliente usa una **PWA React aparte** (repo hermano, aún no
  creado), mismo `gym-gateway`. No implementar un “modo cliente” aquí (D11).
- **Idioma por defecto:** español (UI, commits, docs, nombres de dominio).
- **Primera instancia (MVP):** clientes reales + plan persistido + player
  de la PWA que escribe series + tracking que las lee. Comunidades, billing,
  dashboards de plataforma e IA **no** son el MVP — no ampliarlos.
- **Estado hoy:** auth y Biblioteca avanzadas; el loop sigue cortado
  (clientes seed, player sin persist, tracking mock). Ver `CONTEXT.md §2`.

---

## 2. Stack

| Capa | Hoy | Objetivo |
|---|---|---|
| UI entrenador | React 19 + Vite 8 + TypeScript 5.9 (estricto) — **este repo** | — |
| UI cliente | **no existe** | PWA React + Vite + TS, repo hermano, mismo gateway (D11) |
| Routing | `react-router-dom` v7 | — |
| Estado UI efímero | Zustand 5 (`useWorkoutStore`, `useCitasStore`, `useBillingStore`) | Zustand (solo UI) |
| Estado local con `persist` | `useDataStore` (rutinas/ejercicios/unidades en localStorage) — hoy sigue así, sin cambios de código | **Migrar a Supabase vía `gym-gateway`, dentro de la Fase 2** (cambio de objetivo 2026-08-27, ver `CONTEXT.md §7`) |
| Estado servidor | TanStack Query **declarado y cableado en código** (`src/main.tsx`, `src/lib/exercisedb/hooks.ts`) pero **no instalado** en `node_modules` — el build falla hoy por esto | TanStack Query funcionando |
| Validación runtime | Zod ya instalado y en uso real (`src/lib/gateway/schemas/*`, `src/lib/exercisedb/schemas.ts`) | Extender a `importData` y formularios |
| Backend auth/datos | **`gym-gateway`** (FastAPI, repo hermano) — proxy real hacia **Supabase Auth + PostgREST**, JWT ES256 vía JWKS, RBAC server-side (`require_role`/`require_admin`) | Mismo, con migraciones SQL versionadas |
| Backend IA | **gym-gateway** — OpenRouter en `POST /api/ai/routine` (`gym-mcp` / `fitpro_api` absorbidos; no hay sidecar) | — |
| Supabase en el frontend | Cliente **comentado** en `src/lib/supabase.ts` — el frontend nunca habla con Supabase directo, todo pasa por `gym-gateway` | Mantener así (gateway como única puerta) |
| Estilos | Tailwind 4 + tokens CSS (`@theme` en `index.css`) — **D8 resuelto** 2026-08-24 | Migración oportunista del inline restante |
| Pagos | UI mock de billing en Biblioteca — **fuera de primera instancia** | Stripe, después del loop |
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
│   │   ├── billing/       # Módulo Suscripciones y Pagos (UI mock, ver más abajo)
│   │   ├── communities/   # Módulo Comunidades (UI mock, ver más abajo)
│   │   ├── dashboard/
│   │   ├── exercise/
│   │   ├── layout/        # AppShell, Navbar (+ campana notif.), ThemeToggle
│   │   ├── library/       # LibraryLayout, catálogos, formularios de rutina
│   │   ├── player/        # (vacía — candidata a limpieza)
│   │   ├── userPlans/     # planes por sesión (SesionPlan); GuidedPlanWizard (cliente existente), CreatePlanWizard (alta)
│   │   └── workout/       # (vacía — candidata a limpieza)
│   ├── context/           # AuthContext (REAL, vía gateway), ThemeContext
│   ├── data/              # ejercicios.json, rutinas.json, unidades.json, usuarios.json
│   │   ├── billing/       # Fixtures mock del módulo Suscripciones/Pagos (4 JSON)
│   │   └── communities/   # Fixtures mock del módulo Comunidades (8 JSON)
│   ├── hooks/             # useUnits, useMediaQuery, useNow, useCommunityPermissions…
│   ├── lib/
│   │   ├── gateway/       # Cliente HTTP real hacia gym-gateway (auth, sesión, errores)
│   │   ├── exercisedb/    # Cliente ExerciseDB + hooks TanStack Query + Zod schemas
│   │   ├── ai/            # Helpers del chat IA (gym-gateway /api/ai/routine)
│   │   └── supabase.ts    # COMENTADO — no se usa (todo pasa por gateway)
│   ├── pages/             # admin/AdminDashboardPage (inicio), CalendarPage, WorkoutPlayer, library/*, billing/*, communities/*
│   ├── routes/paths.ts    # ROUTES tipado + redirects legacy
│   ├── store/             # useDataStore (persist), useCitasStore (NO persist),
│   │                      # useUsuariosStore (planes/usuarios mock compartido),
│   │                      # useWorkoutStore (NO persist), useCommunitiesStore (NO persist, mock),
│   │                      # useBillingStore (NO persist, mock)
│   ├── types/             # index.ts (modelo de rutinas — sigue plano) + billing.ts + community.ts
│   └── utils/             # validators, suggestions, routineMuscles
├── CONTEXT.md             # Fuente de verdad del estado/roadmap
├── HISTORIAL.md           # Snapshots fechados de auditorías de código
├── CLAUDE.md              # Este archivo
├── create-admin.js        # Script legacy (candidato a borrar, sigue presente)
├── docker-compose.yml     # app local (el stack de producto es el compose de gymapp/)
└── Dockerfile

gym-gateway/                 # Único backend — FastAPI, proxy Supabase + IA
├── app/routes/auth.py       # signup/login/refresh/logout/user vía Supabase Auth
├── app/routes/sesiones.py   # iniciar / series / completar (training.sessions)
├── app/routes/ai.py         # POST /api/ai/routine (antes gym-mcp / fitpro_api)
├── app/routes/proxy.py      # Proxy genérico a PostgREST
├── app/core/auth.py         # Validación JWT ES256 contra JWKS de Supabase
├── app/core/deps.py         # require_role / require_admin (RBAC real, server-side)
└── sql/                     # migraciones 000–014

fitpro-clients/              # PWA cliente (D11) — mismo gym-gateway
└── player escribe training.sessions / session_sets

`gym-mcp` y `fitpro_api` **ya no existen como repos/servicios**. Su código de IA
quedó en `gym-gateway/app/services/ai/` y `app/routes/ai.py`.
```

**Módulo Comunidades** (`components/communities/`, `pages/communities/`):
núcleo cableado a `gym-gateway` (`/api/comunidades/*`, TanStack Query en
`lib/gateway/hooks.ts`). Fuera de alcance hasta nueva fase: discusiones,
invitaciones, notificaciones, reportes y media. Ver `CONTEXT.md §7` Fase 6.

**Módulo Suscripciones y Pagos** (`components/billing/`, `pages/billing/`,
`store/useBillingStore.ts`, `data/billing/`): UI mock en Biblioteca.
**Fuera de primera instancia — no ampliar.** Ver `CONTEXT.md §12` (2026-09-07 / 09-09).

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

# Stack completo (raíz gymapp/):
# docker compose up --build   # gateway :8008 + FitPro :5174 + PWA :5175

# Backend gateway (auth + Supabase + IA rutinas, local sin Docker):
# cd ../gym-gateway && uvicorn app.main:app --reload --port 8000
```

Variables de entorno: copiar `.env.example` → `.env`. Ver `VITE_GATEWAY_URL`
(gym-gateway, auth + IA rutinas), `VITE_RAPIDAPI_KEY`
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
   `require_role`/`require_admin` server-side. Esta SPA no gatea rutas por
   rol. El cliente **no** se resuelve aquí: va a la PWA (D11).
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
5. **Ejercicios referenciados por `ejercicio_id` en mock local** (2026-09-09):
   rutinas, planes y sesiones ejecutadas usan FK al catálogo de
   `useDataStore.ejercicios`; migración automática al hidratar
   `localStorage`. Persistencia real vía Supabase/gateway sigue en Fase 2.
6. **`useWorkoutStore` sigue sin persistir** (player = vista previa).
   **`useSesionesStore` sí persiste mock** (`fitpro-sesiones`): el entrenador
   registra sesiones con peso/reps por serie vía `RegistrarSesionSheet`.
   La PWA cliente (aún no existe) será el write path de producción.
7. **`UsuariosPage` y `CalendarPage` comparten `useUsuariosStore`** (seed
   `usuarios.json`, sin persist). El plan es por **sesión** (`SesionPlan`),
   no por weekday. Se pierde al recargar. `UserPlansPage.tsx` solo redirige
   a `/usuarios`. **`GuidedPlanWizard`** crea/reconfigura el plan en 6 pasos
   (mock local, guardado atómico al final); progresión prescrita, no adaptación
   por RPE real. **`CreatePlanWizard`** da de alta al cliente (2 pasos) y
   puede generar la rutina con gym-gateway a partir de la descripción de qué
   quiere entrenar; si la IA está apagada deja el plan vacío. Al crear
   navega a `/usuarios/:id?tab=entrenamientos` (2026-09-21).
8. **`useCitasStore` (calendario) tampoco persiste** — `addCita`/`addCitas`/
   `deleteCita`; tipo `entrenamiento` | `medidas`; sin `updateCita`. IDs
   autoincrementales en variable de módulo que se resetean en cada carga.
   El calendario son **citas con fecha**; el plan es **cuota de sesiones**.
9. **Modelo de datos de rutinas sigue plano.** Para primera instancia basta
   ejercicio por ID + N×reps + series ejecutadas con peso/reps. El
   `Bloque/BloqueItem/SerieDef` se deja en el **schema** de Fase 2 para no
   migrar dos veces; no es gate del loop. Ver `CONTEXT.md §1` y §5.
10. **`importData` sigue sin validar con Zod** — solo comprueba que existan
    las claves `rutinas/ejercicios/unidades`, no la forma de sus items
    (vector de corrupción).
11. **Comunidades: paridad con gateway (2026-09-22)** — explorar, posts,
    eventos, miembros y moderación son reales. Billing sigue mock/congelado.
    `useCommunityPermissions` lee `miRol` del gateway (rol de comunidad, no
    confundir con `AuthUser.role` de plataforma).
12. **Páginas god hoy:** `UsuariosPage.tsx` y `AIRoutineChatPage.tsx`. Al
    editarlas, extraer. `UserPlansPage.tsx` ya no es god (redirect).
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
- **D6** — Ejercicios referenciados por ID, nunca por nombre. **Entra en
  primera instancia** (integridad). Sin iniciar.
- **D7** — Modelo `Rutina → Bloque[] → BloqueItem[] → SerieDef[]` en el
  **schema** (`CONTEXT.md §5`). La UI del MVP puede ser N×reps; no migrar
  el modelo plano tal cual a Supabase.
- **D8** — **Resuelto 2026-08-24:** Tailwind 4 + tokens `@theme` como
  sistema de estilos; `AppShell` progresivo (`narrow`/`default`/`wide`);
  `Sheet` como base de todos los overlays/modales.
- **D9** — Tests con Vitest + @testing-library/react; validators y stores
  primero. **Sin iniciar** — cero infraestructura de testing hoy.
- **D10** — No subir nada a prod sin Sentry + PostHog. **Sin iniciar.**
- **D11** — App cliente = **PWA React independiente** (repo hermano, por
  crear), mismo `gym-gateway`. Esta SPA no crece un modo cliente. Ver
  `CONTEXT.md §1` y §9.

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
- **UI y pantallas:** seguir **[DESIGN.md](./DESIGN.md)** (tokens, escala
  tipo/espacio/radio, `AppShell`, `Sheet`, formularios `fp-*`, estados
  vacío/error, copy en español). Resumen mínimo: un voltaje `--brand` en
  CTAs; Sora 600–700 a 22–28px; formularios con `fp-input` + `fp-btn`;
  búsqueda con `fp-input-group`; referencia viva
  [`CitaCreateSheet.tsx`](src/components/calendar/CitaCreateSheet.tsx).
- Al editar una página god (`UsuariosPage.tsx`, `AIRoutineChatPage.tsx`),
  **extraer** en vez de seguir agregando.

---

## 7. Rutas principales

Definidas en [src/App.tsx](./src/App.tsx) + [src/routes/paths.ts](./src/routes/paths.ts):

- **Públicas:** `/login`, `/register`.
- **App principal (protegidas) — cockpit entrenador:** `/` (dashboard mock
  por rol), `/usuarios` y `/usuarios/:id` (clientes + planes por sesión),
  `/calendario`, `/tracking` (historial mock; Fase 4), `/workout/:id`,
  `/player` (prototipo; la ejecución real es la PWA cliente), `/anatomytracker`.
- **Biblioteca** (bajo `LibraryLayout`, todo protegido): `/library` (hub),
  `/library/rutinas`, `/library/rutinas/nueva` (chooser de nivel),
  `/library/rutinas/plantillas`, `/library/rutinas/nueva/{basica,intermedia,avanzada}`,
  `/library/catalogo/{ejercicios,partes,equipo,tipos,musculos}`, `/library/ia`,
  `/library/planes` (redirect a `/usuarios`), `/library/suscripciones` y
  `/library/pagos` (**mock, congelados** — fuera de primera instancia).
- **Comunidades** (mock, **congelado**): `/communities` y el árbol
  `/communities/:id/...`. No ampliar.
- **Otras:** `/notifications`, `/perfil` (datos de cuenta + selector de rol de
  plataforma para pruebas — ver `usePlatformRole` / `useRoleOverrideStore`).
- **Redirects legacy:** rutas viejas `/admin/*`, `/library/ejercicios`,
  `/library/rutina/*` → equivalentes canónicos actuales (ver
  `LEGACY_LIBRARY_REDIRECTS` / `LEGACY_ROUTINE_FORM_LEVELS` en `paths.ts`).
  `/admin/dashboard` redirige a `/` (la pantalla de inicio es el dashboard).
- **Ruta huérfana detectada:** `ROUTES.library.unidades`
  (`/library/unidades`) está definida en `paths.ts` y referenciada por
  redirects legacy, pero **no tiene `<Route>` registrada** en `App.tsx` — cae
  al catch-all (`*` → `/`). No hay página de gestión de unidades hoy.

Todo bajo `ProtectedRoute` salvo login/register (bajo `PublicRoute`). Sin
gating por rol en esta SPA. El cliente no entra aquí: va a la PWA (D11).

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
   en Supabase 0%**. El schema del loop (rutinas por ID, planes, sessions)
   entra aquí; `Bloque/SerieDef` se deja en tablas aunque la UI MVP sea N×reps.
3. Fase 3 — Auth real + TanStack Query → **~35%** (auth/RBAC ya existen;
   falta install, migrar citas, gating hacia la PWA)
4. Fase 4 — Tracking real de sesiones → **~10%**. La **escribe la PWA
   cliente**; `/tracking` en esta SPA solo lee.
5. Fase 5 — Multi-tenant + **nacer la PWA cliente** → **~5-10%** (UI de
   planes por sesión avanzada; sin persist, sin `trainer_client_links`,
   sin repo cliente)
6. **Fase 6 — Comunidades** → paridad con gateway en FitPro + PWA; fuera de
   alcance: discusiones, invitaciones, notificaciones, reportes, media.
7. Fase 7 — Analytics + IA + offline-first / nativo → IA adelantada;
   la PWA **instalable online** no es esta fase (es primera instancia).

**Primera instancia (gate de producto, 2026-09-09):** dos apps + clientes
reales + player que escribe + tracking real. Ver `CONTEXT.md §1` y §7.

**Fuera / congelado:** Monetización (Stripe) y ampliar Comunidades/billing
mock. Retomar cuando un entrenador tenga clientes que entrenen.

**Siguiente tarea crítica:** schema mínimo del loop vía `gym-gateway`,
persistir planes, crear la PWA cliente. No ampliar Comunidades, billing ni
el creador avanzado de rutinas. `npm install` primero (build roto). No
agregar más escritura contra `EjercicioRutina.nombre` sin necesidad.

---

## 9. Cómo trabajar con este repo (protocolo para el asistente)

1. Al arrancar una tarea, leer este `CLAUDE.md` y la sección relevante de
   `CONTEXT.md`. Si la tarea toca UI (`src/pages/`, `src/components/`, estilos),
   leer también **`DESIGN.md`** antes de implementar.
2. Si la tarea toca datos de dominio (rutinas, ejercicios, sesiones),
   **revisar antes el modelo actual en `src/types/index.ts`** y tener presente
   el modelo objetivo (`CONTEXT.md §5`).
3. Si la tarea implica cambiar auth o el gateway: la autenticación **ya es
   real** (no hay que "migrarla desde mock"). Cambios ahí tocan
   `src/lib/gateway/` y potencialmente el repo `gym-gateway` — avisar al
   usuario si cruza ese límite de repos.
4. Si la tarea implica gating por rol en el frontend: el RBAC ya existe
   server-side en `gym-gateway`; conectar el frontend a eso. Rol `client` →
   **PWA aparte**, no una vista nueva aquí. No confundir con el mock de
   `useCommunityPermissions`.
5. Si la tarea implica el modelo de rutinas o Supabase de dominio: **Fase 2**.
   Primera instancia necesita ejercicio por ID y `session_sets`. Al diseñar
   el schema, dejar `Bloque/BloqueItem/SerieDef` para no migrar dos veces;
   no hace falta exponerlo en la UI del MVP. Avisar si se va a llevar
   `EjercicioRutina` tal cual a Supabase.
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
9. **No ampliar Comunidades ni billing** mientras primera instancia no
   cierre. Si la tarea no está en el loop de `CONTEXT.md §1`, cuestionarla.

---

## 10. Archivos de referencia rápida

- [CONTEXT.md](./CONTEXT.md) — fuente de verdad. Empieza por **§1** (visión /
  primera instancia / dos apps).
- [DESIGN.md](./DESIGN.md) — guía de diseño y creación de pantallas.
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
  planes por sesión (seed, sin persist); compartido con calendario.
- [src/store/useSesionesStore.ts](./src/store/useSesionesStore.ts) — historial
  mock (`sesiones.json`); `/tracking` — la fuente real será la PWA cliente.
- [src/store/useWorkoutStore.ts](./src/store/useWorkoutStore.ts) — runtime del
  player en esta SPA (prototipo, sin persistencia).
- [src/store/useCommunitiesStore.ts](./src/store/useCommunitiesStore.ts) —
  módulo Comunidades (mock, sin persist; `createCommunity` solo superadmin).
- [src/hooks/usePlatformRole.ts](./src/hooks/usePlatformRole.ts) — rol plataforma
  efectivo (rol real del gateway + override local editable en `/perfil`).
- [src/store/useRoleOverrideStore.ts](./src/store/useRoleOverrideStore.ts) —
  override de rol para pruebas (persist, `fitpro-role-override`); se limpia al
  cerrar sesión.
- [src/hooks/useRoutineForm.ts](./src/hooks/useRoutineForm.ts) — lógica de
  guardado real de los formularios de rutina (ya no pierde `tipo`/`rest`/`notes`).
- [src/utils/validators.ts](./src/utils/validators.ts) — validadores
  reutilizables de formularios.
