# FitPro — Contexto y Roadmap

> Documento vivo. Se actualiza conforme se agregan datos, decisiones y aprendizajes.
> Última revisión: 2026-09-09 (visión recortada a primera instancia + app cliente PWA — ver §1, §12 y ADR en §13).
> Auditoría de código de fondo: 2026-08-27 (ver §2 y `HISTORIAL.md`); el delta de producto/código posterior está en §2.
>
> **Uso:** este archivo es la fuente de verdad del estado del producto, su arquitectura y su plan de ejecución. Al arrancar una nueva conversación con el asistente, referencia `@CONTEXT.md` para que tenga todo el contexto.

---

## 0. Índice

- [1. Visión del producto](#1-visión-del-producto)
- [2. Estado actual real del código](#2-estado-actual-real-del-código)
- [3. Diagnóstico técnico (sin suavizar)](#3-diagnóstico-técnico-sin-suavizar)
- [4. Análisis profundo del módulo de rutinas](#4-análisis-profundo-del-módulo-de-rutinas)
- [5. Modelo de datos propuesto](#5-modelo-de-datos-propuesto)
- [6. Arquitectura objetivo](#6-arquitectura-objetivo)
- [7. Fases del producto](#7-fases-del-producto)
- [8. Riesgos críticos](#8-riesgos-críticos)
- [9. Decisiones técnicas fijadas](#9-decisiones-técnicas-fijadas)
- [10. Limpieza inmediata pendiente](#10-limpieza-inmediada-pendiente)
- [11. Backlog vivo](#11-backlog-vivo)
- [12. Contexto adicional (se va agregando)](#12-contexto-adicional-se-va-agregando)
- [13. Bitácora de decisiones (ADR ligero)](#13-bitácora-de-decisiones-adr-ligero)

---

## 1. Visión del producto

### Qué

FitPro es la herramienta con la que un **entrenador** prescribe entrenamientos a sus **clientes** y ve si los cumplen. Plan, ejecución y seguimiento viven juntos, con datos reales (peso, reps, RPE, fecha).

No es una red social, ni un cobrador, ni un catálogo de ejercicios. Esos módulos pueden existir como apoyo o como fases posteriores; **no definen el producto**.

### Para qué

Dejar de mandar rutinas por WhatsApp, PDF o Excel. El entrenador deja de adivinar si el cliente entrenó; el cliente deja de preguntar “¿qué toca hoy?”.

### Cómo (loop de valor)

El producto existe cuando este ciclo cierra de punta a punta:

1. El entrenador crea (o reutiliza) una rutina: ejercicios + series + reps.
2. Invita a un cliente (cuenta real, rol `client`).
3. Arma un plan: N sesiones por semana, rutina por sesión, fecha de inicio.
4. El cliente abre **su PWA**, ve la siguiente sesión pendiente, la ejecuta y cada serie guarda peso y reps.
5. El entrenador abre la ficha del cliente y ve última sesión, cumplimiento de la semana y el log.

El write path de sesión ya vive en `gym-gateway` + PWA (`training.sessions` / `session_sets`). En FitPro, clientes/planes locales y tracking mock siguen hasta hidratar por `client_uuid`. Ver §2.

### Dos apps, un backend

El cliente **no** es un rol más dentro de esta SPA. Son dos frontends que comparten `gym-gateway` y el mismo proyecto Supabase.

| App | Forma | Quién | Qué hace |
|---|---|---|---|
| **FitPro Entrenador** | SPA React — **este repo** (`fitpro`) | Entrenador (y roles de plataforma) | Biblioteca, clientes, planes, calendario, tracking |
| **FitPro Cliente** | **PWA React** (`fitpro-clients`) | Cliente | Entreno de hoy, ejecutar sesión, historial propio |
| **gym-gateway** | FastAPI, repo hermano | ambas apps | Auth, RBAC, proxy a Supabase, **IA de rutinas** |
| ~~fitpro_api / gym-mcp~~ | **Absorbidos en gym-gateway** (2026-09-21/22) | — | `POST /api/ai/routine` ya no tiene sidecar |

Reglas:

- Mismo login (Supabase Auth vía gateway). El rol decide **a qué app entra**, no qué pestaña ve dentro de la app de entrenador.
- Primera instancia de la PWA: instalable, ejecutar la sesión asignada, escribir `sessions` / `session_sets` al servidor. **Offline-first profundo no es requisito del MVP** (eso sigue en Fase 7).
- Esta SPA no debe crecer un “modo cliente”. Si hace falta ejecutar un entreno aquí, es solo prototipo del player hasta que exista la PWA.
- Diseño: misma identidad visual (`DESIGN.md`, tokens `--brand`); la PWA es más estrecha (sesión, historial, perfil), sin Biblioteca ni cockpit.

### Primera instancia (MVP de producto)

Cierra el loop de arriba. Está **lista** cuando se cumplan estas cuatro condiciones, en este orden:

1. **Dos apps.** Entrenador en esta SPA; cliente en su PWA. Gating por `AuthUser.role` (el RBAC de `gym-gateway` ya existe).
2. **Clientes reales.** Invitación + `trainer_client_links` + plan persistido (no `usuarios.json`).
3. **Player que escribe.** Terminar un entreno en la PWA crea una sesión real, con peso y reps por serie.
4. **Tracking alimentado por eso.** `/tracking` y cumplimiento leen `sessions`, no `sesiones.json`.

Para el modelo de rutinas **en esta instancia** basta: ejercicio referenciado por **ID** (no por nombre), plantilla simple N series × reps, y **peso/reps por serie ejecutada**. Dropsets, EMOM, tempo, superseries estructurales y el modelo `Bloque/BloqueItem/SerieDef` **no son requisito del MVP** — sí lo son al diseñar el schema de Supabase (Fase 2), para no migrar dos veces. Ver §5 y §7.

**Fuera de primera instancia** (aunque parte ya esté dibujada en este repo):

- Comunidades (Fase 6) — prototipo mock; no ampliar UI.
- Suscripciones y pagos (UI mock en Biblioteca) y Stripe / planes Free·Pro·Gym.
- Dashboards de plataforma (superadmin / líder de comunidad) con métricas mock.
- Catálogos ExerciseDB como producto (sí como apoyo al creador de rutinas).
- IA de rutinas (ya funciona; no bloquea el loop).
- Anatomy tracker y medidas corporales como producto.
- Offline-first profundo, app nativa, coach LLM.

Modelo comercial (cobrar por nº de clientes: Free / Pro / Gym) se retoma **después** de que un entrenador tenga clientes reales que entrenen.

### Stack objetivo

| Capa | Tecnología |
|---|---|
| UI entrenador | React 19 + Vite + TypeScript — este repo |
| UI cliente | React + Vite + TypeScript, **PWA** — repo hermano (por crear) |
| Routing | react-router-dom v7 |
| Estado UI efímero | Zustand (wizard, player runtime, modales) |
| Estado servidor | TanStack Query (cableado en entrenador, pendiente `npm install` en este entorno) |
| Validación runtime | Zod (ya en `gateway/schemas` y `exercisedb/schemas`; falta en `importData` y formularios) |
| Backend datos/auth | Supabase (Postgres + Auth + Storage), **solo** vía **`gym-gateway`** — ver §2 y ADR 2026-08-24 |
| Backend IA | `gym-gateway` (`POST /api/ai/routine`, OpenRouter). `gym-mcp` / `fitpro_api` no se levantan |
| Pagos | Stripe — **después** de primera instancia |
| Estilos | Tailwind 4 (+ tokens CSS) — **D8 resuelto**, ver §9. Misma identidad en ambas apps |
| Observabilidad | Sentry + PostHog (a introducir antes de prod) |

---

## 2. Estado actual real del código

> **Delta 2026-09-09** (producto + código desde la auditoría de abajo):
>
> - **Visión recortada** a primera instancia y **app cliente = PWA React aparte** — ver §1. Esta SPA es solo el cockpit del entrenador. La PWA **no existe aún**.
> - **Planes por sesión, no por día de la semana.** `PlanUsuario` usa `SesionPlan[]` (cuota `dias_entrenar_semana`, modos `repetitiva` \| `sesiones_variables`, progresión `fijo` \| `incremental`, `descanso_min_dias`, `regla_progresion_global` opcional). Superficie: `/usuarios` y `/usuarios/:id` (`UsuariosPage`). **`GuidedPlanWizard`** (6 pasos) en ficha cliente → Entrenamientos: crear/reconfigurar plan con draft local y guardado atómico al final; **`CreatePlanWizard`** (2 pasos) da de alta al cliente y, si el entrenador lo pide, genera la rutina con gym-gateway (`POST /api/ai/routine`) a partir de «qué quiere entrenar» y la manda en el invite. Al terminar lleva a `/usuarios/:id?tab=entrenamientos` (2026-09-21). Store: `useUsuariosStore` (sigue **sin persist**, seed `usuarios.json`). Progresión prescrita es mock — adaptación por RPE/resultados reales pendiente de backend.
> - **Tracking** (`/tracking`, ficha progreso, cumplimiento, calendario de entrenos):
>   hidrata `useSesionesStore` desde `GET /api/trainers/clients/{id}/historial`
>   (sesiones completadas en la PWA). Sin mock ni registro manual del entrenador
>   (2026-09-23). Player de biblioteca no escribe.
> - Medidas corporales en ficha de usuario (`useMedidasStore`, localStorage) — 2026-08-31.
> - Módulo **Suscripciones y Pagos** (UI mock, 2026-09-07) — **fuera de primera instancia**; no ampliar.
> - El player (`useWorkoutStore`) sigue sin persistir. No hay vista “entreno de hoy”.
>
> Auditoría de código de fondo: 2026-08-27 (no contra README/commits). Varias cosas documentadas como "mock" o "0%" en abril 2026 **ya no son ciertas** — sobre todo auth y Biblioteca. Ver también `HISTORIAL.md`.

### Lo que realmente hay

- **Routing funcional** en [src/App.tsx](src/App.tsx) con `ProtectedRoute` /
  `PublicRoute` bien aplicados (la regresión de routing detectada en el
  mapeo de 2026-08-18 — todo envuelto en `PublicRoute` — **está corregida**).
- **Auth real de extremo a extremo**, contra un backend propio:
  [src/context/AuthContext.tsx](src/context/AuthContext.tsx) llama a
  `src/lib/gateway/` (`loginRequest`, `signupRequest`, `logoutRequest`,
  `refreshRequest`), que hace `fetch` HTTP real contra
  **`gym-gateway`** (`VITE_GATEWAY_URL`), un backend FastAPI hermano que a su
  vez valida contra **Supabase Auth** (JWT ES256 + JWKS) y expone
  `/api/auth/{signup,login,refresh,logout,user}`. Los tokens se persisten en
  `localStorage` (`fitpro-session`) con expiración real y refresh automático
  (incluye limpieza de una key legacy `fitpro-auth` — confirma que el mock
  anterior existió y fue reemplazado). `LoginPage`/`RegisterPage` llaman
  directo a `useAuth().login/signup`, sin `setTimeout` simulado.
- **RBAC real, pero solo en el backend.** `gym-gateway` tiene
  `require_role`/`require_admin`/`require_admin_or_trainer` (server-side,
  consulta `users.profiles` en Supabase) protegiendo endpoints reales. El
  frontend recibe `AuthUser.role` pero **no gatea nada con él** — no hay
  `/admin/*` protegido por rol en `src/`, de hecho ya no existen rutas
  `/admin/*` (se limpiaron, ver más abajo).
- **UI pulida** (dark/light, componentes visuales, tokens CSS vía `@theme`,
  D8 resuelto).
- **CRUD local** de rutinas/ejercicios/unidades en
  [src/store/useDataStore.ts](src/store/useDataStore.ts) sobre `localStorage`
  (`zustand/persist`) — sin cambios de fondo, sigue siendo la fuente de
  verdad de rutinas.
- **Biblioteca (`/library`) mucho más desarrollada que en abril:** hub,
  catálogos de ExerciseDB, chat IA (`/library/ia`, funcional contra
  `fitpro_api` + DeepSeek), 3 formularios de rutina por nivel
  (básica/intermedia/avanzada) y galería de ~20 presets. El antiguo wizard
  monolítico (`RoutinePage.tsx`, 683 líneas) **ya no existe como
  formulario** — quedó como un simple redirect legacy de 23 líneas
  (`RoutinePageRedirect`); la lógica de guardado real vive ahora en
  [src/hooks/useRoutineForm.ts](src/hooks/useRoutineForm.ts).
- **Workout player** en [src/pages/WorkoutPlayer.tsx](src/pages/WorkoutPlayer.tsx) — sigue avanzando series solo en memoria.
- **Calendario (`/calendario`)** con UI rica (semana/mes/día, responsive,
  scheduler con slots, sheet de detalle, FAB móvil) sobre
  [src/store/useCitasStore.ts](src/store/useCitasStore.ts) — store mínimo
  (23 líneas: solo `addCita`/`deleteCita`, sin `updateCita`, sin `persist`).
  Desbalance UI-vs-dato notable.
- **Cockpit de clientes** en [src/pages/UsuariosPage.tsx](src/pages/UsuariosPage.tsx)
  (`/usuarios`, `/usuarios/:id`): ficha con tabs progreso / entrenamientos /
  medidas, wizard de plan, workspace de sesiones (semana/mes/total, drag&drop
  `@dnd-kit`). Vive en `useUsuariosStore` (seed `usuarios.json`, **sin persist**).
  `UserPlansPage.tsx` solo redirige a `/usuarios`.
- **Calendario** y **planes** son cosas distintas: el plan es una **cuota de
  sesiones** (no un weekday fijo); el calendario son **citas con fecha**
  (entrenamiento / medidas).
- **Módulo Comunidades / Fase 6** (`/communities/*`): núcleo cableado a
  `gym-gateway` (`/api/comunidades/*`) — explorar, crear (admin), unirse/salir,
  publicaciones, comentarios, reacciones, eventos con RSVP, miembros y
  moderación. `useCommunityPermissions` lee `miRol` del gateway. **Fuera de
  alcance hasta nueva fase:** discusiones, invitaciones, notificaciones,
  reportes y subida de fotos (sin API). Ver §7.
- **Módulo Suscripciones y Pagos** (`/library/suscripciones`, `/library/pagos`):
  UI mock sobre `useBillingStore` — **fuera de primera instancia**.
- **No hay app cliente.** El player en este repo es un prototipo de ejecución
  para el entrenador; la PWA del cliente aún no tiene repo.

### Lo que NO hay (aunque parezca que sí)

- **Supabase en el frontend:** cliente completamente comentado en
  [src/lib/supabase.ts](src/lib/supabase.ts), a propósito — el frontend
  nunca habla con Supabase directo, todo pasa por `gym-gateway`. (Supabase sí
  está realmente cableado, pero **en el backend `gym-gateway`**, no aquí.)
- **Roles en el frontend:** el campo existe en `AuthUser`, pero no hay
  gating de rutas/UI por rol en `src/App.tsx` ni en ninguna página.
- **App cliente / PWA:** no hay repo, no hay “entreno de hoy”, no hay cuenta `client` usando un frontend distinto.
- **Historial de entrenos:** [src/store/useWorkoutStore.ts](src/store/useWorkoutStore.ts) **sigue sin persistir** (player = vista previa). **`useSesionesStore`** (2026-09-09) persiste mock con peso/reps por serie; registro manual del entrenador. Gateway/PWA pendiente.
- **Relación entrenador ↔ cliente:** no hay `trainer_client_links`, ni invitación, ni persistencia del plan.
- **Monetización real (Stripe):** cero. Hay UI mock de billing; no cuenta como hecha.
- **Tests:** cero (sin Vitest configurado, sin un solo `*.test.ts`).
- **Observabilidad:** cero (sin Sentry, sin PostHog).
- **Instalación completa de dependencias:** `@tanstack/react-query`,
  `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` y
  `@daypicker/react` están **declaradas en `package.json` pero ausentes de
  `node_modules`** en este entorno — `npm run build` falla hoy por esto. El
  código que las usa (TanStack Query en `lib/exercisedb/hooks.ts`, drag&drop
  en planes de `/usuarios`, calendario con `@daypicker/react`) está bien escrito;
  falta correr `npm install`.

### Pérdida silenciosa de datos — **CORREGIDA**

El bug documentado desde abril 2026 (el wizard descartaba `tipo`,
`rest_between_sets` y `notes` al guardar) **ya no aplica**. `RoutinePage.tsx`
ya no contiene lógica de guardado; el guardado real (`toRutinaPayload` en
[src/hooks/useRoutineForm.ts](src/hooks/useRoutineForm.ts)) sí incluye esos
campos según el nivel del formulario:

```179:198:src/hooks/useRoutineForm.ts
  const toRutinaPayload = useCallback((): Omit<Rutina, 'id'> => {
    const { ejercicios, ...rest } = form;
    const payload: Omit<Rutina, 'id'> = {
      nombre: rest.nombre.trim(),
      categoria: rest.categoria || 'Fuerza',
      dificultad: rest.dificultad,
      duracion_min: rest.duracion_min,
      descripcion: rest.descripcion.trim(),
      ejercicios: ejercicios.map(({ _key: _k, ...ej }) => ({ ...ej })),
    };

    if (level !== 'basica') {
      payload.rest_between_sets = rest.rest_between_sets;
      payload.notes = rest.notes.trim() || undefined;
    }

    if (level === 'avanzada') {
      payload.tipo = rest.tipo;
    }

    return payload;
```

`nombre: string` como referencia de ejercicio (en vez de `ejercicio_id`) y el
modelo `series: number` escalar **siguen sin resolverse** — ver §3/§4/§9.

### Posición real en la línea de fases

> Numeración y alcance de fases actualizados 2026-08-27 (ver nota al inicio
> de §7): ya no hay Fase 2.5 ni Fase 6-Monetización; Fase 2 ahora apunta a
> Supabase y Comunidades es la Fase 6.

- Fase 1 (UI base): **~95% completado** (sin cambios)
- Fase 2 (CRUD vía Supabase + Biblioteca): **UI ~80% / persistencia real en
  Supabase 0%** — la Biblioteca sigue funcionando igual, sobre
  `localStorage`; lo nuevo (schema Supabase + migración de `useDataStore`,
  incluye resolver el modelo plano) no ha empezado.
- Fase 3 (Supabase + Auth real): **~35% completado** — auth real y RBAC
  server-side ya existen; falta TanStack Query instalado, migrar
  `useCitasStore` a servidor (la migración de `useDataStore` se movió a
  Fase 2), y gating por rol en frontend.
- Fase 4 (tracking de sesiones): **~10%, sin cambios**
- Fase 5 (multi-tenant): **~5-10%** (UI de planes avanzó, dato sigue sin persistir)
- Fase 6 (Comunidades): **paridad con gateway en FitPro + PWA (2026-09-22)**;
  discusiones, reportes, notificaciones, invitaciones y media quedan fuera
  hasta exista API
- Fase 7: sin cambios de fondo (IA de rutinas ya funciona, adelantada fuera de orden)

**Los bloqueantes de primera instancia (2026-09-09) son cuatro, y el modelo
plano ya no es el gate:** (1) no hay PWA cliente, (2) no hay clientes reales
ni plan persistido, (3) el player no escribe sesiones, (4) el tracking no
lee ejecuciones reales. El modelo `Bloque/BloqueItem/SerieDef` sigue siendo
deuda cara (resolverla al diseñar el schema de Fase 2), pero **no bloquea**
el loop si la plantilla es N×reps y la serie ejecutada guarda peso/reps.
Auth y Biblioteca reducen el trabajo alrededor; no cierran el producto.

---

## 3. Diagnóstico técnico (sin suavizar)

> Reauditado 2026-08-27 — ver §2 y §12 para el detalle completo. Varios
> puntos de este diagnóstico (marcados **✅ resuelto**) ya no son ciertos;
> se dejan tachados/anotados en vez de borrarlos, para no perder el
> historial de qué se arregló y cuándo.

### Aciertos
1. Routing limpio con rutas públicas/privadas (✅ confirmado 2026-08-27, la
   regresión detectada en el mapeo de agosto-18 ya está corregida).
2. Separación correcta de stores Zustand por dominio (`useDataStore`,
   `useWorkoutStore`, `useCitasStore`, `useCommunitiesStore`).
3. Formularios con validación por paso ([src/utils/validators.ts](src/utils/validators.ts)).
4. Hook `useUnits` desacopla formateo.
5. UI consistente, accesible visualmente.
6. **Auth real y RBAC server-side** vía `gym-gateway` + Supabase Auth
   (agregado 2026-08-24 — ver §2/§13).

### Problemas serios

1. **Modelo de datos pobre** (`EjercicioRutina` sigue siendo `nombre, series, valor, unidad_id` + opcionales). Sin bloques/series estructuradas, sin %1RM, tempo, warmup vs working como conceptos de primera clase.
2. ~~Referencia por `nombre: string`~~ — **✅ resuelto en mock local (2026-09-09)**:
   `ejercicio_id` obligatorio en rutinas/planes; upsert al catálogo desde
   picker/presets/IA. Persistencia Supabase sigue en Fase 2.
3. **`series: number` escalar** imposibilita dropsets, piramidales, cluster sets, warmup vs working. **Sin cambios.**
4. ~~Campos zombie en wizard~~ — **✅ resuelto**: `useRoutineForm.ts` ya persiste `tipo`/`rest_between_sets`/`notes` correctamente según el nivel del formulario.
5. ~~Auth decorativo~~ — **✅ resuelto**: auth real vía `gym-gateway`, `loading` real con bootstrap/refresh de sesión.
6. **Sin roles en el frontend** → aunque ya existe RBAC real en el backend (`gym-gateway`), el frontend no lo usa para gating. Ya no hay `/admin/*` (se eliminó), pero tampoco hay gating por rol en `/library/*` ni en el resto.
7. **`UsuariosPage` / planes siguen en memoria** (`useUsuariosStore`, seed
   `usuarios.json`) → se pierde todo al recargar. La UI (sesiones, wizard,
   cumplimiento mock) va muy por delante del dato. `UserPlansPage.tsx` ya no
   es la página god: es un redirect.
8. **Workout store sin persistencia** → no hay historial, no hay progreso, no hay producto. **Sin cambios.**
9. **Páginas grandes:** el peso se movió a `UsuariosPage.tsx` y
   `AIRoutineChatPage.tsx`; el antiguo `RoutinePage.tsx` de 683 líneas ya no
   existe. Sigue habiendo margen para extraer componentes.
10. ~~Carpetas vacías (`components/common`, `admin/lists`)~~ — **✅ parcialmente resuelto**: `components/common/` ya no está vacía (10 primitivas en uso). `components/player/` y `components/workout/` **siguen vacías**. `admin/lists/` ya no existe (se eliminó `components/admin/` completo).
11. ~~Código muerto: `RoutineWizard.tsx`, `WizardProgress.tsx`, `UnitManager.tsx`, `ExercisePicker` duplicado~~ — **✅ resuelto**, ya no existen. `create-admin.js` en raíz **sigue presente**.
12. **Estilos mezclados** — **✅ resuelto (D8, 2026-08-24)**: Tailwind 4 + tokens `@theme` como sistema; queda inline styles puntual pero ya no es deuda arquitectónica abierta.
13. **Sin capa de datos servidor funcionando**: TanStack Query está cableado en código pero **no instalado** en `node_modules` (`npm install` pendiente en este entorno) — el problema hoy es de instalación, no de diseño.
14. **Sin validación runtime en `importData`**: sigue aceptando cualquier JSON con las claves correctas sin validar su forma. **Sin cambios** (Zod sí se usa en `gateway/schemas` y `exercisedb/schemas`, pero no aquí).
15. **Sin tests, sin error boundaries, sin Sentry, sin métricas.** **Sin cambios.**
16. **Nuevo: build roto por dependencias no instaladas** (`@tanstack/react-query`, `@dnd-kit/*`, `@daypicker/react` declaradas en `package.json`, ausentes de `node_modules`) — correr `npm install` antes de diagnosticar cualquier error de compilación como bug de código.
17. **Nuevo: módulo Comunidades es 100% mock**, sin persistencia, con su propio sistema de roles simulado desacoplado del RBAC real — no confundir ambos al trabajar sobre permisos.

---

## 4. Análisis profundo del módulo de rutinas

### Soporte actual vs requerido

> Nota 2026-09-09: `tipo`, `rest_between_sets` y `notes` **sí se persisten**
> en el guardado del formulario (`useRoutineForm.ts`) según el nivel. La
> tabla de abajo habla de **concepto de primera clase en ejecución** (player
> / sesiones), no de “el wizard los tira”. Para primera instancia no hace
> falta cubrir las 13 filas: basta ejercicio por ID + N×reps en plantilla +
> peso/reps por serie ejecutada. El resto se resuelve al diseñar el schema
> (§5), no como gate del loop.

| Capacidad | Hoy | Notas |
|---|---|---|
| Rutina estándar (N series × reps) | ✅ | Trivial — **esto sí es MVP** |
| Peso / reps por serie **ejecutada** | ✅ mock | `useSesionesStore` + `RegistrarSesionSheet`; player de biblioteca no escribe |
| Ejercicio por ID | ✅ mock | `EjercicioRutina.ejercicio_id` + migración en `useDataStore` — gateway pendiente |
| Superseries (A1+A2 alternando) | ⚠️ | Solo `grupo_superset` opcional; no hay bloque |
| Circuitos (rondas) | ❌ | No hay `rondas` ni `bloque` |
| Dropsets / piramidal / cluster | ❌ | `series: number` + `valor: number` asume homogeneidad |
| RPE por serie | ⚠️ | Campo opcional en formulario avanzado; no hay log de ejecución |
| %1RM | ❌ | No existe campo |
| Peso por serie (plantilla) | ❌ | No existe campo en la definición |
| Descanso entre series | ⚠️ | Se guarda en la rutina; el player no lo usa como timer |
| Tempo (3-1-1-0) | ❌ | No existe |
| EMOM / AMRAP / For Time | ⚠️ | `tipo` se guarda; el player no lo interpreta |
| Warmup vs working vs failure | ❌ | No hay tipo de serie |
| Notas por ejercicio | ⚠️ | En `EjercicioPersonalizado` del plan; no en `EjercicioRutina` |
| Progresión entre semanas | ⚠️ | El **plan** ya tiene `progresion: fijo \| incremental`; la rutina de biblioteca no |

**Veredicto:** el módulo actual sirve para un MVP de "listas de ejercicios", no para un SaaS fitness de programación avanzada. **Para primera instancia es suficiente como plantilla**, si la ejecución (PWA) guarda series reales. El rediseño `Bloque/BloqueItem/SerieDef` sigue siendo el momento natural del schema de Fase 2 — no del loop.

### Reutilización

> Nota 2026-08-27: el wizard monolítico y el `ExercisePicker` duplicado que
> mencionaba esta sección ya no existen (ver §10). El flujo actual es
> chooser de nivel + 3 formularios (`src/pages/library/routines/*RoutineForm.tsx`)
> + `src/hooks/useRoutineForm.ts` para el guardado — más modular que antes,
> pero construido sobre el mismo modelo plano que sigue pendiente de
> rediseñar aquí.

- `validators.ts`: reutilizable, sigue vigente.
- `useRoutineForm.ts`: centraliza el guardado (`toRutinaPayload`) de los 3
  formularios por nivel — es el punto único a tocar cuando se migre al
  modelo `Bloque/BloqueItem/SerieDef`.

---

## 5. Modelo de datos propuesto

### Nuevo esquema de Rutina (reemplaza el actual)

```ts
// src/types/routine.ts (propuesto)

interface Rutina {
  id: string;
  owner_id: string;             // trainer que la creó
  nombre: string;
  categoria: string;
  dificultad: 'Principiante' | 'Intermedio' | 'Avanzado';
  duracion_estimada_min: number;
  descripcion: string;
  bloques: Bloque[];
  creado_at: string;
  actualizado_at: string;
}

interface Bloque {
  id: string;
  tipo: 'normal' | 'superset' | 'circuit' | 'emom' | 'amrap' | 'fortime';
  orden: number;
  rondas?: number;              // para circuit / amrap
  duracion_seg?: number;        // para emom / amrap / fortime
  descanso_entre_rondas_seg?: number;
  items: BloqueItem[];          // 1 item = normal; 2+ = superset/circuit
  notas?: string;
}

interface BloqueItem {
  id: string;
  ejercicio_id: number;         // FK real, NO nombre
  orden: number;
  notas?: string;
  series: SerieDef[];           // NO un número escalar
  descanso_post_seg?: number;
}

interface SerieDef {
  id: string;
  tipo: 'warmup' | 'working' | 'dropset' | 'failure' | 'amrap';
  reps?: number;
  reps_min?: number;
  reps_max?: number;
  peso_kg?: number;
  porcentaje_1rm?: number;
  rpe_objetivo?: number;        // 1-10
  tempo?: string;               // "3-1-1-0"
  duracion_seg?: number;
  distancia_m?: number;
  unidad_id: number;
}
```

Este modelo soporta las 13 capacidades de la tabla.

**Para primera instancia no hay que implementar todo esto en UI.** Al diseñar
el schema de Supabase (Fase 2) sí conviene **dejar las tablas** `blocks` /
`block_items` / `set_defs` (o un equivalente que no fuerce otra migración),
aunque el creador de rutinas del MVP solo escriba un bloque `normal` con
series homogéneas. La **sesión ejecutada** (`sessions` + `session_sets`) es
el contrato que la PWA cliente necesita ya.

### Schema Postgres objetivo (Fase 2–5, no “Fase 3+”)

Tablas mínimas para MVP:
- `profiles` (id, email, role, full_name, avatar_url)
- `roles` (trainer / client / admin)
- `trainer_client_links` (trainer_id, client_id, status, invited_at)
- `exercises`
- `units`
- `routines`
- `blocks`
- `block_items`
- `set_defs`
- `plans`
- `plan_weeks`
- `plan_sessions` (plantilla de sesión del plan; ya no `plan_days` fijos a weekday — el modelo de UI es `SesionPlan`)
- `sessions` (ejecución real — la escribe la **PWA cliente**)
- `session_sets` (peso/reps/RPE reales por serie)
- `subscriptions` (Stripe — **después** de primera instancia)

**Todas con RLS activo desde el día 1.** La PWA cliente y la SPA entrenador
hablan **solo** con `gym-gateway`; ninguna instancia un cliente Supabase.

---

## 6. Arquitectura objetivo

```
┌──────────────────────────────────────────────┐
│  Supabase (source of truth)                  │
│  Postgres + RLS + Auth + Storage             │
└──────────────────────────────────────────────┘
                      ↑↓
┌──────────────────────────────────────────────┐
│  gym-gateway (FastAPI)                       │
│  Auth + PostgREST + RBAC + IA rutinas        │
└──────────────────────────────────────────────┘
           ↑                         ↑
┌──────────┴──────────┐   ┌──────────┴──────────┐
│ FitPro Entrenador   │   │ FitPro Cliente      │
│ SPA — este repo     │   │ PWA (fitpro-clients)│
│ TanStack Query      │   │ TanStack Query      │
│ Zustand (solo UI)   │   │ Zustand (player)    │
└─────────────────────┘   └─────────────────────┘
```

Reglas:
- **Dos frontends, un gateway, una base.** El rol `client` entra a la PWA; el rol `entrenador` (y plataforma) entra a esta SPA. No mezclar superficies.
- **Nada de datos de dominio en localStorage** una vez haya servidor.
- **Zod valida** todo lo que entra del exterior (form, import, respuestas server).
- **RLS es la primera barrera**, el gating en cada app es la segunda.
- **Edge Functions de Supabase** para webhooks y jobs ligeros. FastAPI solo si duele (hoy: `gym-gateway`).
- La PWA de primera instancia escribe `sessions` / `session_sets` y lee el plan asignado. No incluye Biblioteca, Comunidades ni billing.

---

## 7. Fases del producto

> **Actualizado 2026-08-27 (segunda pasada, mismo día):** por decisión
> explícita del usuario se **elimina la Fase 2.5** (rediseño del modelo,
> como fase bloqueante formal) y la **Fase 6** (Monetización) del roadmap
> numerado, y se **agrega Comunidades** como fase propia en el slot 6. El
> problema técnico que documentaba la Fase 2.5 (modelo plano,
> `nombre: string` en vez de `ejercicio_id`) **sigue existiendo en el
> código** — no se resolvió, solo dejó de trackearse como fase separada;
> queda documentado como deuda técnica en §3/§4/§8/§9. Monetización queda
> fuera del roadmap por ahora (no descartada para siempre, solo
> despriorizada); ver ADR 2026-08-27 en §13.
>
> **Actualizado 2026-08-27 (tercera pasada, mismo día):** la Fase 2 cambia
> de objetivo — deja de apuntar a CRUD local (`localStorage`) como destino
> final y pasa a apuntar a **Supabase** (vía `gym-gateway`, mismo patrón que
> la auth de Fase 3) para rutinas/ejercicios/unidades. Es un cambio de
> **plan**, no de código: hoy `useDataStore` sigue funcionando 100% sobre
> `localStorage`, nada de esto está implementado todavía. Ver detalle en
> Fase 2 y ADR 2026-08-27 en §13.
>
> **Actualizado 2026-09-09:** encima del roadmap numerado hay un **gate de
> producto** (primera instancia, §1). Las fases 6–7 y la monetización no
> avanzan hasta que el loop cierre. La app cliente pasa a ser una **PWA
> React aparte** (no un modo de esta SPA). El modelo `Bloque/…` deja de
> ser gate del MVP de ejecución; sí se resuelve al diseñar el schema.

### Primera instancia (gate de producto)

El loop de §1 tiene que cerrar **antes** de invertir en Comunidades,
billing, dashboards de plataforma o nativo. Mapeo a fases técnicas:

| Paso del loop | Fase | Dónde | Estado |
|---|---|---|---|
| Crear / reutilizar rutina | 2 | SPA entrenador | UI lista; persistencia Supabase 0% |
| Invitar cliente + plan | 5 | SPA entrenador | UI de sesiones avanzada; dato mock |
| Ejecutar sesión | 4 | **PWA cliente** (por crear) | Player prototipo en esta SPA; no escribe |
| Ver cumplimiento | 4 | SPA entrenador | `/tracking` y CompliancePanel leen seed |

Criterio de “primera instancia lista”: las cuatro filas en verde, con
datos reales. Hasta entonces, **no ampliar** UI de Fase 6 ni billing.

### Fase 1 — Base del sistema `✅ ~95%`
**Objetivo:** UI funcional, routing, theming, layout.
- Hecho: routing, ThemeContext, Navbar, tokens UI, Login/Register visual.
- Falta: ErrorBoundary global, accesibilidad básica, Sentry.
- Complejidad: **baja**.

### Fase 2 — CRUD vía Supabase + Biblioteca `🟡 ~80% UI / 0% persistencia real`
**Objetivo:** gestión de rutinas/ejercicios/unidades **respaldada en Supabase**
(vía `gym-gateway`, mismo patrón que la auth de Fase 3), no en `localStorage`.
**Cambio de dirección (2026-08-27):** esta fase ya no apunta a CRUD local
como destino final — `useDataStore` (con `zustand/persist` sobre
`localStorage`) pasa a ser un estado de transición a reemplazar, no el
modelo objetivo.
- Hecho (UI/local): `useDataStore`, import/export, ExercisePicker;
  **persistencia de `tipo`/`rest_between_sets`/`notes` ya corregida**
  (`useRoutineForm.ts`, ver §2); Biblioteca completa (hub, catálogos
  ExerciseDB, 3 formularios por nivel, galería de ~20 presets, chat IA
  funcional). Todo esto sigue funcionando hoy sobre `localStorage`.
- **Falta (lo nuevo, 0% iniciado):** diseñar el schema real en Supabase para
  `rutinas`/`ejercicios`/`unidades` (tablas + RLS, ver §5/§6); exponer esas
  tablas vía `gym-gateway` (mismo patrón que auth — proxy a PostgREST, no
  cliente Supabase directo en el frontend); migrar `useDataStore` de
  `zustand/persist` a hooks TanStack Query (`useRutinas`, `useEjercicios`,
  `useUnidades`) que llamen a `gym-gateway`; migrar Biblioteca/formularios
  para leer y escribir contra esos hooks en vez de la store local; decidir
  qué pasa con los datos ya guardados en `localStorage` de usuarios
  existentes (¿migración one-shot al primer login con Supabase?).
- Falta (aparte, sin cambios): validar `importData` con Zod, extraer
  `UsuariosPage.tsx` / `AIRoutineChatPage.tsx` si siguen creciendo,
  registrar o eliminar la ruta huérfana `/library/unidades`, decidir sobre
  `LibraryDatosPage.tsx`/`LibraryMisEjerciciosPage.tsx`.
- **Deuda técnica sin fase propia (ex-Fase 2.5):** el modelo de datos sigue
  plano (`EjercicioRutina` sin bloques/series estructuradas, ejercicios
  referenciados por `nombre: string` en vez de `ejercicio_id`). **Al diseñar
  el schema**, dejar `Rutina → Bloque[] → BloqueItem[] → SerieDef[]` (ver §5)
  aunque la UI del MVP solo escriba un bloque `normal` N×reps. Primera
  instancia **sí** exige `ejercicio_id` (no nombre) y tablas de
  `plans` / `plan_sessions` / `sessions` / `session_sets` en el mismo diseño
  — no solo Biblioteca.
- Complejidad: **alta** (subió de baja-media: ya no es solo UI/CRUD local,
  incluye diseño de schema + RLS + migración de stores + Biblioteca
  completa apuntando a servidor).
- **Riesgo:** migrar a Supabase con el modelo plano tal cual, sin resolver
  la deuda de arriba, es la forma más cara de tirar el trabajo — doble
  migración garantizada si se apura.

### Fase 3 — Supabase + Auth real `🟡 ~35%`
**Objetivo:** eliminar mocks, datos en servidor, auth con roles.
- **Hecho (2026-08-24):** auth real de extremo a extremo vía **`gym-gateway`**
  (backend FastAPI hermano) → Supabase Auth (JWT ES256 + JWKS), con
  `AuthContext` haciendo `login`/`signup`/`logout`/`refresh` reales, sesión
  persistida con expiración y refresh automático. RBAC server-side
  (`require_role`/`require_admin`) ya implementado en `gym-gateway`.
- **Decisión arquitectónica ya tomada (no documentada hasta ahora):**
  Supabase se habla **solo desde `gym-gateway`**, nunca directo desde el
  frontend. `src/lib/supabase.ts` se mantiene comentado a propósito — no es
  deuda, es la arquitectura elegida. Ver ADR 2026-08-24 en §13.
- Falta: `npm install` para dejar `@tanstack/react-query` funcional (ya está
  cableado en código, solo no instalado); migrar `useCitasStore` (citas del
  calendario) a hooks server-side vía `gym-gateway` — la migración de
  `useDataStore` (rutinas/ejercicios/unidades) se absorbió dentro de la
  **Fase 2** (ver ahí, es el mismo patrón técnico pero es dominio de
  Biblioteca, no de auth); gating por rol en el frontend usando
  `AuthUser.role`; confirmar que las migraciones SQL de `gym-gateway`
  (schema `users.profiles`, políticas RLS) estén versionadas en ese repo
  (hoy solo están documentadas en su README, el directorio `sql/` no existe
  en el checkout).
- Complejidad: **alta** (lo que falta es más migración de stores que
  integración desde cero).
- **Riesgo:** RLS mal configurado = fuga de datos; verificar el estado real
  de las políticas en el proyecto Supabase, no asumirlas por el README de
  `gym-gateway`.

### Fase 4 — Tracking real de sesiones `🔴 ~10%`
**Objetivo:** historial de entrenos (core del valor SaaS). **La ejecución vive
en la PWA cliente**; el entrenador **lee** el historial en esta SPA.
- Tablas `sessions` + `session_sets`.
- La PWA escribe al servidor al completar serie / terminar workout. El
  `useWorkoutStore` de este repo es solo prototipo hasta que exista la PWA.
- Pantalla de historial del entrenador (`/tracking`) alimentada por esas
  sesiones — hoy lee `sesiones.json`.
- Primera instancia: peso + reps por serie. Volumen / 1RM estimado (Epley)
  y rest timer pueden llegar en el mismo ciclo si salen baratos; no bloquean
  el “sesión guardada”.
- Complejidad: **media-alta**.
- **Sin esto no hay producto.**

### Fase 5 — Multi-tenant (entrenador ↔ cliente) `🔴 ~5-10%`
**Objetivo:** asignación de rutinas/planes a cuentas reales, y **nacer la PWA
cliente**.
- **Avanzó en UI, no en datos:** `/usuarios` (`UsuariosPage`) tiene
  sesiones/semana/mes/total, wizard, drag&drop (`@dnd-kit`) — la parte más
  sofisticada visualmente del repo — sobre `useUsuariosStore` (seed, sin
  persist). Brecha UI-vs-dato más grande del proyecto. El modelo de plan ya
  es por **sesión** (`SesionPlan`), no por weekday.
- Tabla `trainer_client_links` + flujo de invitación (magic link / email).
- Persistencia real: `plans`, `plan_weeks`, `plan_sessions`.
- Gating: rol `entrenador` → esta SPA; rol `client` → PWA. El RBAC de
  `gym-gateway` ya existe; falta usarlo y crear la app cliente.
- **PWA cliente (React, repo hermano, por crear):** entreno de hoy, player
  que escribe sesiones, historial propio. No es un modo de esta SPA (D11).
- Realtime opcional (entrenador ve sesión en vivo): **después** de primera
  instancia.
- Complejidad: **alta**.
- **Riesgo:** RLS con joins complejo; duplicar el player en dos repos si no
  se extrae un contrato claro de `session_sets`.

### Fase 6 — Comunidades `🟡 UI ~100% mock / 0% backend`
**Objetivo:** feature social por comunidad (posts, eventos, discusiones,
miembros, moderación) para retención y engagement.
- **Fuera de primera instancia.** No ampliar UI mock. El prototipo (22
  pantallas / ~20 modales, 2026-08-27) se conserva como referencia, no como
  trabajo activo.
- **Hecho (2026-08-27):** UI completa como prototipo navegable sobre
  `useCommunitiesStore` (Zustand, sin `persist`) y fixtures JSON. Rol de
  comunidad simulado (`useCommunityPermissions`), desacoplado del RBAC real.
- **Falta todo el backend** (cuando se retome, no ahora): esquema en
  Supabase; decidir si pasa por `gym-gateway`; migrar el store; resolver si
  el rol de comunidad se relaciona con `AuthUser.role`.
- Complejidad: **alta**.
- **Riesgo:** seguir pintando Comunidades antes de cerrar el loop duplicaría
  trabajo, igual que pasó con el modelo de rutinas.

### Fase 7 — Analytics + IA + móvil `🔴 0% (excepto IA, adelantada)`
**Objetivo:** retención y diferenciación **después** de primera instancia.
- **IA de generación de rutinas ya funciona end-to-end**, fuera de orden:
  chat en `/library/ia` → `fitpro_api` + DeepSeek → ExerciseDB → guardado.
  No bloquea el loop; no ampliar el chat como si fuera el producto.
- Dashboards de progreso reales (volumen, PRs, adherencia) — sustituyen el
  dashboard mock de `/`.
- Coach LLM para ajustar rutinas.
- **Offline-first** de la PWA cliente (service worker, cola de series). La
  PWA en sí **no es Fase 7**: nacer instalable y online es Fase 5 / primera
  instancia.
- App nativa (Capacitor/Expo) — opcional, después de que la PWA valga.
- Complejidad: **alta**.

---

### Fuera del roadmap (por ahora)

- **Monetización (ex-Fase 6):** Stripe Checkout + Customer Portal, webhook →
  `subscriptions`, planes Free/Pro/Gym, feature gating. Despriorizada
  el 2026-08-27 y **reafirmada fuera de primera instancia** el 2026-09-09.
  Hay UI mock de suscripciones/pagos en Biblioteca (`useBillingStore`): no
  ampliarla; no confundirla con Stripe real. Retomar cuando un entrenador
  tenga clientes reales que justifiquen cobrar.
- **Comunidades (Fase 6):** numerada, pero **congelada** hasta que el loop
  cierre. Ver arriba.

---

## 8. Riesgos críticos

> Actualizado 2026-08-27: #2, #4 y #7 (parcial) ya no aplican como estaban
> escritos — se dejan anotados en vez de renumerar todo el historial.
> Actualizado 2026-09-09: #1 se matiza (el modelo plano no es gate del loop);
> #4 ahora incluye “no hay PWA cliente”; #8 corrige la página god.

1. **Migrar a Supabase el modelo plano tal cual** (`EjercicioRutina` por `nombre`) → doble migración. **Vigente como deuda de schema**, no como bloqueante del loop: el MVP de ejecución es N×reps + series guardadas. Al diseñar tablas, dejar `blocks`/`set_defs` (o equivalente) aunque la UI del MVP no los exponga.
2. ~~Campos zombie en wizard~~ — **✅ resuelto**, ver §2/§3.
3. **Sin persistencia de sesiones de entrenamiento** → sin producto. **Vigente.** La PWA cliente es quien debe escribirlas.
4. **Sin app cliente y sin gating por rol.** El backend ya distingue roles; esta SPA no. El riesgo ya no es “cualquiera entra a Admin”: es “el cliente no tiene dónde entrenar” y “todo el mundo ve el cockpit del entrenador”.
5. **`importData` sin validación Zod** → vector de corrupción. **Vigente**, aunque Zod ya está en uso en `gateway/schemas` y `exercisedb/schemas`.
6. **Ejercicios referenciados por `nombre`** → renombre rompe rutinas. **Vigente** — sí entra en primera instancia (integridad).
7. ~~Mezcla de estilos~~ — **✅ resuelto (D8)**. Queda inline puntual, ya no es riesgo arquitectónico.
8. **Archivos grandes:** el peso está en `UsuariosPage.tsx` y `AIRoutineChatPage.tsx`. `UserPlansPage.tsx` es un redirect.
9. **Sin ErrorBoundary, sin Sentry, sin métricas.** **Vigente.**
10. **React 19 / Vite 8** muy recientes → 3 dependencias declaradas pero no instaladas en este entorno, y Node local (v18.19.1) por debajo del mínimo de Vite 8 — **riesgo operativo confirmado**.
11. **`gym-gateway` sin tests y con migraciones SQL no versionadas** (solo documentadas en su README) → no se puede verificar RLS/roles en Supabase desde el código.
12. **Dos sistemas de roles** (`AuthUser.role` vs rol mock de Comunidades) → no mezclarlos. La PWA cliente usa `AuthUser.role === client`, no el mock de comunidades.
13. **Nuevo: seguir ampliando Comunidades / billing mock** mientras el loop no cierra → más superficie que rehacer. Congelados en §7.

---

## 9. Decisiones técnicas fijadas

| # | Decisión | Razón |
|---|---|---|
| D1 | Supabase puro al inicio; FastAPI solo cuando duela — **un solo FastAPI**: `gym-gateway` (auth, dominio, IA). `gym-mcp` / `fitpro_api` están absorbidos. El frontend nunca habla Supabase directo | Auth/roles reales sin exponer keys; IA vive en la misma puerta |
| D2 | TanStack Query para datos servidor | Cache, sync, optimistic updates sin `useEffect` manuales — **cableado en código, pendiente `npm install` en este entorno (ver §2/§3)** |
| D3 | Zustand SOLO para UI efímera | Nada de datos de dominio persistidos |
| D4 | Zod para validación runtime | Una fuente de verdad tipos + validación |
| D5 | RLS obligatorio desde día 1 | Primera barrera; client-side gating es secundaria |
| D6 | Ejercicios referenciados por ID, no nombre | Integridad referencial |
| D7 | Modelo `Bloque → BloqueItem → SerieDef` | Soporta 100% de patrones de entrenamiento modernos |
| D8 | Unificar estilos: **Tailwind 4 + tokens `@theme`**; migración oportunista de inline styles | Decidido 2026-08-24 — ver §13 |
| D9 | Tests con Vitest + @testing-library/react | Validators y stores primero |
| D10 | Observabilidad desde prod-day-1: Sentry + PostHog | No subir nada a prod sin esto |
| D11 | **App cliente = PWA React independiente** (repo hermano, mismo `gym-gateway`), no un rol/pestaña dentro de esta SPA | El loop de §1 exige una superficie de ejecución; mezclarla en el cockpit del entrenador ensucia ambas UX. PWA (instalable) cubre el gym con red floja a nivel de “app en el teléfono”; offline-first profundo queda en Fase 7 |

---

## 10. Limpieza inmediata pendiente

> Reauditado 2026-08-27. Varios ítems de esta lista **ya se limpiaron** — no
> repetir la limpieza, solo confirmar contra esta versión antes de asumir
> que algo sigue muerto.

**Ya limpiado (no hace falta tocar de nuevo):**
- `RoutineWizard.tsx`, `WizardProgress.tsx`, `UnitManager.tsx` — **ya no
  existen** en el repo.
- `src/components/admin/` completo (incluida `admin/lists/`) — **ya no
  existe**; el CRUD vive ahora en `src/pages/library/*`.
- `src/components/common/` — **ya no está vacía**: contiene 10 primitivas
  reales en uso (`Sheet`, `Skeleton`, `Toast`, `Avatar`, `EmptyState`,
  `ErrorState`, `ActionMenu`, `ConfirmDialog`, `MediaViewer`, `Fab`). Sacarla
  de cualquier lista de "código muerto".
- `ExercisePicker` duplicado — ya no aplica (el flujo viejo con `RoutinePage.tsx` desapareció).

**Sigue pendiente:**
- `create-admin.js` en raíz — sigue presente, sigue sin usarse desde `src/`.
  Candidato firme a borrar.
- Carpetas vacías: `src/components/player/`, `src/components/workout/`
  (0 archivos cada una).
- `src/pages/library/LibraryDatosPage.tsx` y
  `src/pages/library/LibraryMisEjerciciosPage.tsx` — no están enrutadas en
  `App.tsx` ni referenciadas desde ningún otro archivo. Confirmar que
  ninguna otra rama de la app las importe antes de borrarlas.
- `ROUTES.library.unidades` (`paths.ts`) — ruta definida y referenciada por
  redirects legacy, pero sin `<Route>` real en `App.tsx`. Decidir: crear la
  página de gestión de unidades, o eliminar la constante y sus redirects.
- 3 dependencias sin instalar en este entorno (`@tanstack/react-query`,
  `@dnd-kit/*`, `@daypicker/react`) — no es código muerto, pero bloquea el
  build; correr `npm install` antes de tocar cualquier código que dependa de
  ellas.

---

## 11. Backlog vivo

### Siguiente tarea crítica

**Cerrar primera instancia (§1), no ampliar módulos.** Orden:

1. Contrato de datos del loop (schema mínimo vía `gym-gateway`): rutinas
   (aunque el creador siga simple), `trainer_client_links`, `plans` /
   `plan_sessions`, `sessions` / `session_sets`. Ejercicio por ID. Al
   diseñar tablas de rutina, dejar sitio a `Bloque/SerieDef` para no migrar
   dos veces — la UI del MVP no tiene que exponerlo.
2. Persistencia del plan en la SPA entrenador (salir de `usuarios.json`).
3. Crear la **PWA cliente** (React, repo hermano): login, entreno de hoy,
   player que escribe series, historial propio.
4. Gating: `entrenador` → esta SPA; `client` → PWA.
5. `/tracking` y cumplimiento leen sesiones reales.

No es siguiente: Comunidades, billing, dashboards de plataforma, nativo,
offline-first, modelo avanzado en el creador de rutinas.

### Completado desde la última revisión (tachado, no repetir)

1. ~~Corregir pérdida de datos en el guardado de rutinas (`tipo`,
   `rest_between_sets`, `notes`)~~ — corregido en `useRoutineForm.ts` (§2).
2. ~~Descomentar y cablear auth real~~ — hecho vía `gym-gateway` (2026-08-24),
   con una arquitectura distinta a la planeada originalmente: el frontend no
   habla Supabase directo, habla con `gym-gateway` (ver ADR §13).
3. ~~Schema Postgres + RLS + roles~~ — implementado del lado de
   `gym-gateway` (RBAC server-side funcional); **pendiente confirmar** que
   las migraciones SQL estén versionadas ahí (hoy solo documentadas).
4. ~~Extraer el wizard monolítico~~ — reemplazado por chooser + 3
   formularios por nivel + galería de presets.
5. ~~Limpieza de código muerto (parcial)~~ — `RoutineWizard.tsx`,
   `WizardProgress.tsx`, `UnitManager.tsx`, `components/admin/` ya no
   existen. Queda lo detallado en §10.

### TODOs ordenados por prioridad (vigentes)

**Primera instancia (hacer, en este orden):**

1. `npm install` para dejar `@tanstack/react-query`, `@dnd-kit/*` y
   `@daypicker/react` instalados — el build falla hoy sin esto (operativo,
   no de producto).
2. Schema Supabase mínimo del loop + RLS, expuesto por `gym-gateway`:
   `exercises` (ID real), `routines` (plantilla simple OK), `trainer_client_links`,
   `plans` / `plan_weeks` / `plan_sessions`, `sessions` / `session_sets`.
   Dejar tablas `blocks` / `block_items` / `set_defs` (o equivalente) en el
   diseño aunque el creador MVP no las use.
3. Migrar `useDataStore` y `useUsuariosStore` a TanStack Query contra el
   gateway — rutinas y planes dejan `localStorage` / seed.
4. Crear repo de **FitPro Cliente** (PWA React): auth vía gateway, “entreno
   de hoy”, player que persiste series, historial. Misma identidad visual
   (`DESIGN.md`).
5. Gating por rol: entrenador → esta SPA; `client` → PWA. No reinventar
   roles; usar `AuthUser.role` + RBAC de `gym-gateway`.
6. `/tracking` + cumplimiento leen `sessions`, no `sesiones.json`. El player
   de este repo deja de ser la fuente de verdad de ejecución.

**Después del loop (no ahora):**

7. Migrar `useCitasStore` (calendario) a servidor + `updateCita`.
8. Creador de rutinas sobre `Bloque/BloqueItem/SerieDef` (UI), Zod en
   `importData` y formularios.
9. Backend de Comunidades (Fase 6 congelada) — esquema, gateway, relación
   de roles.
10. Limpieza de código muerto (§10): `create-admin.js`, carpetas
    `player/`/`workout/` vacías, páginas huérfanas, ruta `/library/unidades`.
11. Monetización Stripe — cuando haya clientes reales que entrenen.

`npm install` sigue primero porque sin eso no se puede verificar el resto.

---

## 12. Contexto adicional (se va agregando)

> **Esta sección es para ir añadiendo información conforme aparezca**:
> decisiones de negocio, feedback de usuarios, snippets de conversaciones,
> brief de diseño, integraciones externas, credenciales (referencias, nunca valores),
> benchmarks de competencia, etc.
>
> Estructura sugerida: agregar bloques con fecha y encabezado.

### 2026-09-21 — Alta de cliente sin picker propio de plantillas

El alta de cliente duplicaba la asignación de plantilla: `CreatePlanWizard`
tenía su propia lista de «rutina base» + checkbox «aplicar a todas», con menos
información que la pestaña Entrenamientos (sin cumplimiento, sin carga
planificada, sin estado de sincronización, sin editor de sesión). Se unifica en
una sola pantalla:

- `CreatePlanWizard` queda en **2 pasos** — cliente y plan (nombre, descripción,
  duración, frecuencia). Crea el plan con las semanas y los huecos de sesión
  vacíos; `modo` arranca en `sesiones_variables` y `progresion` en `fijo`.
- Al crear, `UsuariosPage` navega a `ROUTES.usuarioEntrenamientos(id)`
  (`/usuarios/:id?tab=entrenamientos`): la asignación usa `RutinaPickerSheet`
  (con alcance «solo esta semana» / «hasta el final») y `SesionEditorSheet`,
  los mismos de la edición.
- `UserPlanWorkspace` muestra un bloque de arranque mientras la semana 1 no
  tenga sesiones configuradas, con «Asignar plantilla» (abre el picker en el
  primer entrenamiento pendiente) y «Crear plan guiado».

Sigue siendo mock local (`useUsuariosStore` sin persist); el cliente nuevo no
tiene `client_uuid`, así que no hay escritura en el gateway hasta Fase 2/3.

### 2026-09-21 — Alta de cliente con rutina IA (gym-gateway)

Al registrar un cliente el entrenador puede describir qué quiere entrenar
(objetivo corto + textarea) y, con el toggle «Crear rutina automáticamente
con IA» (activo por defecto), FitPro llama a gym-gateway (`VITE_GATEWAY_URL` →
`POST /api/ai/routine`), resuelve el catálogo y envía los ejercicios en
`POST /api/trainers/clients/invite`. Si la IA falla no se invita: se puede
desactivar el toggle y crear el plan vacío. La plantilla se intenta guardar
también en Biblioteca, pero eso no bloquea el alta. **`gym-mcp` ya no se
levanta:** la IA quedó en gym-gateway.

### 2026-09-09 — Primera instancia + PWA cliente

Se recorta la visión a **qué / para qué / cómo** (loop entrenador → cliente
ejecuta → entrenador ve datos). Criterio de MVP: dos apps, clientes reales,
player que escribe, tracking real. Ver §1.

Decisiones:
- **App cliente = PWA React aparte** (mismo stack, mismo `gym-gateway`), no
  un modo de esta SPA. Repo hermano aún no creado. Offline-first profundo
  sigue en Fase 7; nacer instalable y online es primera instancia (D11).
- Comunidades, billing mock, dashboards de plataforma, IA y catálogos
  **no son primera instancia**. Fase 6 congelada; no ampliar esa UI.
- El modelo `Bloque/BloqueItem/SerieDef` no bloquea el loop: el MVP de
  plantilla es N×reps + ejercicio por ID; las series ejecutadas sí tienen
  que guardar peso/reps. El schema de Fase 2 debe dejar sitio a bloques
  para no migrar dos veces.

Huecos que cierran el producto: PWA inexistente; `useUsuariosStore` sin
persist; player de biblioteca sin escritura; **tracking y sesiones ejecutadas
sí tienen mock con series reales** (`useSesionesStore`, 2026-09-09) — gateway
pendiente.

### 2026-09-09 — Asistente guiado para plan del cliente (mock local)

Wizard de **6 pasos** en la pestaña Entrenamientos de un cliente existente
(`GuidedPlanWizard` desde `UserPlanWorkspace`):

1. Objetivo (nombre, duración, fecha; cliente prellenado)
2. Ritmo + descanso mínimo entre sesiones (0–2 días; cadencia sugerida orientativa)
3. Estructura (`repetitiva` \| `sesiones_variables`)
4. Sesiones (rutina de biblioteca o personalizada vía `RutinaPickerSheet` /
   `SesionEditorSheet` en draft — sin escribir hasta confirmar)
5. Progresión global (`fijo` \| `incremental` con +kg/+reps cada N semanas y preview)
6. Revisar y guardar (`replacePlan` atómico)

Modelo extendido: `PlanUsuario.descanso_min_dias`, `regla_progresion_global`,
`EjercicioPersonalizado.peso_objetivo_kg`. Utilidades en `guidedPlanUtils.ts`.
**Mock local** — no Supabase/gateway. Adaptación automática por rendimiento
real queda para cuando existan `session_sets` en backend.

### 2026-09-09 — Modelo mínimo ID + series ejecutadas (mock local)

Implementado en el cockpit del entrenador (sin Supabase/gateway):

- **`EjercicioRutina.ejercicio_id`** obligatorio; `ensureLocalExercise` al
  elegir ejercicios (picker, presets, chat IA); migración al cargar
  `fitpro-data`.
- **`SesionEntrenamiento.ejercicios[]`** con `SerieEjecutada` (reps +
  `peso_kg`); seed enriquecido en runtime desde rutinas; store mock con
  `persist` (`fitpro-sesiones`).
- **`RegistrarSesionSheet`** desde `/tracking` y ficha de cliente; detalle en
  `/tracking/:sesionId`. Player de biblioteca sigue sin escribir historial.
- **`Demo · mock`** visible en tracking/registro. Sustituir por
  `sessions`/`session_sets` vía gateway en Fase 4.

### 2026-09-07 — Módulo Suscripciones y Pagos (UI mock)

Nuevo módulo **Suscripciones y Pagos** dentro de la sección Biblioteca
(`/library/suscripciones`, `/library/pagos` + detalle de cada uno). Patrón
idéntico a Comunidades: Zustand **sin `persist`**, fixtures JSON en
`src/data/billing/`, store `useBillingStore`, tipos en `src/types/billing.ts`.
Cubre listado + detalle de suscripciones (tabs por estado, acciones demo:
activar/suspender/renovar/cancelar/cambiar plan/simular webhook de pago) y
listado + detalle de pagos. **Sin backend, sin Stripe, sin persistencia** —
los datos se pierden al recargar. Nombres de clientes tomados de
`usuarios.json` (Carlos Martínez, Ana López, Miguel Sánchez). Entrada en
`LibrarySubNav` (Suscripciones + Pagos). Fuera de alcance en esta pasada:
dashboard KPIs, CRUD de planes, auditoría/webhooks dedicados.
**2026-09-09:** este módulo queda **fuera de primera instancia** — no
ampliar; no confundir con monetización real.

### 2026-08-31 — Medidas corporales con anatomy (UI mock local)

Nueva pestaña **Medidas** en `/usuarios/:id?tab=medidas`: peso (kg) + circunferencias
(cm) por sitio anatómico (cuello, pecho, brazo, etc.), mapa táctil reutilizando
`AnatomyViewport` con highlight por sitio registrado. Persistencia en
`useMedidasStore` (`localStorage`, clave `fitpro-medidas`). Sin backend Supabase;
independiente de citas `tipo: medidas` del calendario (solo scheduling).

### 2026-04-16 — Entradas iniciales

_(vacío — agrega aquí contexto nuevo a medida que aparezca)_

### 2026-08-18 — Mapeo general de la app vs fases (ver HISTORIAL.md)

Se hizo un mapeo puntual del código real (commit `b005893`) contra las fases
de este documento. Detalle completo en [HISTORIAL.md](./HISTORIAL.md#2026-08-18--mapeo-1).
Resumen:
- Fase 2.5 (modelo de datos) sigue en 0%, pero la superficie que escribe
  contra el modelo viejo (`EjercicioRutina` plano) creció mucho: Biblioteca,
  3 formularios de rutina por nivel, chat IA, galería de presets. Cada
  feature nueva sobre el modelo plano encarece la migración pendiente.
- **Hallazgo a confirmar:** en `src/App.tsx`, todas las rutas (incluido
  `/admin/*`, `/library/*`, `/player`) están envueltas en `PublicRoute` en
  vez de `ProtectedRoute` — si no es intencional, un usuario autenticado no
  puede acceder a esas rutas (rebote a `/`). Revisar antes de seguir
  agregando features ahí.
- `scripts/init.sql` (Postgres para `exercises` de `fitpro_api`) no equivale
  a integración de Supabase; Fase 3 sigue en 0%.
- RBAC mencionado en el mensaje del commit `b005893` no tiene implementación
  encontrada en `src/`.

### 2026-08-27 — Auditoría completa post-módulo Comunidades (ver HISTORIAL.md#2026-08-27)

Revisión exhaustiva del código real (3 agentes en paralelo: auth/gateway,
rutas/modelo de datos, tooling/deps) para actualizar esta planeación tras
implementar el módulo Comunidades. Mapeo completo en
[HISTORIAL.md](./HISTORIAL.md#2026-08-27--mapeo-2). Hallazgos principales
(varios contradicen directamente entradas anteriores de este documento):

1. **El hallazgo #1 del mapeo 2026-08-18 (routing roto, todo en
   `PublicRoute`) está corregido.** `App.tsx` usa `ProtectedRoute` /
   `PublicRoute` correctamente hoy.
2. **La auth mock desapareció** (commit `4c90aad`, 2026-08-24, "login
   funcional desde correo con acceso al api"). Hoy es un flujo real:
   `AuthContext` → `src/lib/gateway/` → backend **`gym-gateway`** (FastAPI,
   repo hermano nuevo, no documentado hasta ahora) → **Supabase Auth** (JWT
   ES256 + JWKS). Esto es una arquitectura distinta a la planeada en §6/§9
   originalmente (Supabase directo desde el frontend); ver ADR nueva en §13.
3. **RBAC real existe, pero solo server-side.** `gym-gateway` tiene
   `require_role`/`require_admin` funcionando contra `users.profiles` en
   Supabase. El frontend no lo usa para gating — sigue siendo terreno
   pendiente, pero ya no hace falta construir el backend de roles desde
   cero, solo conectarlo.
4. **`gym-gateway` no tiene tests** y sus migraciones SQL (`sql/001_...`,
   `sql/002_...` mencionadas en su README) **no están versionadas en el
   repo** — solo documentadas. No se puede verificar el estado real de RLS
   sin acceso al proyecto Supabase.
5. **Rutas `/admin/*` ya no existen** (commits `298ff26` y `604cd38`,
   2026-08-24, "elimina las pantallas de Admin que no se estaban usando").
   Toda mención a `/admin/rutina`, `/admin/planes` como rutas activas en
   revisiones previas de este documento está obsoleta — hoy son solo
   redirects legacy hacia `/library/*`.
6. **El bug de pérdida de datos del wizard está corregido** — ver §2. No
   repetirlo como hallazgo en futuras auditorías sin volver a verificar.
7. **Build roto por dependencias no instaladas**, no por código: `npm ls`
   confirma que `@tanstack/react-query`, `@dnd-kit/core`, `@dnd-kit/sortable`,
   `@dnd-kit/utilities` y `@daypicker/react` están en `package.json` pero
   ausentes de `node_modules`. El código que las usa está bien escrito.
8. **Desalineación de Node.js**: el entorno de desarrollo tiene Node
   v18.19.1; `Dockerfile` usa `node:20-alpine`; Vite 8 pide Node ≥20.19 o
   ≥22.12. Puede causar fallos de `vite`/`tsc -b` en local no relacionados
   con el código.
9. **Ruta huérfana** `ROUTES.library.unidades` (definida en `paths.ts`,
   referenciada por redirects legacy, sin `<Route>` real en `App.tsx`).
10. **Páginas huérfanas** `LibraryDatosPage.tsx` y
    `LibraryMisEjerciciosPage.tsx` — no enrutadas, candidatas a limpieza
    (confirmar antes de borrar).
11. **Módulo Comunidades implementado completo** (2026-08-27, commit
    `a300e00`) como UI pura mock — 22 pantallas / ~20 modales sobre
    `useCommunitiesStore` sin `persist`. No conectado a Supabase,
    `gym-gateway` ni al auth/RBAC real. Tiene su propio sistema de roles
    simulado (`useCommunityPermissions`), deliberadamente desacoplado.
    **Actualización misma tarde:** a petición del usuario pasó a ser la
    **Fase 6** del roadmap numerado (ver §7), reemplazando a Monetización.
12. **`useCitasStore` (calendario) y `useDataStore` están inconsistentes**:
    el primero no persiste y carece de `updateCita`; el segundo sí persiste
    con `zustand/persist`. La UI de `CalendarPage.tsx` (304 líneas, rica en
    funcionalidad) va muy por delante de su store.

**Conclusión:** el diagnóstico "25-30% del MVP real" de abril 2026 ya no es
preciso — subió sobre todo por Fase 3 (auth real + RBAC backend), pero los
tres bloqueantes de fondo (modelo de datos, historial de sesiones,
multi-tenant con datos reales) siguen intactos. Próxima auditoría: agregar
entrada nueva en `HISTORIAL.md`, no reemplazar esta.

### 2026-08-27 (tarde) — Reestructuración del roadmap a pedido del usuario

El usuario pidió explícitamente: eliminar la Fase 2.5 y la Fase 6 del
roadmap, y agregar Comunidades como fase. Cambios aplicados (detalle en §7
y ADR en §13):
- **Fase 2.5 eliminada** como fase numerada/bloqueante. El problema que
  documentaba (modelo de rutinas plano, `nombre` en vez de `ejercicio_id`)
  **sigue existiendo en el código** — no se resolvió nada, solo se dejó de
  trackear como gate formal. Pasa a vivir como deuda técnica dentro de la
  Fase 2 y en §3/§4/§9.
- **Fase 6 (Monetización) eliminada** como fase numerada. Stripe/`subscriptions`
  quedan fuera del roadmap ("despriorizado", sección nueva al final de §7),
  no cancelados definitivamente.
- **Comunidades pasa a ser la Fase 6**, con el mismo nivel de detalle
  (objetivo, hecho/falta, complejidad, riesgo) que las demás fases.
- Renumeración resultante: 1, 2, 3, 4, 5, 6 (Comunidades), 7. Sin fases
  decimales ni módulos "fuera del roadmap numerado" salvo Monetización.

### 2026-08-27 (noche) — Fase 2 cambia a CRUD vía Supabase

Segunda instrucción del usuario el mismo día: la Fase 2 deja de tener el
CRUD local (`localStorage`) como destino final. Cambios aplicados (detalle
en §7 y ADR en §13):
- Nuevo objetivo de Fase 2: rutinas/ejercicios/unidades respaldados en
  **Supabase**, expuestos vía `gym-gateway` — mismo patrón proxy que la
  auth de Fase 3, no un cliente Supabase nuevo en el frontend.
- Es una **decisión de plan**, no un cambio de código: `useDataStore` sigue
  funcionando hoy 100% sobre `zustand/persist` + `localStorage`. Nada de la
  migración está implementado.
- Se aprovecha el diseño del schema de Supabase para resolver de una vez la
  deuda del modelo plano (`Bloque/BloqueItem/SerieDef`, ex-Fase 2.5) en vez
  de migrar `EjercicioRutina` tal cual a Supabase y tener que rediseñarlo
  una segunda vez después.
- Se removió de Fase 3 el ítem "migrar `useDataStore`" (quedó duplicado con
  el nuevo objetivo de Fase 2) — Fase 3 conserva solo la migración de
  `useCitasStore`, que es dominio de Calendario.
- % de Fase 2 pasa a reportarse como "UI ~80% / persistencia real 0%" en vez
  de un solo número, porque son dos cosas distintas ahora: la UI/Biblioteca
  sobre localStorage sigue tan completa como antes, pero el nuevo objetivo
  (Supabase) arranca desde cero.

### 2026-08-28 — Inicio = dashboard de métricas

El usuario pidió que la pantalla de inicio sea el dashboard y descartar la
pantalla principal anterior (`src/pages/Dashboard.tsx`: saludo, atajos y
listado de rutinas). `/` renderiza `AdminDashboardPage` (métricas mock por
rol). `/admin/dashboard` redirige a `/`. El listado de rutinas sigue en
`/library/rutinas`.

### 2026-09-23 — Plan personal vs plantillas de biblioteca

- **Biblioteca** (`/library/rutinas/nueva`, niveles básica/intermedia/avanzada, presets): solo **plantillas genéricas** (`Rutina` → `POST /api/routines` sin `assign_to_self`). Se asignan a clientes desde el tab **Entrenamientos** (`RutinaPickerSheet`).
- **Plan propio del entrenador** (“Crearme una rutina” en `/perfil`, URLs legacy `?para=mi`): redirige a **`/usuarios/:id?tab=entrenamientos`** con el mismo **`UserPlanWorkspace`** que un cliente. Se resuelve `client_uuid === auth.sub` (gateway: `POST /api/trainers/clients/link` si falta el vínculo). En mock demo, fallback al cliente seed `id === 1`.

### 2026-08-30 — Rutinas multi-semana en el creador (Biblioteca)

El creador de rutinas (`/library/rutinas/nueva/*`) pasa de sesión única a **programa
de 1–8 semanas** (`Rutina.semanas` + `Rutina.programacion_semanal`, Lun–Dom por semana).
`ejercicios[]` se mantiene como flatten de la semana 1 para compat con player, cards y
asignación a planes. Tres modos en tabs: **Semana tipo** (copia semana 1), **Semana a
semana** (independiente), **Desde plantilla** (biblioteca o preset). Sin rediseño
`Bloque/BloqueItem/SerieDef` — deuda Fase 2 sigue pendiente; esta estructura temporal
se documenta como trade-off consciente.

---

## 13. Bitácora de decisiones (ADR ligero)

> Un renglón por decisión tomada, con fecha. Evita perder el "por qué".

| Fecha | Decisión | Motivo |
|---|---|---|
| 2026-04-16 | Crear este CONTEXT.md como fuente única | Conversaciones pierden contexto entre sesiones |
| 2026-04-16 | Fase 2.5 (rediseño modelo) es bloqueante antes de Supabase | Evitar doble migración |
| 2026-07-02 | Integrar ExerciseDB (RapidAPI) via capa `src/lib/exercisedb` + TanStack Query | Enriquecer biblioteca de ejercicios con datos, imagenes y videos externos; key en `VITE_RAPIDAPI_KEY` (client-side por ahora, proxy en Fase 3) |
| 2026-07-09 | Sección `/library/*` con hub + catálogos (partes/equipo/tipos/músculos) + listado filtrable; submenú solo en esas rutas | Exponer todos los filtros/catálogos del API sin mezclarlos en Inicio/Admin; deep-link via query params |
| 2026-07-09 | Chat IA en `/library/ia`: backend propone rutina, cliente resuelve cada ejercicio con ExerciseDB (`search`) y guarda `exerciseDbId` | Preparar puente a Supabase; UI multi-turno en Biblioteca; redirect desde `/admin/rutina-ia` |
| 2026-07-10 | Tres formularios `/library/rutina/basica|intermedia|avanzada` con campos progresivos + ExerciseDB picker; extensión `Rutina` con `tipo`, `rest_between_sets`, `notes`, `rpe`, `grupo_superset` | Crear rutinas desde Biblioteca sin perder campos capturados; puente a Fase 2.5 |
| 2026-07-10 | Catálogo `routinePresets` (~20 plantillas: Hyrox, isométricos, pliometría…) + galería `/library/rutina/plantillas` con resolución ExerciseDB | Rutinas preestablecidas seleccionables; migrable a Supabase en Fase 3 |
| 2026-07-10 | Admin y Biblioteca unificados: `AppShell` compartido, builder 2 pasos (editar + revisión/heatmap), `/admin/rutina` → redirect al builder; edit con `?id=` | Una sola app; mismo flujo crear/editar desde Admin o Biblioteca |
| 2026-07-10 | Backend `fitpro_api` (FastAPI) + DeepSeek en `POST /api/ai/routine`; key solo servidor (`DEEPSEEK_API_KEY`); frontend en `/library/ia` sin cambios de UI | Completar flujo chat IA → rutina → ExerciseDB → guardar |
| 2026-08-24 | **D8 resuelto:** Tailwind 4 como sistema responsive; tokens de `index.css` expuestos vía `@theme`; layout mobile-first con `AppShell` progresivo (`narrow`/`default`/`wide`); bottom nav móvil + nav desktop en `Navbar`; componente `Sheet` unificado para overlays | Eliminar deuda de estilos (inline + `tailwind.config.js` muerto); UX móvil/tablet/escritorio coherente |
| 2026-08-27 | Pantalla `/calendario` con `@daypicker/react` v10: citas locales (`Cita` + `useCitasStore` sin persist) y overlay de días de entreno por weekday desde semana 1 del plan; acceso en navbar y dashboard | Complementar Planes (días Lun–Dom sin fecha real) con calendario de fechas; tipo `Cita` alineado a futura tabla Supabase `appointments` |
| 2026-08-24 | **Auth real vía `gym-gateway`** (backend FastAPI hermano, no vía cliente Supabase directo en el frontend): `AuthContext` llama a `src/lib/gateway/`, que hace `fetch` contra `gym-gateway`, el cual valida contra Supabase Auth (JWT ES256 + JWKS) y expone `/api/auth/*`. Tokens de sesión reales persistidos en `localStorage` (`fitpro-session`) con refresh automático | Reemplaza el mock (`localStorage.setItem('fitpro-auth','true')`) documentado desde abril 2026. Decisión arquitectónica implícita (no discutida explícitamente antes de implementarse): Supabase se habla solo desde el gateway, nunca directo desde el frontend — mantiene `src/lib/supabase.ts` comentado a propósito, no como deuda pendiente |
| 2026-08-24 | RBAC (`require_role`/`require_admin`) implementado server-side en `gym-gateway` contra `users.profiles` en Supabase; frontend recibe `AuthUser.role` pero aún sin gating de rutas/UI por rol | Base de permisos reales lista para conectar en Fase 3/5; evita reinventar un sistema de roles cuando llegue el gating del frontend |
| 2026-08-24 | Limpieza de rutas `/admin/*` (commits `298ff26`, `604cd38`): se eliminan las pantallas de Admin sin uso; todo el CRUD vive en `/library/*`, `/admin/*` queda solo como redirects legacy | Una sola superficie de gestión (Biblioteca) en vez de Admin+Biblioteca duplicados |
| 2026-08-27 | **Módulo Comunidades** (`/communities/*`) implementado como UI pura sobre datos mock (`useCommunitiesStore`, sin `persist`), sin conexión a Supabase/`gym-gateway`/auth real; rol de comunidad simulado y explícitamente desacoplado del RBAC real | Explorar/validar el feature completo de comunidades (posts, eventos, discusiones, moderación, roles por comunidad) como prototipo navegable antes de invertir en diseño de esquema y backend reales |
| 2026-08-27 | **Reestructuración del roadmap** (a petición explícita del usuario, misma fecha): se elimina la **Fase 2.5** (rediseño del modelo) y la **Fase 6** (Monetización) como fases numeradas formales; **Comunidades pasa a ser la Fase 6**. El modelo plano de rutinas sigue siendo deuda técnica real (documentada en §3/§4/§9), solo deja de ser un gate bloqueante formal. Monetización queda "fuera del roadmap" (despriorizada, no descartada) | Simplificar el roadmap a lo que se está trabajando de verdad; evitar que una fase bloqueante sin dueño asignado frene indefinidamente el resto; darle a Comunidades el mismo nivel de seguimiento que las demás fases dado el tamaño de lo ya construido |
| 2026-08-27 | **Fase 2 cambia de objetivo: CRUD local → CRUD vía Supabase.** `rutinas`/`ejercicios`/`unidades` dejan de apuntar a `localStorage` (`useDataStore` + `persist`) como destino final; pasan a apuntar a tablas Supabase expuestas vía `gym-gateway` (mismo patrón proxy que la auth de Fase 3), consumidas desde el frontend con TanStack Query. **Decisión de plan, no de código:** al momento de esta ADR nada de esto está implementado, `useDataStore` sigue 100% sobre `localStorage` | Evitar mantener dos backends de datos distintos (gateway para auth, localStorage para dominio) cuando ya existe el patrón gateway funcionando; aprovechar el diseño del schema para resolver de una vez la deuda del modelo plano (`Bloque/BloqueItem/SerieDef`) en vez de migrar el modelo viejo tal cual y rediseñarlo una segunda vez |
| 2026-08-28 | **Se elimina el override de rol por query param (`?rol=`)** y se sustituye por un override persistido (`useRoleOverrideStore`, `persist` con clave `fitpro-role-override`) editable desde la nueva pantalla `/perfil`. `usePlatformRole` resuelve `rolOverride ?? resolveDashboardRole(user.role)` y es la única fuente del rol efectivo (dashboard + gates de comunidades). El selector está abierto a cualquier usuario autenticado (decisión explícita del usuario, para poder probar toda la plataforma). Se limpia en `logout` | `?rol=` se perdía en cada navegación porque ningún `<Link>` propagaba el param (caso real: `/communities?rol=superadmin` mostraba "Crear comunidad" pero `/communities/create` respondía "Acceso restringido"). Excepción consciente a **D3** (Zustand solo para UI efímera): es una herramienta de pruebas del frontend, no dominio; **no** cambia permisos reales, que siguen validándose server-side en `gym-gateway` |
| 2026-08-28 | La pantalla de inicio (`/`) es el dashboard de métricas (`AdminDashboardPage`); se elimina `Dashboard.tsx` (atajos + listado de rutinas). `/admin/dashboard` redirige a `/` | Una sola pantalla de arranque; las rutinas se gestionan en Biblioteca |
| 2026-09-04 | **`DESIGN.md` pasa a referencia de estilo con escala** (color / tipo / espacio / radio) y recetas de componente. Inspiración de rigor: snapshot tipo Airbnb; identidad propia: canvas `#060a06`, voltaje único `--brand`, Sora 600–700 a 22–28px, radios suaves (card 15 / input 11 / btn 10 / pill full). No se copian paleta Rausch ni Cereal. Código canónico sigue siendo `src/index.css` | La guía anterior listaba principios y clases `fp-*` pero no geometría ni escala; las pantallas nuevas improvisaban tamaños y CTAs del color del módulo |
| 2026-09-09 | **Primera instancia = cerrar el loop** (crear rutina → invitar cliente → ejecutar en PWA → entrenador ve el log). Comunidades, billing, dashboards de plataforma y nativo quedan fuera hasta entonces. El modelo avanzado de rutinas no es gate del MVP de ejecución (sí del diseño de schema). | El repo tenía mucha superficie y el producto no existía: clientes seed, player sin persist, tracking mock. Ver §1 y §12 |
| 2026-09-09 | **D11 — App cliente = PWA React independiente** (repo hermano, aún no creado), mismo `gym-gateway` y misma identidad (`DESIGN.md`). Esta SPA no crece un “modo cliente”. Primera instancia de la PWA: instalable, online, escribe `sessions`/`session_sets`. Offline-first profundo = Fase 7 | El cliente necesita una superficie de ejecución en el teléfono; meterla en el cockpit del entrenador mezcla UX y retrasa las dos apps |
| 2026-09-09 | **Modelo mínimo de entrenamiento en mock local:** `ejercicio_id` en plantillas de rutina/plan; sesiones ejecutadas con `SerieEjecutada` (peso/reps); `useSesionesStore` con persist; registro manual del entrenador. Sin Supabase — contrato alineado a `sessions`/`session_sets` para Fase 4 | Cerrar el loop del entrenador (prescribir → registrar → ver log) sin esperar PWA ni gateway; evitar rediseño al cablear backend |
| 2026-09-21 | **IA de rutinas integrada en gym-gateway** (`POST /api/ai/routine`, OpenRouter + catálogo Supabase directo). FitPro deja `VITE_API_URL`/gym-mcp para producto; un solo origen (`VITE_GATEWAY_URL`). `gym-mcp` congelado como sidecar MCP opcional | CORS, un proceso menos, mismo JWT/RBAC; alinea D1 (FastAPI solo cuando duele — aquí el gateway ya es la puerta) |
| 2026-09-22 | **`gym-mcp` absorbido del todo en gym-gateway.** No hay repo ni servicio sidecar. Stack de producto: gateway + FitPro + PWA. El loop de sesión (iniciar / series / completar) escribe `training.sessions` + `session_sets` | Evitar un cuarto proceso y un workspace fantasma; una sola puerta al backend |
| 2026-09-23 | **Plan personal ≠ formulario de biblioteca.** `?para=mi` y “Configurar mi plan” abren el editor de plan por sesiones (`UserPlanWorkspace` + `createPlan`), no intermedia/básica/avanzada con `assign_to_self`. Las plantillas siguen en Biblioteca | Misma UX que prescribir a un cliente; evita dos modelos (días de plantilla vs sesiones de plan) para “entrenar yo” |

---

## Apéndice A — Cómo usar este documento

1. Al iniciar una conversación con el asistente, menciona `@CONTEXT.md`.
   La visión vigente está en **§1** (qué / para qué / cómo, primera instancia,
   PWA cliente). No usar la lista de fases como si todo fuera igual de urgente.
2. Cuando tomes una decisión, añádela a **§13 Bitácora**.
3. Cuando aparezca nueva info (diseño, negocio, feedback), añádela a **§12 Contexto adicional** con fecha.
4. Cuando completes una tarea de **§11 Backlog**, táchala y anota el commit o PR.
5. Cuando cambie el estado de una fase, actualiza el porcentaje en **§7 Fases**.

## Apéndice B — Comandos rápidos

```bash
npm run dev       # desarrollo
npm run build     # build de producción
npm run lint      # linter
docker-compose up # levantar contenedor
```
