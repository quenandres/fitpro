# CLAUDE.md — Contexto del proyecto FitPro

> Archivo de arranque para el asistente. Contiene el mínimo indispensable para
> trabajar sin romper nada. Para el deep-dive (diagnóstico, modelo objetivo,
> fases, ADR, backlog) leer siempre **[CONTEXT.md](./CONTEXT.md)** — es la
> fuente de verdad. Este archivo es el *resumen ejecutivo*.
>
> Última revisión: 2026-04-20

---

## 1. Qué es FitPro

SaaS fitness donde entrenadores crean rutinas/ejercicios/planes semanales y
clientes los ejecutan y ven progreso. Modelo comercial por nº de clientes
(Free / Pro / Gym).

- **Idioma por defecto:** español (UI, commits, docs, nombres de variables de dominio).
- **Estado del MVP:** ~25-30% real (pese al pulido visual que sugiere más).
  Ver `CONTEXT.md §2` para el detalle.

---

## 2. Stack

| Capa | Hoy | Objetivo |
|---|---|---|
| UI | React 19 + Vite 8 + TypeScript 5.9 | — |
| Routing | `react-router-dom` v7 | — |
| Estado UI efímero | Zustand 5 | Zustand (solo UI) |
| Estado servidor | — (stores con `persist` en localStorage) | TanStack Query |
| Validación runtime | — | Zod |
| Backend | **ninguno** (cliente Supabase comentado) | Supabase (Postgres + Auth + Storage + Edge Functions) |
| Estilos | Tailwind 4 + inline styles + tokens CSS (mezclados) | Unificar (pendiente D8) |
| Pagos | — | Stripe |
| Observabilidad | — | Sentry + PostHog |
| Tests | — | Vitest + @testing-library/react |

Dependencias clave ya instaladas: `@supabase/supabase-js ^2.103`,
`lucide-react`, `zustand ^5`, `react-router-dom ^7`.

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
│   │   ├── admin/         # CRUD rutinas/ejercicios/unidades, wizard, picker
│   │   ├── anatomy/
│   │   ├── common/        # (vacía — candidata a limpieza)
│   │   ├── dashboard/
│   │   ├── exercise/
│   │   ├── layout/        # Navbar, ThemeToggle
│   │   ├── library/       # (vacía)
│   │   ├── player/        # (vacía)
│   │   └── workout/       # (vacía)
│   ├── context/           # AuthContext (MOCK), ThemeContext
│   ├── data/              # ejercicios.json, rutinas.json, unidades.json
│   ├── hooks/             # useUnits
│   ├── lib/               # supabase.ts (COMENTADO)
│   ├── pages/             # Admin, Dashboard, RoutinePage, WorkoutPlayer, ...
│   ├── store/             # useDataStore (persist), useWorkoutStore (NO persist)
│   ├── types/             # index.ts (modelo actual POBRE)
│   └── utils/             # validators, suggestions, routineMuscles
├── CONTEXT.md             # Fuente de verdad del estado/roadmap
├── CLAUDE.md              # Este archivo
├── create-admin.js        # Script legacy (candidato a borrar)
├── docker-compose.yml
└── Dockerfile
```

Carpetas vacías (`common/`, `library/`, `player/`, `workout/`,
`admin/lists/`) y stubs de 2-3 líneas (`RoutineWizard.tsx`,
`WizardProgress.tsx`, `UnitManager.tsx`) son **código muerto** — ver
`CONTEXT.md §10`.

---

## 4. Comandos

```bash
npm install
npm run dev                 # Vite dev server en http://localhost:5173
npm run build               # tsc -b && vite build
npm run lint                # ESLint
npm run preview
npm run download:anatomy    # descarga SVGs de anatomía

docker-compose up --build   # alternativa en contenedor
```

Variables de entorno: copiar `.env.example` → `.env`. Ver
`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (hoy **no se usan** porque el
cliente Supabase está comentado).

---

## 5. Advertencias críticas (leer antes de editar)

1. **Auth es un mock.** `src/context/AuthContext.tsx` escribe
   `localStorage.setItem('fitpro-auth', 'true')` tras un `setTimeout(600)`.
   Cualquier email/password entra. OAuth social es decorativo.
2. **No hay roles.** `/admin`, `/admin/rutina`, `/admin/planes` están abiertos
   a cualquier usuario autenticado.
3. **Supabase está comentado** en `src/lib/supabase.ts`. No importar/usarlo
   hasta la Fase 3 del roadmap.
4. **Pérdida silenciosa de datos en el wizard.** `RoutinePage.handleSave`
   descarta `tipo` (emom/amrap/fortime/circuit), `rest_between_sets` y
   `notes`. Ver `CONTEXT.md §2` (bug presente hoy).
5. **Ejercicios referenciados por `nombre: string`**, no por ID. Renombrar un
   ejercicio rompe todas las rutinas. Migración a `ejercicio_id: number`
   planificada en Fase 2.5.
6. **`useWorkoutStore` no persiste.** No existe historial de entrenos: al
   refrescar se pierde peso/RPE/reps/duración. **Sin esto no hay producto.**
7. **`UserPlansPage` usa `useState(usuariosData)`** — se pierde todo al
   recargar. No asumir que persiste.
8. **Modelo de datos pobre.** `EjercicioRutina` = `{ nombre, series, valor,
   unidad_id }`. No soporta peso por serie, RPE, %1RM, tempo, dropsets,
   supersets, circuitos, EMOM/AMRAP, warmup vs working. **Debe rediseñarse
   antes de tocar Supabase** (Fase 2.5, bloqueante).
9. **`importData` no valida** — acepta cualquier JSON (vector de corrupción).
10. **Páginas god** (600-700 líneas): `RoutinePage.tsx`, `WorkoutPlayer.tsx`,
    etc. Al editar, extraer componentes en vez de seguir engordando.

---

## 6. Convenciones y decisiones fijadas

Extracto de `CONTEXT.md §9`. No desviarse sin abrir una ADR nueva allí.

- **D1** — Supabase puro al inicio; FastAPI solo cuando duela.
- **D2** — TanStack Query para datos servidor (al introducir).
- **D3** — Zustand **solo** para UI efímera (wizard, player runtime, modales).
  Nada de datos de dominio persistidos en localStorage cuando haya server.
- **D4** — Zod para validación runtime de todo lo que entra del exterior
  (form, import, respuestas server).
- **D5** — RLS obligatorio desde día 1. Client-side gating es barrera
  secundaria.
- **D6** — Ejercicios referenciados por ID, nunca por nombre.
- **D7** — Modelo `Rutina → Bloque[] → BloqueItem[] → SerieDef[]`
  (ver `CONTEXT.md §5` para el shape completo).
- **D8** — Unificar estilos (Tailwind vs inline vs tokens) — **pendiente de
  decidir explícitamente**. Por ahora: preferir Tailwind en código nuevo.
- **D9** — Tests con Vitest + @testing-library/react; validators y stores
  primero.
- **D10** — No subir nada a prod sin Sentry + PostHog.

### Convenciones de código

- TypeScript estricto. Evitar `any`; preferir `unknown` + narrow o tipos
  explícitos.
- Componentes en PascalCase, hooks en `useCamelCase`, stores `useXxxStore`.
- Nombres de dominio en español (`Rutina`, `Ejercicio`, `Bloque`,
  `SerieDef`). Nombres técnicos en inglés.
- No crear archivos nuevos si editar uno existente basta.
- No agregar comentarios que narren el código; solo comentar intención no
  obvia, trade-offs o restricciones.
- Al editar una página god, **extraer** en vez de seguir agregando.

---

## 7. Rutas principales

Definidas en `src/App.tsx`:

- Públicas: `/login`, `/register`.
- Protegidas: `/` (Dashboard), `/admin`, `/admin/rutina`, `/admin/planes`,
  `/admin/unidades`, `/library`, `/workout/:id`, `/workout/:id/play`,
  `/anatomy`.

Hoy sin gating por rol — pendiente tras Fase 3.

---

## 8. Roadmap resumido

Detalle en `CONTEXT.md §7`. Estado actual:

1. Fase 1 — Base del sistema (UI, routing, theming) → **~95%**
2. Fase 2 — CRUD local → **~70%**
3. **Fase 2.5 — Rediseño del modelo → 0% [BLOQUEANTE]**
4. Fase 3 — Supabase + Auth real + TanStack Query → 0%
5. Fase 4 — Tracking real de sesiones (historial) → ~10%
6. Fase 5 — Multi-tenant entrenador ↔ cliente → ~5%
7. Fase 6 — Monetización (Stripe) → 0%
8. Fase 7 — Analytics + IA + móvil → 0%

**Siguiente tarea crítica:** Fase 2.5 — rediseñar tipos
`Rutina / Bloque / BloqueItem / SerieDef` en `src/types/`. Todo lo demás
depende de esto.

---

## 9. Cómo trabajar con este repo (protocolo para el asistente)

1. Al arrancar una tarea, leer este `CLAUDE.md` y la sección relevante de
   `CONTEXT.md`.
2. Si la tarea toca datos de dominio (rutinas, ejercicios, sesiones),
   **revisar antes el modelo actual en `src/types/index.ts`** y tener presente
   el modelo objetivo (`CONTEXT.md §5`).
3. Si la tarea implica Supabase o auth real: **estás entrando a Fase 3**. No
   hacerlo sin Fase 2.5 completada (riesgo: doble migración). Avisar al
   usuario.
4. Al completar una tarea relevante:
   - Si es una decisión técnica → añadirla a `CONTEXT.md §13` (ADR).
   - Si es contexto nuevo de negocio/feedback → `CONTEXT.md §12` con fecha.
   - Si cambia el estado de una fase → actualizar `%` en `CONTEXT.md §7`.
5. Nunca borrar código "por estética". Si es código muerto, confirmarlo
   contra `CONTEXT.md §10` antes.
6. No commitear sin que el usuario lo pida explícitamente.

---

## 10. Archivos de referencia rápida

- [CONTEXT.md](./CONTEXT.md) — fuente de verdad completa.
- [README.md](./README.md) — documentación del modelo de datos actual y
  comandos.
- [src/App.tsx](./src/App.tsx) — routing.
- [src/types/index.ts](./src/types/index.ts) — modelo de datos actual
  (a rediseñar).
- [src/lib/supabase.ts](./src/lib/supabase.ts) — cliente Supabase
  (comentado).
- [src/context/AuthContext.tsx](./src/context/AuthContext.tsx) — auth mock.
- [src/store/useDataStore.ts](./src/store/useDataStore.ts) — CRUD local.
- [src/store/useWorkoutStore.ts](./src/store/useWorkoutStore.ts) — runtime
  del player (sin persistencia).
- [src/pages/RoutinePage.tsx](./src/pages/RoutinePage.tsx) — wizard god (683
  líneas), contiene el bug de pérdida de datos.
- [src/utils/validators.ts](./src/utils/validators.ts) — validadores del
  wizard (reutilizables).
