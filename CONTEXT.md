# FitPro — Contexto y Roadmap

> Documento vivo. Se actualiza conforme se agregan datos, decisiones y aprendizajes.
> Última revisión: 2026-08-27 (auditoría completa del código — ver §12 y `HISTORIAL.md`)
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
- [10. Limpieza inmediata pendiente](#10-limpieza-inmediata-pendiente)
- [11. Backlog vivo](#11-backlog-vivo)
- [12. Contexto adicional (se va agregando)](#12-contexto-adicional-se-va-agregando)
- [13. Bitácora de decisiones (ADR ligero)](#13-bitácora-de-decisiones-adr-ligero)

---

## 1. Visión del producto

**FitPro** es un SaaS fitness donde:

- **Entrenadores** crean rutinas, ejercicios y planes semanales.
- **Clientes** ejecutan rutinas y ven su progreso.
- **Se gestionan** ejercicios, series, sesiones y progreso con datos reales (peso, RPE, reps efectivas).
- **Modelo comercial:** planes por número de clientes (Free / Pro / Gym).

### Stack objetivo

| Capa | Tecnología |
|---|---|
| UI | React 19 + Vite + TypeScript |
| Routing | react-router-dom v7 |
| Estado UI efímero | Zustand |
| Estado servidor | TanStack Query (a introducir) |
| Validación runtime | Zod (a introducir) |
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions), accedido vía **`gym-gateway`** (FastAPI propio) en vez de directo desde el frontend — ver §2 y ADR 2026-08-24 |
| Pagos | Stripe |
| Estilos | Tailwind 4 (+ tokens CSS) — **D8 resuelto**, ver §9 |
| Observabilidad | Sentry + PostHog (a introducir) |

---

## 2. Estado actual real del código

> Auditado de nuevo el 2026-08-27 contra el código (no contra README/commits).
> Varias cosas documentadas como "mock" o "0%" en la revisión de abril 2026
> **ya no son ciertas** — el proyecto avanzó bastante desde entonces, sobre
> todo en auth y en Biblioteca. Ver también `HISTORIAL.md` (mapeos fechados).

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
- **Página de planes por usuario** en [src/pages/UserPlansPage.tsx](src/pages/UserPlansPage.tsx)
  (508 líneas, con vistas día/semana/mes/total y drag&drop vía `@dnd-kit`) —
  **sigue en `useState(usuariosData)`, no persiste**.
- **Módulo Comunidades / Fase 6** (`/communities/*`, implementado
  2026-08-27): UI completa (22 pantallas, 20 modales aprox.) sobre
  `useCommunitiesStore` y fixtures JSON — **100% mock, sin persist, sin
  backend, sin relación con el auth/RBAC real**. Tiene su propio sistema de
  roles simulado (`useCommunityPermissions`) que **no debe confundirse** con
  el RBAC real de `gym-gateway`. Ver §7.

### Lo que NO hay (aunque parezca que sí)

- **Supabase en el frontend:** cliente completamente comentado en
  [src/lib/supabase.ts](src/lib/supabase.ts), a propósito — el frontend
  nunca habla con Supabase directo, todo pasa por `gym-gateway`. (Supabase sí
  está realmente cableado, pero **en el backend `gym-gateway`**, no aquí.)
- **Roles en el frontend:** el campo existe en `AuthUser`, pero no hay
  gating de rutas/UI por rol en `src/App.tsx` ni en ninguna página.
- **Historial de entrenos:** [src/store/useWorkoutStore.ts](src/store/useWorkoutStore.ts) **sigue sin persistir nada**. No se guarda peso, RPE, reps reales, fecha, duración, ni qué rutina se hizo.
- **Monetización:** cero.
- **Tests:** cero (sin Vitest configurado, sin un solo `*.test.ts`).
- **Observabilidad:** cero (sin Sentry, sin PostHog).
- **Instalación completa de dependencias:** `@tanstack/react-query`,
  `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` y
  `@daypicker/react` están **declaradas en `package.json` pero ausentes de
  `node_modules`** en este entorno — `npm run build` falla hoy por esto. El
  código que las usa (TanStack Query en `lib/exercisedb/hooks.ts`, drag&drop
  en `UserPlansPage`, calendario con `@daypicker/react`) está bien escrito;
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
- Fase 6 (Comunidades): **UI ~100% mock / 0% backend real** (nueva fase,
  implementada el mismo día)
- Fase 7: sin cambios de fondo (IA de rutinas ya funciona, adelantada fuera de orden)

**Los tres bloqueantes de fondo siguen siendo los mismos:** modelo de datos
plano (Fase 2.5), historial de sesiones sin persistir (Fase 4) y
multi-tenant sin datos reales (Fase 5). El progreso real en auth/Biblioteca
no los resuelve — solo reduce el trabajo de infraestructura alrededor.

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
2. **Referencia por `nombre: string`** en lugar de `ejercicio_id: number`. Renombrar un ejercicio rompe todas las rutinas. **Sin cambios.**
3. **`series: number` escalar** imposibilita dropsets, piramidales, cluster sets, warmup vs working. **Sin cambios.**
4. ~~Campos zombie en wizard~~ — **✅ resuelto**: `useRoutineForm.ts` ya persiste `tipo`/`rest_between_sets`/`notes` correctamente según el nivel del formulario.
5. ~~Auth decorativo~~ — **✅ resuelto**: auth real vía `gym-gateway`, `loading` real con bootstrap/refresh de sesión.
6. **Sin roles en el frontend** → aunque ya existe RBAC real en el backend (`gym-gateway`), el frontend no lo usa para gating. Ya no hay `/admin/*` (se eliminó), pero tampoco hay gating por rol en `/library/*` ni en el resto.
7. **`UserPlansPage` sigue en `useState(usuariosData)`** (508 líneas hoy) → se pierde todo al recargar. **Sin cambios de fondo**, solo creció la UI encima.
8. **Workout store sin persistencia** → no hay historial, no hay progreso, no hay producto. **Sin cambios.**
9. **Páginas grandes, pero ya no gigantes**: hoy el máximo es `UserPlansPage.tsx` (508) y `AIRoutineChatPage.tsx` (472); el antiguo `RoutinePage.tsx` de 683 líneas ya no existe. Sigue habiendo margen para extraer componentes.
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

| Capacidad | Hoy | Notas |
|---|---|---|
| Rutina estándar (N series × reps) | ✅ | Trivial |
| Superseries (A1+A2 alternando) | ❌ | No hay concepto de bloque/grupo |
| Circuitos (rondas) | ❌ | No hay `rondas` ni `bloque` |
| Dropsets / piramidal / cluster | ❌ | `series: number` + `valor: number` asume homogeneidad |
| RPE por serie | ❌ | No existe campo |
| %1RM | ❌ | No existe campo |
| Peso por serie | ❌ | No existe campo |
| Descanso entre series | ❌ | Se captura en wizard pero se descarta |
| Tempo (3-1-1-0) | ❌ | No existe |
| EMOM / AMRAP / For Time | ❌ | `tipo` se captura pero no se guarda |
| Warmup vs working vs failure | ❌ | No hay tipo de serie |
| Notas por ejercicio | ❌ | Ni en modelo ni en guardado |
| Progresión entre semanas | ❌ | No hay plan semanal con peso progresivo |

**Veredicto:** el módulo actual sirve para un MVP de "listas de ejercicios", no para un SaaS fitness real. **Debe rediseñarse antes de tocar Supabase.**

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

### Schema Postgres objetivo (Fase 3+)

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
- `plan_days`
- `sessions` (ejecución real)
- `session_sets` (peso/reps/RPE reales por serie)
- `subscriptions` (Stripe)

**Todas con RLS activo desde el día 1.**

---

## 6. Arquitectura objetivo

```
┌──────────────────────────────────────────┐
│  Supabase (source of truth)              │
│  Postgres + RLS + Auth + Storage         │
└──────────────────────────────────────────┘
                  ↑↓
┌──────────────────────────────────────────┐
│  TanStack Query (cache + sync)           │
│  useRoutines(), useExercises(), ...       │
└──────────────────────────────────────────┘
                  ↑↓
┌──────────────────────────────────────────┐
│  Zustand (SOLO UI efímera)                │
│  wizard state, player runtime, modales   │
└──────────────────────────────────────────┘
                  ↑↓
┌──────────────────────────────────────────┐
│  React Components                         │
└──────────────────────────────────────────┘
```

Reglas:
- **Nada de datos de dominio en localStorage** una vez haya servidor.
- **Zod valida** todo lo que entra del exterior (form, import, respuestas server).
- **RLS es la primera barrera**, el client-side gating es la segunda.
- **Edge Functions de Supabase** para webhooks y jobs ligeros. FastAPI solo si duele.

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
- Falta (aparte, sin cambios): validar `importData` con Zod (aplica también
  al nuevo flujo, como validación de payloads entrantes), dividir páginas
  god restantes (`UserPlansPage.tsx` 508 líneas, `AIRoutineChatPage.tsx` 472
  líneas), registrar o eliminar la ruta huérfana `/library/unidades`,
  decidir sobre `LibraryDatosPage.tsx`/`LibraryMisEjerciciosPage.tsx`.
- **Deuda técnica sin fase propia (ex-Fase 2.5):** el modelo de datos sigue
  plano (`EjercicioRutina` sin bloques/series estructuradas, ejercicios
  referenciados por `nombre: string` en vez de `ejercicio_id`). **Este es el
  momento natural para resolverlo**: si de todas formas se va a diseñar el
  schema de Supabase para rutinas/ejercicios, hacerlo directamente como
  `Rutina → Bloque[] → BloqueItem[] → SerieDef[]` (ver §5) evita migrar dos
  veces (primero a Supabase plano, después a Supabase con bloques).
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
**Objetivo:** historial de entrenos (core del valor SaaS).
- Tablas `sessions` + `session_sets`.
- `useWorkoutStore` escribe al servidor en `completarSerie` / `terminarWorkout`.
- Pantalla de historial con filtros.
- Cálculo de volumen + 1RM estimado (Epley).
- Rest timer funcional entre series.
- Complejidad: **media-alta**.
- **Sin esto no hay producto.**

### Fase 5 — Multi-tenant (entrenador ↔ cliente) `🔴 ~5-10%`
**Objetivo:** asignación de rutinas/planes.
- **Avanzó en UI, no en datos:** `UserPlansPage.tsx` (508 líneas) ahora tiene
  vistas día/semana/mes/total con drag&drop (`@dnd-kit`) — la parte más
  sofisticada visualmente del repo — pero sigue en `useState(usuariosData)`,
  se pierde todo al recargar. Brecha UI-vs-dato más grande del proyecto.
- Tabla `trainer_client_links` + flujo de invitación (magic link).
- Migrar `UserPlansPage` a persistencia real (tablas `plans`, `plan_weeks`, `plan_days`).
- Gating de rutas por rol (ya hay RBAC server-side en `gym-gateway` para
  apoyarse — falta conectar el frontend).
- Vista cliente: "mi plan de la semana", "entreno de hoy".
- Realtime opcional: trainer ve sesión del cliente en vivo.
- Complejidad: **alta**.
- **Riesgo:** RLS con joins complejo.

### Fase 6 — Comunidades `🟡 UI ~100% mock / 0% backend`
**Objetivo:** feature social por comunidad (posts, eventos, discusiones,
miembros, moderación) para retención y engagement.
- **Hecho (2026-08-27):** UI completa como prototipo navegable — 22
  pantallas / ~20 modales sobre `useCommunitiesStore` (Zustand, sin
  `persist`) y fixtures JSON en `src/data/communities/`. Cubre explorar
  comunidades, feed de posts con reacciones/comentarios, eventos con RSVP,
  discusiones, gestión de miembros, panel de administración/moderación,
  invitaciones y notificaciones con deep-link.
- **Falta todo el backend:** diseñar esquema real (comunidades, miembros,
  posts, eventos, discusiones, reportes) en Supabase; decidir si pasa por
  `gym-gateway` (consistente con el resto de la app) o es un dominio nuevo;
  migrar `useCommunitiesStore` a TanStack Query + persistencia real;
  reemplazar `useCommunityPermissions` (rol simulado) por un sistema de
  roles real — **decidir explícitamente** si el rol dentro de una comunidad
  se relaciona con `AuthUser.role`/RBAC de `gym-gateway` o es un concepto
  independiente (hoy están deliberadamente desacoplados).
- Complejidad: **alta** (superficie grande: 8 entidades de dominio nuevas).
- **Riesgo:** construir más UI mock (notificaciones push, invitaciones por
  email real) antes de decidir el backend duplicaría trabajo, igual que
  pasó con el modelo de rutinas.

### Fase 7 — Analytics + IA + móvil `🔴 0% (excepto IA, adelantada)`
**Objetivo:** retención y diferenciación.
- **IA de generación de rutinas ya funciona end-to-end**, fuera de orden:
  chat en `/library/ia` → propuesta del backend (`fitpro_api` + DeepSeek) →
  resolución de ejercicios contra ExerciseDB → guardado. No es "Fase 7 en
  0%" en ese sentido puntual, aunque el resto (dashboards, coach LLM
  conversacional, PWA, app nativa) sigue en 0%.
- Dashboards de progreso (volumen, PRs, adherencia).
- Coach LLM (OpenAI/Claude) para ajustar rutinas.
- PWA con player offline-first.
- App nativa con Capacitor/Expo.
- Complejidad: **alta**.

---

### Fuera del roadmap (por ahora)

- **Monetización (ex-Fase 6):** Stripe Checkout + Customer Portal, webhook →
  `subscriptions`, planes Free/Pro/Gym, feature gating. Despriorizada
  explícitamente el 2026-08-27 — no eliminada del producto, solo sin fase
  asignada hasta que el resto del roadmap avance. Retomar cuando haya
  usuarios reales que justifiquen cobrar.

---

## 8. Riesgos críticos

> Actualizado 2026-08-27: #2, #4 y #7 (parcial) ya no aplican como estaban
> escritos — se dejan anotados en vez de renumerar todo el historial.

1. **Integrar/rediseñar el modelo de datos sin resolver Fase 2.5 primero** → doble migración. **Vigente**, y más caro cada mes que Biblioteca crece sobre el modelo viejo.
2. ~~Campos zombie en wizard~~ — **✅ resuelto**, ver §2/§3.
3. **Sin persistencia de sesiones de entrenamiento** → sin producto. **Vigente, sin cambios.**
4. **Sin roles en el frontend** → ya no hay `/admin` (se eliminó), pero tampoco hay gating por rol en ninguna ruta. El riesgo cambia de forma: ya no es "cualquiera entra a Admin", es "no se puede diferenciar entrenador de cliente en la UI" pese a que el backend (`gym-gateway`) ya sabe distinguir roles.
5. **`importData` sin validación Zod** → vector de corrupción. **Vigente**, aunque Zod ya está probado y en uso en otras partes del código (`gateway/schemas`, `exercisedb/schemas`) — extenderlo aquí es trabajo conocido, no exploratorio.
6. **Ejercicios referenciados por `nombre`** → renombre rompe rutinas. **Vigente, sin cambios.**
7. ~~Mezcla de estilos~~ — **✅ resuelto (D8)**. Queda inline puntual, ya no es riesgo arquitectónico.
8. **Archivos grandes**: ya no hay 600-700 líneas, pero `UserPlansPage.tsx` (508) y `AIRoutineChatPage.tsx` (472) siguen siendo candidatos a bloquear colaboración/tests si crecen más.
9. **Sin ErrorBoundary, sin Sentry, sin métricas.** **Vigente, sin cambios.**
10. **React 19 / Vite 8** muy recientes → confirmado además: 3 dependencias (`@tanstack/react-query`, `@dnd-kit/*`, `@daypicker/react`) declaradas pero no instaladas en este entorno, y Node local (v18.19.1) por debajo del mínimo real de Vite 8 — **riesgo operativo confirmado**, no solo teórico.
11. **Nuevo: `gym-gateway` sin tests y con migraciones SQL no versionadas** (solo documentadas en su README) → no se puede verificar el estado real de RLS/roles en Supabase desde el código; depende de que alguien haya corrido los scripts manualmente en el proyecto real.
12. **Nuevo: dos sistemas de roles en el mismo repo** (`AuthUser.role` del auth real vs. rol mock de `useCommunityPermissions` en Comunidades) → riesgo de que una futura conexión del módulo Comunidades a backend real mezcle o confunda ambos conceptos si no se diseña explícitamente su relación.

---

## 9. Decisiones técnicas fijadas

| # | Decisión | Razón |
|---|---|---|
| D1 | Supabase puro al inicio; FastAPI solo cuando duela — **en la práctica ya hay dos FastAPI**: `fitpro_api` (IA/DeepSeek) y `gym-gateway` (proxy de auth/datos hacia Supabase). El frontend nunca habla Supabase directo, todo pasa por `gym-gateway` | Auth/roles reales sin exponer keys de Supabase al cliente; IA/jobs pesados justifican el extra en `fitpro_api` |
| D2 | TanStack Query para datos servidor | Cache, sync, optimistic updates sin `useEffect` manuales — **cableado en código, pendiente `npm install` en este entorno (ver §2/§3)** |
| D3 | Zustand SOLO para UI efímera | Nada de datos de dominio persistidos |
| D4 | Zod para validación runtime | Una fuente de verdad tipos + validación |
| D5 | RLS obligatorio desde día 1 | Primera barrera; client-side gating es secundaria |
| D6 | Ejercicios referenciados por ID, no nombre | Integridad referencial |
| D7 | Modelo `Bloque → BloqueItem → SerieDef` | Soporta 100% de patrones de entrenamiento modernos |
| D8 | Unificar estilos: **Tailwind 4 + tokens `@theme`**; migración oportunista de inline styles | Decidido 2026-08-24 — ver §13 |
| D9 | Tests con Vitest + @testing-library/react | Validators y stores primero |
| D10 | Observabilidad desde prod-day-1: Sentry + PostHog | No subir nada a prod sin esto |

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
Sin fase bloqueante formal desde 2026-08-27 (se eliminó la Fase 2.5 del
roadmap numerado — ver §7). El rediseño del modelo de Rutina sigue siendo
la deuda técnica más cara del repo y **se recomienda no ignorarla**, pero ya
no es un gate obligatorio antes de avanzar en otras fases. Prioridad
sugerida hoy: diseñar el schema real de Supabase para rutinas/ejercicios/
unidades (Fase 2, nuevo objetivo — aprovechar para resolver de una vez el
modelo `Bloque/BloqueItem/SerieDef` en vez de migrar el modelo plano tal
cual), en paralelo a Fase 3 (`npm install`, gating por rol) y a definir el
backend de Fase 6 (Comunidades) antes de seguir ampliando su UI.

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

1. `npm install` para dejar `@tanstack/react-query`, `@dnd-kit/*` y
   `@daypicker/react` instalados — el build falla hoy sin esto.
2. **(Fase 2, nuevo)** Diseñar schema Supabase para `rutinas`/`ejercicios`/
   `unidades` + RLS — aprovechar este diseño para resolver de una vez la
   deuda del modelo plano (punto 8 de esta lista) en vez de migrar
   `EjercicioRutina` tal cual y tener que rediseñarlo otra vez después.
3. **(Fase 2, nuevo)** Exponer esas tablas vía `gym-gateway` (mismo patrón
   proxy que auth) y migrar `useDataStore` de `zustand/persist` a hooks
   TanStack Query contra `gym-gateway`, actualizando Biblioteca y los 3
   formularios de rutina para consumirlos.
4. Migrar `useCitasStore` (citas del calendario) a hooks server-side vía
   `gym-gateway` — mismo patrón técnico que el punto anterior, pero dominio
   de Calendario, no de Biblioteca.
5. Añadir `updateCita` a `useCitasStore` y decidir si debe persistir
   (`persist` local) mientras no haya backend de citas.
6. Gating por rol en el frontend usando `AuthUser.role` + el RBAC ya
   existente en `gym-gateway` (no reinventar roles).
7. Tablas `sessions` + `session_sets` + escritura real desde
   `useWorkoutStore` — sigue siendo el bloqueante de producto (Fase 4).
8. Rediseñar tipos `Rutina / Bloque / BloqueItem / SerieDef` en
   `src/types/` (ex-Fase 2.5) — ver puntos 2-3: se resuelve como parte del
   diseño de schema de Supabase de Fase 2, no como proyecto aparte. Incluye
   migrar `EjercicioRutina.nombre` → `ejercicio_id` (FK real) y añadir Zod
   a `importData` y a los formularios de rutina.
9. `trainer_client_links` + migrar `UserPlansPage` a persistencia real.
10. Diseñar el backend de Comunidades (Fase 6): esquema real, decidir si
    pasa por `gym-gateway`, migrar `useCommunitiesStore` a datos servidor,
    y resolver la relación entre el rol de comunidad y `AuthUser.role`.
11. Limpieza de código muerto restante (ver §10): `create-admin.js`,
    carpetas `player/`/`workout/` vacías, páginas huérfanas de Biblioteca,
    ruta huérfana `/library/unidades`.
12. Monetización (Stripe, `subscriptions`) — **sin fase asignada**, retomar
    cuando el resto del roadmap esté más avanzado (ver §7, "Fuera del roadmap").

---

## 12. Contexto adicional (se va agregando)

> **Esta sección es para ir añadiendo información conforme aparezca**:
> decisiones de negocio, feedback de usuarios, snippets de conversaciones,
> brief de diseño, integraciones externas, credenciales (referencias, nunca valores),
> benchmarks de competencia, etc.
>
> Estructura sugerida: agregar bloques con fecha y encabezado.

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
| 2026-08-28 | La pantalla de inicio (`/`) es el dashboard de métricas (`AdminDashboardPage`); se elimina `Dashboard.tsx` (atajos + listado de rutinas). `/admin/dashboard` redirige a `/` | Una sola pantalla de arranque; las rutinas se gestionan en Biblioteca |

---

## Apéndice A — Cómo usar este documento

1. Al iniciar una conversación con el asistente, menciona `@CONTEXT.md`.
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
