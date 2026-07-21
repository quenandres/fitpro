# FitPro — Contexto y Roadmap

> Documento vivo. Se actualiza conforme se agregan datos, decisiones y aprendizajes.
> Última revisión: 2026-04-16
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
| Backend | Supabase (Postgres + Auth + Storage + Edge Functions) |
| Pagos | Stripe |
| Estilos | Tailwind 4 (+ tokens CSS) — unificar |
| Observabilidad | Sentry + PostHog (a introducir) |

---

## 2. Estado actual real del código

> La narrativa del README decía "Supabase integrado parcialmente" y "login y registro ya existen". Verificado contra el código: **no es así**.

### Lo que realmente hay

- **Routing funcional** en [src/App.tsx](src/App.tsx) con `ProtectedRoute` / `PublicRoute`.
- **UI pulida** (dark/light, componentes visuales, tokens CSS).
- **CRUD local** de rutinas/ejercicios/unidades en [src/store/useDataStore.ts](src/store/useDataStore.ts) sobre `localStorage` (`zustand/persist`).
- **Wizard multi-paso** de rutinas en [src/pages/RoutinePage.tsx](src/pages/RoutinePage.tsx) (683 líneas).
- **Workout player** en [src/pages/WorkoutPlayer.tsx](src/pages/WorkoutPlayer.tsx) — avanza series en memoria.
- **Página de planes por usuario** en [src/pages/UserPlansPage.tsx](src/pages/UserPlansPage.tsx) — **estado local, no persiste**.

### Lo que NO hay (aunque parezca que sí)

- **Supabase:** cliente completamente comentado en [src/lib/supabase.ts](src/lib/supabase.ts).
- **Auth real:** [src/context/AuthContext.tsx](src/context/AuthContext.tsx) hace `localStorage.setItem('fitpro-auth', 'true')`. Login y registro son `setTimeout(600)` falsos. Cualquier correo/password entra.
- **OAuth social:** los botones de Google/GitHub/Apple solo setean el flag local.
- **Roles:** no existen. Cualquier usuario autenticado accede a `/admin`, `/admin/rutina`, `/admin/planes`.
- **Historial de entrenos:** [src/store/useWorkoutStore.ts](src/store/useWorkoutStore.ts) **no persiste nada**. No se guarda peso, RPE, reps reales, fecha, duración, ni qué rutina se hizo.
- **Backend propio:** cero.
- **Monetización:** cero.
- **Tests:** cero.

### Pérdida silenciosa de datos (bug presente hoy)

El wizard captura `tipo` (emom/amrap/fortime/circuit), `rest_between_sets` y `notes`, pero [src/pages/RoutinePage.tsx](src/pages/RoutinePage.tsx) **los descarta** al guardar:

```568:575:src/pages/RoutinePage.tsx
    const rutinaData: Omit<Rutina, 'id'> = {
      nombre:       form.nombre,
      categoria:    form.categoria,
      dificultad:   form.dificultad,
      duracion_min: form.duracion_min,
      descripcion:  form.descripcion,
      ejercicios:   form.ejercicios.map((e) => ({ nombre: e.nombre, series: e.series, valor: e.valor, unidad_id: e.unidad_id })),
    };
```

La interface `Rutina` no los contempla. El usuario cree que los configuró; se pierden sin aviso.

### Posición real en la línea de fases

- Fase 1 (UI base): **~95% completado**
- Fase 2 (CRUD local): **~70% completado**
- Resto: **0-10%**

**Distancia al MVP real: 25-30%, no 60% como sugiere el pulido visual.**

---

## 3. Diagnóstico técnico (sin suavizar)

### Aciertos
1. Routing limpio con rutas públicas/privadas.
2. Separación correcta en dos stores Zustand (`useDataStore` vs `useWorkoutStore`).
3. Wizard con validación por paso ([src/utils/validators.ts](src/utils/validators.ts)).
4. Hook `useUnits` desacopla formateo.
5. UI consistente, accesible visualmente.

### Problemas serios

1. **Modelo de datos pobre** (`EjercicioRutina` tiene solo `nombre, series, valor, unidad_id`). Sin peso, RPE, %1RM, tempo, descanso, notas, tipo de serie.
2. **Referencia por `nombre: string`** en lugar de `ejercicio_id: number`. Renombrar un ejercicio rompe todas las rutinas.
3. **`series: number` escalar** imposibilita dropsets, piramidales, cluster sets, warmup vs working.
4. **Campos zombie en wizard** (ver sección anterior).
5. **Auth decorativo**: `loading` hardcoded a `false` pero `ProtectedRoute` lo chequea → código muerto.
6. **Sin roles** → fuga de privilegios a `/admin`.
7. **`UserPlansPage` es un juguete**: `useState(usuariosData)` → se pierde todo al recargar.
8. **Workout store sin persistencia** → no hay historial, no hay progreso, no hay producto.
9. **Páginas gigantes**: 683/697/489/424/336/324 líneas. Componentes internos no reutilizables.
10. **Carpetas vacías** (`components/common`, `components/player`, `components/workout`, `admin/lists`).
11. **Código muerto**: stubs de 2-3 líneas (`RoutineWizard.tsx`, `WizardProgress.tsx`, `UnitManager.tsx`), `create-admin.js` en raíz, `ExercisePicker` duplicado.
12. **Estilos mezclados**: Tailwind + `style={{}}` inline masivos + tokens CSS. Elegir uno.
13. **Sin capa de datos servidor**: ausencia de TanStack Query forzará `useEffect` manuales al conectar Supabase.
14. **Sin validación runtime**: `importData` acepta cualquier JSON sin validar forma.
15. **Sin tests, sin error boundaries, sin Sentry, sin métricas.**

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
- UI del wizard: reutilizable en concepto, no en código (Step1..5 embebidos en la página).
- ExercisePicker: duplicado (en page + en `src/components/admin/picker/ExercisePicker.tsx`). Hay que canonizar.
- `validators.ts`: sí reutilizable.

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

### Fase 1 — Base del sistema `✅ ~95%`
**Objetivo:** UI funcional, routing, theming, layout.
- Hecho: routing, ThemeContext, Navbar, tokens UI, Login/Register visual.
- Falta: ErrorBoundary global, accesibilidad básica, Sentry.
- Complejidad: **baja**.

### Fase 2 — CRUD local `🟡 ~70%`
**Objetivo:** gestión local estilo panel admin.
- Hecho: `useDataStore`, wizard 5 pasos, ExercisePicker, import/export.
- Falta: persistir `tipo` / `rest` / `notes`, validar import con Zod, dividir páginas god.
- Complejidad: **baja**.
- **Riesgo:** seguir puliendo esta fase sin Fase 2.5 es tirar trabajo.

### Fase 2.5 — Rediseño del modelo **[BLOQUEANTE]** `🔴 0%`
**Objetivo:** modelo que soporte superseries, circuitos, dropsets, RPE, %1RM, tempo.
- Nuevo esquema `Rutina → Bloque[] → BloqueItem[] → SerieDef[]`.
- Migrar `nombre: string` → `ejercicio_id: number` (FK).
- Mover tipos a `src/types/` por dominio.
- Adaptar RoutinePage, useDataStore, WorkoutDetail, WorkoutPlayer.
- Zod schemas para todos los tipos.
- Complejidad: **alta**.
- **Riesgo crítico si se omite:** reescribir migraciones dos veces.

### Fase 3 — Supabase + Auth real `🔴 0%`
**Objetivo:** eliminar mocks, datos en servidor, auth con roles.
- Descomentar y cablear [src/lib/supabase.ts](src/lib/supabase.ts) + `.env`.
- Reescribir `AuthContext` con `getSession` + `onAuthStateChange` + loading real.
- Crear schema Postgres + policies RLS.
- Introducir TanStack Query.
- Migrar `useDataStore` a hooks server-side (`useRoutines`, `useExercises`, `useUnits`).
- Storage Supabase para imágenes/videos.
- Complejidad: **alta**.
- **Riesgo:** RLS mal configurado = fuga de datos.

### Fase 4 — Tracking real de sesiones `🔴 ~10%`
**Objetivo:** historial de entrenos (core del valor SaaS).
- Tablas `sessions` + `session_sets`.
- `useWorkoutStore` escribe al servidor en `completarSerie` / `terminarWorkout`.
- Pantalla de historial con filtros.
- Cálculo de volumen + 1RM estimado (Epley).
- Rest timer funcional entre series.
- Complejidad: **media-alta**.
- **Sin esto no hay producto.**

### Fase 5 — Multi-tenant (entrenador ↔ cliente) `🔴 ~5%`
**Objetivo:** asignación de rutinas/planes.
- Tabla `trainer_client_links` + flujo de invitación (magic link).
- Migrar `UserPlansPage` a persistencia real (tablas `plans`, `plan_weeks`, `plan_days`).
- Gating de rutas por rol.
- Vista cliente: "mi plan de la semana", "entreno de hoy".
- Realtime opcional: trainer ve sesión del cliente en vivo.
- Complejidad: **alta**.
- **Riesgo:** RLS con joins complejo.

### Fase 6 — Monetización `🔴 0%`
**Objetivo:** cobrar.
- Stripe Checkout + Customer Portal.
- Edge Function (o FastAPI) para webhook → `subscriptions`.
- Planes: Free (1 cliente / 5 rutinas) / Pro (20 clientes) / Gym (ilimitado).
- Feature gating client + RLS/Edge Function enforcement.
- Complejidad: **media**.
- **Riesgo:** webhook mal firmado = fraude.

### Fase 7 — Analytics + IA + móvil `🔴 0%`
**Objetivo:** retención y diferenciación.
- Dashboards de progreso (volumen, PRs, adherencia).
- Coach LLM (OpenAI/Claude) para ajustar rutinas.
- PWA con player offline-first.
- App nativa con Capacitor/Expo.
- Complejidad: **alta**.

---

## 8. Riesgos críticos

1. **Integrar Supabase sin rediseñar modelo** → doble migración.
2. **Campos zombie en wizard** → pérdida silenciosa de datos ya presente.
3. **Sin persistencia de sesiones** → sin producto.
4. **Sin roles** → `/admin` abierto a cualquier usuario.
5. **`importData` sin validación Zod** → vector de corrupción / XSS potencial.
6. **Ejercicios referenciados por `nombre`** → renombre rompe rutinas.
7. **Mezcla de estilos (Tailwind + inline + tokens)** → refactor cosmético doloroso.
8. **Archivos de 600-700 líneas** → bloquean colaboración y tests.
9. **Sin ErrorBoundary, sin Sentry, sin métricas.**
10. **React 19 / Vite 8** muy recientes → vigilar compatibilidad de libs al integrar (zustand 5, react-router 7, Supabase 2 confirmados OK).

---

## 9. Decisiones técnicas fijadas

| # | Decisión | Razón |
|---|---|---|
| D1 | Supabase puro al inicio; FastAPI solo cuando duela | Stripe/IA/jobs pesados justifican el extra |
| D2 | TanStack Query para datos servidor | Cache, sync, optimistic updates sin `useEffect` manuales |
| D3 | Zustand SOLO para UI efímera | Nada de datos de dominio persistidos |
| D4 | Zod para validación runtime | Una fuente de verdad tipos + validación |
| D5 | RLS obligatorio desde día 1 | Primera barrera; client-side gating es secundaria |
| D6 | Ejercicios referenciados por ID, no nombre | Integridad referencial |
| D7 | Modelo `Bloque → BloqueItem → SerieDef` | Soporta 100% de patrones de entrenamiento modernos |
| D8 | Unificar estilos (elegir Tailwind o inline) | **Pendiente de decidir explícitamente** |
| D9 | Tests con Vitest + @testing-library/react | Validators y stores primero |
| D10 | Observabilidad desde prod-day-1: Sentry + PostHog | No subir nada a prod sin esto |

---

## 10. Limpieza inmediata pendiente

Candidatos a borrar en cuanto se implemente la próxima fase:
- [src/components/admin/wizard/RoutineWizard.tsx](src/components/admin/wizard/RoutineWizard.tsx) (stub 3 líneas)
- [src/components/admin/wizard/WizardProgress.tsx](src/components/admin/wizard/WizardProgress.tsx) (stub 2 líneas)
- [src/components/admin/UnitManager.tsx](src/components/admin/UnitManager.tsx) (stub 3 líneas)
- `create-admin.js` en raíz (codegen viejo)
- Carpetas vacías: `src/components/common/`, `src/components/player/`, `src/components/workout/`, `src/components/admin/lists/`

Consolidar:
- Elegir `ExercisePicker` canónico ([src/components/admin/picker/ExercisePicker.tsx](src/components/admin/picker/ExercisePicker.tsx) o el embebido en `RoutinePage.tsx`).

---

## 11. Backlog vivo

### Siguiente tarea crítica
**Fase 2.5: Rediseño del modelo de Rutina** — bloqueante para todo lo demás.

### TODOs ordenados por prioridad

1. Rediseñar tipos `Rutina / Bloque / BloqueItem / SerieDef` en `src/types/`
2. Corregir pérdida de datos en `RoutinePage.handleSave` (`tipo`, `rest_between_sets`, `notes`)
3. Migrar `EjercicioRutina.nombre` → `ejercicio_id`
4. Extraer `Step1..5` y `ExercisePicker` de `RoutinePage.tsx`
5. Añadir Zod para validadores + `importData` + seeds
6. Descomentar y cablear Supabase client + `.env`
7. Reescribir `AuthContext` con Supabase real + roles
8. Schema Postgres + RLS policies
9. TanStack Query + migración de stores de datos
10. Tablas `sessions` + `session_sets` + escritura desde `useWorkoutStore`
11. Gating por rol (`/admin/*`)
12. `trainer_client_links` + migrar `UserPlansPage`
13. Stripe + Edge Function webhook + `subscriptions`
14. Limpieza de código muerto (ver sección 10)

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
