---
name: design-fitpro
description: Aplica la guía visual y de UI de FitPro (tokens CSS, componentes fp-*, tipografía, layout móvil, iconos Lucide, modo claro/oscuro). Usar al crear o modificar pantallas, componentes, estilos o cuando el usuario pida coherencia visual con el proyecto.
---

# Diseño FitPro

## Cuándo aplicar

- Nuevas páginas o componentes en `src/`.
- Ajustes de espaciado, jerarquía tipográfica, estados hover/focus, modo claro.
- El usuario pide que algo “se vea como el resto de la app” o “al estilo FitPro”.

## Fuente de verdad

1. **Tokens y utilidades globales:** `src/index.css` (`:root`, `:root.light`, clases `fp-*`, `badge*`, `auth-*`, animaciones).
2. **Patrones vivos:** `src/components/layout/Navbar.tsx`, `src/pages/admin/AdminDashboardPage.tsx`.
3. **Proyecto:** `CLAUDE.md` — código nuevo: preferir **Tailwind** cuando baste; si el archivo ya mezcla `style={{}}` con tokens, **mantener el mismo patrón** en esa zona para no romper coherencia local.

## Identidad visual

- **Marca:** verde (`--brand`, gradientes `#22c55e` → `#15803d` o `#4ade80`). No sustituir por otros verdes “neón” arbitrarios salvo acento puntual ya usado en la pantalla.
- **Superficies:** `--bg-app`, `--bg-base`, `--bg-elevated`, `--bg-card`, `--bg-overlay`; texto `--text-primary` / `--text-secondary` / `--text-muted`.
- **Acentos por área (referencia):** inicio/brand `#22c55e`, biblioteca `#58a6ff`, admin `#a371f7` — mismos tonos que bottom nav / stats del dashboard.
- **Tipografía:** cuerpo **DM Sans** (por defecto en `:root`); títulos y cifras destacadas: **`font-sora`** + peso 700–800 y `letter-spacing` ligeramente negativo en hero.
- **Iconos:** `lucide-react`, tamaños típicos 14–18px en listas/cards, 16px en nav.

## Layout

- **Ancho contenido app:** `className="max-w-md mx-auto"` + padding horizontal ~16px; reservar **padding-top** bajo navbar fijo (~70px) y **padding-bottom** si hay bottom nav móvil (~80px).
- **Navbar superior:** `fp-glass fixed top-0 ... z-50`, altura ~58px.
- **Bottom nav (móvil):** `fixed bottom-0 ... md:hidden`, blur + borde superior con `var(--border)`.

## Componentes reutilizables (preferir antes de inventar)

| Necesidad | Clase / patrón |
|-----------|----------------|
| Contenedor elevado | `fp-card` (+ `fp-card-hover` si es clickable) |
| Barra superior difuminada | `fp-glass` |
| Campo texto | `fp-input` |
| Campo con icono (búsqueda) | `fp-input-group` |
| Etiqueta de formulario | `fp-cal-label` |
| Botón | `fp-btn` + `fp-btn-primary` / `fp-btn-secondary` / `fp-btn-ghost` |
| Progreso | `fp-progress-track` + `fp-progress-fill` |
| Píldora estado | `badge badge-brand` (o `badge-blue` si encaja el contexto) |
| Dificultad | `diff-beginner` / `diff-intermediate` / `diff-advanced` |
| Entrada animada | `animate-slide-up` + `delay-100` / `delay-150` / … |
| Título con marca | `text-gradient` o `text-gradient-brand` en span dentro de `font-sora` |

Auth y admin tienen bloques `.auth-*` y `.fp-admin-*` en `index.css`: reutilizarlos en flujos equivalentes en lugar de duplicar reglas.

## Formularios y modales (Sheet)

- **Inputs:** `fp-input` (min-height 44px, fondo `--bg-elevated`, borde `--border`, radio 11px, focus con anillo `--brand-dim`). Textareas: `fp-input resize-none`.
- **Botones:** `fp-btn fp-btn-primary` (CTA), `fp-btn-secondary` (cancelar), `fp-btn-ghost` (iconos).
- **Labels:** `fp-cal-label` (11px semibold, `--text-secondary`).
- **Búsqueda con icono:** `fp-input-group` envolviendo icono Lucide + `<input>`.
- **No inventar** campos con `px-3.5 py-2.5 rounded-xl` + `background: var(--bg-overlay)`.
- **Sheet con formulario:** usar `flexColumn`; cuerpo `overflow-y-auto min-h-0 flex-1`; CTA `shrink-0` fijo abajo. Referencia: [`CitaForm.tsx`](../../src/components/calendar/CitaForm.tsx) + sheet en [`CalendarPage.tsx`](../../src/pages/CalendarPage.tsx).
- **Z-index:** Sheet default 60 (navbar/bottom nav = 50).

## Forma y ritmo

- **Radios:** cards ~14–15px; inputs ~11–12px; “chips” y iconos contenedor ~9–11px; botones ~10px (`fp-btn`).
- **Sombras:** `var(--shadow-sm)` / `var(--shadow-md)`; CTA primario puede usar sombra con tinte marca (`fp-btn-primary`).
- **Bordes:** `1px solid var(--border)`; hover sutil con tinte verde `rgba(34,197,94,.15–.25)` donde ya se hace en cards/botones.
- **Focus:** inputs ya usan `var(--border-focus)` y anillo `var(--brand-dim)` en `.fp-input:focus` — no eliminar foco visible.

## Tema claro / oscuro

- El modo se controla con clase **`light`** en `document.documentElement` (`ThemeProvider`). Estilos deben depender de **variables CSS** (`var(--…)`) o clases que ya alternan en `:root.light`, no de colores hardcodeados solo para dark.
- **Excepción habitual:** fondos con alpha fijos en bottom nav (`rgba(13,17,23,.9)`) — al tocarlos, comprobar contraste en modo claro o alinear con `fp-glass`.

## Copy e i18n

- **UI en español** (etiquetas, placeholders, vacíos, errores).
- Tono: directo, motivador fitness, sin exceso de marketing.

## Checklist rápida (nueva UI)

- [ ] Colores y fondos vía variables o clases existentes en `index.css`.
- [ ] Tipografía: DM Sans por defecto; Sora en títulos/ KPIs que marquen el patrón dashboard.
- [ ] Espaciado y `max-w-md` alineados con el shell principal.
- [ ] Iconos Lucide, tamaño y color acordes al estado (activo = acento, inactivo = `--text-muted`).
- [ ] Formularios: `fp-input` / `fp-btn`; modales con CTA visible en móvil.
- [ ] Estados hover/active/focus y transiciones ~0.15–0.2s como en `fp-btn` / `fp-card-hover`.
- [ ] Probar o visualizar mentalmente **modo claro** (`:root.light`).

## Anti-patrones en este repo

- Introducir paleta distinta (p. ej. `tailwind.config` `neon-*`) para pantallas core sin motivo; el producto se ancla a los tokens de `index.css`.
- Nuevos “design systems” paralelos (otro prefijo de botones/cards) en la misma app shell.
- Quitar accesibilidad de foco o contrastes solo por estética.
