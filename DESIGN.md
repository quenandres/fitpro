# DESIGN.md — Guía de diseño FitPro

> Fuente de verdad para **crear y modificar pantallas** en FitPro. El asistente
> debe leer este archivo **antes** de tocar UI en `src/`. Para contexto de
> producto y arquitectura, ver [CONTEXT.md](./CONTEXT.md); para el resumen
> operativo, [CLAUDE.md](./CLAUDE.md).
>
> Última revisión: 2026-09-04

---

## 1. Principios

FitPro es un SaaS fitness **mobile-first** con identidad oscura y acentos verdes.
La UI debe sentirse coherente, directa y motivadora — nunca genérica ni
“plantilla de dashboard”.

| Principio | Qué implica |
|-----------|-------------|
| **Tokens primero** | Colores, fondos y bordes vía variables CSS (`var(--…)`) o clases `fp-*`. No hardcodear paletas nuevas. |
| **Componentes antes que CSS custom** | Reutilizar `AppShell`, `Sheet`, `EmptyState`, `fp-btn`, etc. antes de inventar variantes. |
| **Mobile-first real** | CTA visible sin scroll, bottom nav, FAB cuando aplique, touch targets ≥ 44px. |
| **Español en la UI** | Etiquetas, vacíos, errores y toasts en español. Tono directo, sin marketing vacío. |
| **Accesibilidad mínima** | Foco visible, `aria-label` en iconos, `role` en estados vacío/error, respetar `prefers-reduced-motion`. |
| **Coherencia local** | Código nuevo: preferir Tailwind + tokens. Si el archivo ya mezcla `style={{}}`, mantener el patrón local. |

---

## 2. Identidad visual

### Marca

- **Verde marca:** `--brand` (`#22c55e` dark / `#1a7f37` light).
- **Gradientes de logo/CTA:** `#22c55e` → `#15803d` o `#4ade80` → `#22c55e`.
- **No** introducir verdes neón arbitrarios ni paletas paralelas (p. ej. `neon-*`).

### Tipografía

| Rol | Fuente | Uso |
|-----|--------|-----|
| Cuerpo | **DM Sans** (default en `:root`) | Texto, formularios, listas |
| Display | **Sora** (`font-sora`) | Títulos de página, KPIs, cifras destacadas |

Títulos hero: peso 700–800, `letter-spacing` ligeramente negativo. Acentos de
marca con `text-gradient` o `text-gradient-brand`.

### Acentos por área

Referencia viva en la bottom nav y stats del dashboard:

| Área | Color |
|------|-------|
| Inicio / marca | `#22c55e` |
| Usuarios / biblioteca (info) | `#58a6ff` |
| Rutinas / admin | `#a371f7` |
| Calendario | `#f0883e` |
| Comunidades | `#f778ba` |

Usar el acento del módulo en iconos activos, barras laterales (`fp-accent-bar`)
o badges contextuales — no mezclar acentos al azar en la misma pantalla.

### Iconos

- Librería: **`lucide-react`** exclusivamente.
- Tamaños habituales: 14–18px en listas/cards, 16px en nav, 24–26px en estados vacío/error.

---

## 3. Tokens y estilos

**Archivo canónico:** [`src/index.css`](src/index.css) — `:root`, `:root.light`,
`@theme`, clases `fp-*`, `badge*`, `auth-*`, animaciones.

### Superficies

| Token | Uso |
|-------|-----|
| `--bg-app` | Fondo general de la app |
| `--bg-base` | Base alternativa |
| `--bg-elevated` | Inputs, superficies elevadas |
| `--bg-card` | Cards (`fp-card`) |
| `--bg-overlay` | Botones secundarios, chips, fondos sutiles |

### Texto

| Token | Uso |
|-------|-----|
| `--text-primary` | Títulos, contenido principal |
| `--text-secondary` | Labels, subtítulos |
| `--text-muted` | Placeholders, metadatos, iconos inactivos |

### Tailwind 4

Los tokens están mapeados en `@theme` — usar utilidades como `bg-app`,
`text-primary`, `text-brand`, `border-line`, `font-sora` cuando baste.

### Tema claro / oscuro

- Controlado con clase **`light`** en `document.documentElement` (`ThemeProvider`).
- Todo color de UI debe funcionar en ambos modos vía variables CSS.
- Al tocar fondos con alpha fijos (p. ej. bottom nav), comprobar contraste en modo claro.

---

## 4. Layout y shell

### AppShell

Toda pantalla autenticada debe envolverse en [`AppShell`](src/components/layout/AppShell.tsx):

```tsx
<AppShell width="default">
  {/* contenido */}
</AppShell>
```

| Prop | Cuándo |
|------|--------|
| `width="narrow"` | Formularios de rutina, chat IA |
| `width="default"` | Mayoría de pantallas |
| `width="wide"` | Dashboard, calendario, planes de usuario |
| `subNav` | Subnavegación (p. ej. `LibrarySubNav`) |
| `hideBottomNav` | Player inmersivo, pantallas fullscreen |

Anchos definidos en [`shellWidth.ts`](src/components/layout/shellWidth.ts):

- `narrow`: `max-w-md`
- `default`: `max-w-md md:max-w-3xl lg:max-w-5xl`
- `wide`: `max-w-md md:max-w-4xl lg:max-w-7xl`

Padding estándar del `<main>`: `px-4 md:px-6 lg:px-8`, `pt-[70px]` (navbar),
`pb-24 md:pb-10` (espacio bottom nav móvil).

### Navbar y navegación

- **Top:** `fp-glass fixed top-0 … z-50`, altura 58px.
- **Bottom (móvil):** `fixed bottom-0 … md:hidden`, blur + borde `var(--border)`.
- Referencia: [`Navbar.tsx`](src/components/layout/Navbar.tsx).

### Z-index

| Capa | z-index |
|------|---------|
| FAB | 40 |
| Navbar / Bottom nav | 50 |
| Sheet (default) | 60 |
| Toast | 100 |

---

## 5. Anatomía de una pantalla

Patrón recomendado para páginas nuevas:

```
AppShell
├── [opcional] Hero / header de página
│   ├── eyebrow o badge contextual
│   ├── título (font-sora)
│   └── subtítulo (--text-secondary)
├── [opcional] Barra de acciones (búsqueda, filtros, CTAs)
├── Contenido principal
│   ├── lista de fp-card
│   ├── grid responsivo
│   └── o estado vacío / error / skeleton
└── [móvil] FAB o CTA fijo si la acción principal no cabe arriba
```

### Referencias vivas por tipo

| Tipo | Archivo |
|------|---------|
| Dashboard / inicio | [`AdminDashboardPage.tsx`](src/pages/admin/AdminDashboardPage.tsx) |
| Layout con subnav | [`LibraryLayout.tsx`](src/components/library/LibraryLayout.tsx) |
| Calendario (desktop + móvil) | [`CalendarPage.tsx`](src/pages/CalendarPage.tsx) |
| Auth | clases `.auth-*` en `index.css` + páginas login/register |
| Comunidades (feed) | [`CommunitiesExplorePage.tsx`](src/pages/communities/CommunitiesExplorePage.tsx) |

### Entrada animada

Escalonar con `animate-slide-up` + `delay-100` / `delay-150` / … en secciones
del hero y cards. Respetar `@media (prefers-reduced-motion: reduce)`.

---

## 6. Componentes reutilizables

**Preferir siempre** estos antes de crear variantes nuevas.

### Superficies y contenedores

| Necesidad | Clase / componente |
|-----------|-------------------|
| Card | `fp-card` (+ `fp-card-hover` si es clickable) |
| Barra difuminada | `fp-glass` |
| Barra lateral de acento | `fp-accent-bar` |
| Progreso | `fp-progress-track` + `fp-progress-fill` |
| Overlay / modal | [`Sheet`](src/components/common/Sheet.tsx) |

### Formularios

| Elemento | Clase |
|----------|-------|
| Input | `fp-input` |
| Textarea | `fp-input resize-none` |
| Búsqueda con icono | `fp-input-group` |
| Label | `fp-cal-label` |
| CTA principal | `fp-btn fp-btn-primary` |
| Cancelar | `fp-btn fp-btn-secondary` |
| Icono / terciario | `fp-btn fp-btn-ghost` |

**Referencia canónica de formulario en Sheet:**
[`CitaCreateSheet.tsx`](src/components/calendar/CitaCreateSheet.tsx).

### Badges y estado

| Uso | Clase |
|-----|-------|
| Píldora genérica | `badge badge-brand` o `badge-blue` |
| Dificultad | `diff-beginner` / `diff-intermediate` / `diff-advanced` |

### Estados de página

| Estado | Componente |
|--------|------------|
| Vacío | [`EmptyState`](src/components/common/EmptyState.tsx) |
| Error | [`ErrorState`](src/components/common/ErrorState.tsx) |
| Carga | [`Skeleton`](src/components/common/Skeleton.tsx) |
| Confirmación | [`ConfirmDialog`](src/components/common/ConfirmDialog.tsx) |
| Menú contextual | [`ActionMenu`](src/components/common/ActionMenu.tsx) |

### Acciones móviles

| Patrón | Componente / uso |
|--------|------------------|
| Acción flotante | [`Fab`](src/components/common/Fab.tsx) — posición sobre bottom nav |
| Menú de acciones | `CalendarActionSheet` pattern en calendario |
| Toast | [`ToastProvider`](src/components/common/Toast.tsx) / `useToastHook` |

---

## 7. Formularios y Sheet

### Reglas de formulario

1. **Siempre** `fp-input` + `fp-btn` — no recrear campos con
   `bg-overlay` + `rounded-xl` sueltos.
2. Labels con `fp-cal-label` (11px semibold, `--text-secondary`).
3. Errores de validación: texto corto debajo del campo o banner con
   `--accent-red`; explicar qué corregir, no disculparse.
4. CTA de envío con verbo activo: «Guardar cambios», «Agendar cita», «Crear rutina».

### Sheet con formulario largo

```tsx
<Sheet open={open} onClose={onClose} flexColumn ariaLabel="Título del sheet">
  <form className="flex flex-col min-h-0 flex-1" onSubmit={handleSubmit}>
    {/* Header fijo opcional */}
    <div className="overflow-y-auto min-h-0 flex-1 px-5 pt-5 space-y-4">
      {/* campos */}
    </div>
    {/* CTA fijo abajo — visible en móvil sin scroll */}
    <div className="shrink-0 px-5 pb-5 pt-3 border-t border-line">
      <button type="submit" className="fp-btn fp-btn-primary w-full">
        Guardar
      </button>
    </div>
  </form>
</Sheet>
```

Props clave de `Sheet`:

- `flexColumn={true}` — scroll interno en hijos.
- `immersive={true}` — fullscreen en móvil (player, flujos largos).
- `zIndex={60}` — default; no bajar bajo navbar.

---

## 8. Forma, ritmo y motion

### Radios

| Elemento | Radio |
|----------|-------|
| Cards | ~14–15px (`fp-card`) |
| Inputs | ~11px |
| Botones | ~10px (`fp-btn`) |
| Chips / icon containers | ~9–11px |
| FAB | circular |

### Sombras y bordes

- Sombras: `var(--shadow-sm)` / `var(--shadow-md)`; CTA primario puede usar `--shadow-brand`.
- Bordes: `1px solid var(--border)`; hover sutil con tinte verde `rgba(34,197,94,.15–.25)`.
- Focus en inputs: anillo `var(--brand-dim)` — **no eliminar foco visible**.

### Transiciones

~0.15–0.2s en botones, cards y bordes. `:active` en botones con `scale(.97)`.

---

## 9. Copy y microcopy

- **Idioma:** español en toda la UI visible.
- **Tono:** directo, motivador fitness, profesional pero cercano.
- **Botones:** verbo + objeto («Crear rutina», «Asignar entrenamiento»).
- **Vacíos:** invitar a actuar («Aún no tienes rutinas» + CTA).
- **Errores:** qué pasó + cómo resolver («Selecciona al menos un cliente»).
- **Toasts:** mismo verbo que el botón que disparó la acción.

---

## 10. Patrones por módulo

### Biblioteca (`/library/*`)

- Usar `LibraryLayout` + `LibrarySubNav`.
- Ancho vía `resolveShellWidth(pathname)`.
- Hub con cards navegables; catálogos con búsqueda `fp-input-group`.
- Formularios de rutina en `width="narrow"`.

### Calendario (`/calendario`)

Dos flujos **separados** — no mezclar en un solo sheet:

1. **Agendar cita** — `CitaCreateSheet` (tipo `entrenamiento` | `medidas`, multi-cliente).
2. **Asignar entrenamiento** — `AsignarEntrenoSheet` (rutina obligatoria, muta plan).

Desktop: dos CTAs en header. Móvil: FAB → `CalendarActionSheet`.

### Comunidades (`/communities/*`)

- UI mock sobre `useCommunitiesStore`; seguir patrones visuales del resto de la app.
- Header propio (`CommunityHeader`) pero mismos tokens y `fp-*`.
- No confundir roles de comunidad con RBAC de plataforma.

### Auth (`/login`, `/register`)

- Usar bloques `.auth-page`, `.auth-container`, `.auth-logo`, etc. de `index.css`.
- Centrado vertical, `max-width: 400px`, glow de fondo `.auth-bg-glow`.

### Admin / dashboard (`/`)

- `AppShell width="wide"`.
- Clases `.fp-admin-*` en `index.css` para stats, grids y briefing.
- KPIs con `font-sora`; acento púrpura para métricas admin.

---

## 11. Responsive

| Breakpoint | Comportamiento típico |
|------------|----------------------|
| `< md` (móvil) | Bottom nav visible, FAB, sheets bottom-sheet, CTAs full-width |
| `≥ md` | Bottom nav oculta, nav superior expandida, sheets como modal centrado |
| `≥ lg` | Grids de 2–3 columnas, más aire horizontal |

Usar `useMediaQuery` cuando la lógica (no solo estilo) dependa del viewport.

---

## 12. Checklist — nueva pantalla

Antes de dar por terminada una pantalla:

- [ ] Envuelta en `AppShell` con `width` correcto.
- [ ] Tokens CSS / clases `fp-*` — sin colores sueltos incompatible con tema claro.
- [ ] Tipografía: DM Sans cuerpo, Sora en título/KPIs.
- [ ] Iconos Lucide con tamaño y color de estado correctos.
- [ ] Formularios: `fp-input`, `fp-btn`, labels `fp-cal-label`.
- [ ] Modales: `Sheet` con CTA visible en móvil (`flexColumn` + `shrink-0`).
- [ ] Estados vacío, error y carga contemplados.
- [ ] Copy en español, tono FitPro.
- [ ] Foco visible y labels/aria en controles interactivos.
- [ ] Probado mentalmente (o en browser) en **modo claro** y **móvil**.

---

## 13. Anti-patrones

| No hacer | Por qué |
|----------|---------|
| Nueva paleta o prefijo de componentes (`btn-x`, `card-y`) | Fragmenta el design system |
| Inputs custom con Tailwind suelto | Rompe foco, altura táctil y tema claro |
| Sheet sin CTA fijo en móvil | Acción principal oculta tras scroll |
| Páginas god (>300 líneas) | Extraer componentes/hooks |
| Hardcodear colores solo para dark | Rompe `:root.light` |
| Quitar outline/focus por estética | Accesibilidad |
| Skeleton/Toast con estilos legacy (`bg-gray-700`, `text-white` fijos) | No respetan tokens — migrar oportunistamente |
| Mezclar sistemas de rol (comunidad vs plataforma) en la UI de permisos | Confunde auth real con mock |

---

## 14. Mantenimiento

- Cambios de tokens o nuevas clases `fp-*` → actualizar **`src/index.css`** y este archivo.
- Nuevo componente común reutilizable → añadirlo a §6 y a [`src/components/common/`](src/components/common/).
- Decisión visual que afecte convenciones globales → ADR en `CONTEXT.md §13`.
- Skill del asistente: [`.claude/skills/design-fitpro/SKILL.md`](.claude/skills/design-fitpro/SKILL.md) (resumen operativo; este doc manda).
