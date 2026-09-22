# DESIGN.md — Guía de diseño FitPro

> Fuente de verdad para **crear y modificar pantallas** en FitPro. El asistente
> debe leer este archivo **antes** de tocar UI en `src/`. Para contexto de
> producto y arquitectura, ver [CONTEXT.md](./CONTEXT.md); para el resumen
> operativo, [CLAUDE.md](./CLAUDE.md).
>
> Última revisión: 2026-09-07

---

## 1. Principios

FitPro es un SaaS fitness **mobile-first**, anclado a un canvas casi negro
(`#060a06`) y a un único voltaje de marca: el verde `--brand` (`#22c55e`). Ese
verde carga cada CTA primario, cada fill de progreso y cada marca que significa
**actuar** — no el chrome de navegación. La nav usa acentos de módulo como
wayfinding (el entrenador sabe en qué área está). La tipografía confía en el
aire más que en el músculo: títulos de producto en **Sora 600–700 a 22–28px**;
Sora 800 solo en los roles nombrados de §4. No hay esquina dura salvo la
grilla del body.

La UI debe sentirse coherente, directa y motivadora — nunca genérica ni
“plantilla de dashboard”. Vocabulario de dominio: **cliente, plan, sesión,
entrenamiento, cita** — no listing, host, amenity ni reserva.

| Principio | Qué implica |
|-----------|-------------|
| **Un voltaje** | `--brand` es el único color de **acción primaria** (guardar, crear, asignar, progreso). Los acentos de módulo son wayfinding de nav/chrome, nunca el botón de enviar. |
| **Nav ≠ marca** | Item activo de nav = acento del módulo vía `var(--accent-*)` / `--brand` en Inicio. Inactivo = `--text-secondary`. Sin hex crudo. |
| **Tokens primero** | Colores vía `var(--…)`. No hardcodear paletas ni hex de dark en chrome que ignore `:root.light`. |
| **Componentes antes que CSS custom** | Reutilizar `AppShell`, `Sheet`, `EmptyState`, `fp-btn`, etc. antes de inventar variantes. |
| **Mobile-first real** | CTA visible sin scroll, bottom nav, FAB cuando aplique, touch targets ≥ 44px (salvo `fp-btn-sm` en chrome denso, §8). |
| **Aire sobre ornamentación** | Compacto en móvil, cómodo en desktop. Espacio en blanco es material, no desperdicio. |
| **Español en la UI** | Etiquetas, vacíos, errores y toasts en español. Tono directo, sin marketing vacío. |
| **Accesibilidad mínima** | Foco visible (`:focus-visible` en `fp-btn` e inputs), `aria-label` en iconos, `role` en vacío/error, `prefers-reduced-motion`. |
| **Coherencia local** | Código nuevo: Tailwind + tokens. Si el archivo ya mezcla `style={{}}`, mantener el patrón local. |

---

## 2. Identidad visual

### Marca

Un producto, un voltaje. El verde no se diluye en neones ni se reemplaza por
el acento del módulo en Guardar / Crear / Asignar.

- **Verde marca:** `--brand` (`#22c55e` dark / `#1a7f37` light).
- **Hover / brillo:** `--brand-bright` (`#4ade80` / `#2da44e`).
- **Sobre marca:** `--on-brand` (`#ffffff`) — texto e iconos encima del CTA.
- **Glow:** `--brand-glow` — halos suaves; el CTA usa `--shadow-brand`.
- **Gradientes de logo/CTA:** `var(--brand)` → `#15803d` o `--brand-bright` → `--brand`. Preferir tokens; no copiar hex de dark en light.
- **No** verdes neón arbitrarios ni paletas paralelas (`neon-*`).

### Tipografía

| Rol | Fuente | Uso |
|-----|--------|-----|
| Cuerpo | **DM Sans** (default en `:root`) | Texto, formularios, listas, botones |
| Display | **Sora** (`font-sora`) | Títulos de página, KPIs, tesis de pantalla |

Sora nombra la pantalla o canta un número. El resto es DM Sans. Display de
producto: **22–28px / 600–700**. Sora **800** solo en:

1. **`display-hero`** — saludo / tesis de la vista (`.fp-admin-briefing-title`, un h1 de roster).
2. **`.auth-title`** — wordmark de login/register.

No 800 en cards, sheets, labels ni KPIs. Escala en §4.

Acentos de marca en texto: `text-gradient` o `text-gradient-brand` — un span,
no un párrafo. Esas clases aún llevan hex de dark; no usarlas como texto
esencial en modo claro.

### Acentos por área (wayfinding)

Icono activo, fill de nav, `fp-accent-bar`, badge contextual.
**Nunca** el color del botón primario.

| Área | Token |
|------|-------|
| Inicio / marca | `--brand` |
| Usuarios / biblioteca | `--accent-blue` |
| Rutinas / planes / admin | `--accent-purple` |
| Calendario | `--accent-orange` |
| Comunidades | `--accent-pink` |
| Perfil | `--accent-teal` |

Referencia viva: [`Navbar.tsx`](src/components/layout/Navbar.tsx) (`NAV_ITEMS`
con `var(--…)`). El fill activo es `accent` + alpha (`${accent}1a`); el texto
activo es el mismo token.

### Iconos

- Librería: **`lucide-react`** exclusivamente.
- Tamaños: 14–18px en listas/cards, 16px en nav, 24–26px en vacío/error.
- Activo en nav = token del módulo; inactivo = `--text-muted` / `--text-secondary`.
- Contenedores circulares: `--bg-overlay` o `--bg-elevated`, `rounded-full`, 32–40px.

---

## 3. Tokens — Color

**Archivo canónico:** [`src/index.css`](src/index.css) — `:root`, `:root.light`,
`@theme`, clases `fp-*`, `badge*`, `auth-*`, animaciones.

Tailwind 4 mapea: `bg-app`, `text-primary`, `text-brand`, `border-line`,
`font-sora`, `accent-teal`.

### Superficies y texto

| Nombre | Dark | Light | Token | Rol |
|--------|------|-------|-------|-----|
| Canvas | `#060a06` | `#f6f8fa` | `--bg-app` | Fondo de página. |
| Base | `#0d1117` | `#ffffff` | `--bg-base` | Chrome (navbar en dark). |
| Elevated | `#161b22` | `#f6f8fa` | `--bg-elevated` | Inputs, un peldaño arriba. |
| Card | `#161b22` | `#ffffff` | `--bg-card` | Cards (`fp-card`). |
| Overlay | `#21262d` | `#eaeef2` | `--bg-overlay` | Chips, fondos sutiles. |
| Ink | `#e6edf3` | `#0d1117` | `--text-primary` | Títulos y contenido. |
| Body | `#8b949e` | `#57606a` | `--text-secondary` | Labels, subtítulos. |
| Muted | `#484f58` | `#8c959f` | `--text-muted` | Placeholders, iconos inactivos — **no cuerpo**. |

### Marca y acentos

| Nombre | Dark | Light | Token | Rol |
|--------|------|-------|-------|-----|
| Brand | `#22c55e` | `#1a7f37` | `--brand` | CTA, progreso, Inicio activo. |
| Brand bright | `#4ade80` | `#2da44e` | `--brand-bright` | Hover de primario. |
| Brand dim | `rgba(34,197,94,.12)` | `rgba(26,127,55,.08)` | `--brand-dim` | Anillo de foco, fills suaves. |
| Brand glow | `rgba(34,197,94,.25)` | `rgba(26,127,55,.15)` | `--brand-glow` | Halo (auth, orbes). |
| On brand | `#ffffff` | `#ffffff` | `--on-brand` | Texto/icono sobre `--brand`. |
| Info | `#58a6ff` | `#0969da` | `--accent-blue` | Usuarios / biblioteca. |
| Info dim | `rgba(88,166,255,.12)` | `rgba(9,105,218,.08)` | `--accent-blue-dim` | Fill suave de módulo. |
| Admin | `#a371f7` | `#8250df` | `--accent-purple` | Rutinas / planes. |
| Calendar | `#f0883e` | `#bc4c00` | `--accent-orange` | Calendario, dificultad intermedia. |
| Danger | `#f85149` | `#cf222e` | `--accent-red` | Error, destructivo, avanzado. |
| Community | `#f778ba` | `#bf3989` | `--accent-pink` | Comunidades. |
| Community dim | `rgba(247,120,186,.12)` | `rgba(191,57,137,.08)` | `--accent-pink-dim` | Fill suave comunidades. |
| Perfil | `#2dd4bf` | `#0f766e` | `--accent-teal` | Nav Perfil. |
| Sand | `#d2a679` | `#9a6700` | `--accent-sand` | Acento cálido puntual. |

### Bordes y sombras

| Nombre | Token | Rol |
|--------|-------|-----|
| Hairline | `--border` | Cards, inputs, divisores. |
| Hairline soft | `--border-subtle` | Separadores discretos. |
| Focus | `--border-focus` | Input con foco. |
| Shadow sm / md | `--shadow-sm` / `--shadow-md` | Elevación de card. |
| Shadow brand | `--shadow-brand` | Glow del CTA primario. |

### Tema claro / auditoría

- Clase **`light`** en `document.documentElement` (`ThemeProvider`).
- Todo chrome vía variables. **Prohibido** hex de dark (`#22c55e`, `#2dd4bf`,
  `rgba(34,197,94,…)` fijos) en nav, FAB, badges o gradientes que no cambien en
  `:root.light`.
- Canvas light = blanco roto (`#f6f8fa`), no crema. Cards light = blanco puro.

**Deuda de contraste (conocida):** `--text-muted` light (`#8c959f`) sobre
`--bg-app` (`#f6f8fa`) ≈ **2.9:1** — no cumple AA para texto. Usar muted solo
en placeholders e iconos inactivos. Labels y copy van en `--text-secondary` o
`--text-primary`. Fix previsto: oscurecer muted light a ≥4.5:1 (candidato
`#6e7781`) en un pase de tokens; no inventar un gris paralelo mientras tanto.

---

## 4. Tokens — Tipografía

**Familia primaria:** `'DM Sans', system-ui, sans-serif`.
**Familia display:** `'Sora', sans-serif` — `font-sora` / `--font-sora`.

Carga: Google Fonts en `index.css` (Sora 400–800, DM Sans 400–600).

### Escala

| Rol | Size | Line height | Tracking | Peso | Fuente | Uso |
|-----|------|-------------|----------|------|--------|-----|
| display-hero | 24px | 1.15 | −0.03em | **800** | Sora | Tesis de pantalla: `.fp-admin-briefing-title`, h1 de roster |
| display-xl | 28px | 1.2 | −0.4px | 700 | Sora | Cifras hero (no títulos de card) |
| display-lg | 22px | 1.18 | −0.3px | 700 | Sora | Título de página |
| display-md | 20px | 1.2 | −0.2px | 600 | Sora | Título de sección / sheet |
| title-md | 16px | 1.25 | 0 | 600 | Sora | Título de card |
| title-sm | 14px | 1.3 | 0 | 600 | Sora o DM Sans | Subtítulo de card, lista densa |
| kpi | 24px | 1.1 | −0.5px | 700 | Sora | Número de métrica (no 800) |
| body-md | 14px | 1.5 | 0 | 400 | DM Sans | Párrafo, descripción |
| body-sm | 13px | 1.43 | 0 | 400 | DM Sans | Default de producto |
| caption | 12px | 1.33 | 0 | 500 | DM Sans | Meta, timestamps |
| label | 11px | 1.27 | 0.2px | 600 | DM Sans | `fp-cal-label` (nombre legado; es el label global) |
| badge | 10px | 1.2 | 0 | 600 | DM Sans | `.badge` |
| micro | 10px | 1.2 | 0.4px | 600 | DM Sans | Tags uppercase, dificultad |
| button | 13px | 1.25 | 0 | 600 | DM Sans | `fp-btn` |
| nav | 13–14px | 1.25 | 0 | 600 | DM Sans | Links de nav |
| auth-title | 22px | 1.2 | — | **800** | Sora | Wordmark `.auth-title` |

Máximo **un** `display-hero` por vista autenticada. Cuerpo de producto:
**13–14px**. Subir a 16px solo en lectura larga. No inventar tamaños
(`text-[15px]`, `text-[17px]`).

---

## 5. Tokens — Espaciado y forma

**Densidad:** compacta en `< md`, cómoda en `≥ md`. El producto cabe en el
bolsillo; en desktop respira. Grillas de **semana / sesiones** son densas a
propósito (Operate): gap 12px, cards de entrenamiento con padding 14–16px, no
el aire de un hub de exploración.

### Escala de espacio

| Nombre | Valor | Uso típico |
|--------|-------|------------|
| xxs | 2px | Separación de badge interno |
| xs | 4px | Gap icono–label denso |
| sm | 8px | Gap de input-group, stacks cortos |
| md | 12px | Gap entre elementos de un grupo |
| base | 16px | Padding horizontal móvil, gap de form |
| lg | 24px | Padding de card / sheet, gap de sección móvil |
| xl | 32px | Gap de sección desktop |
| xxl | 48px | Separación de bloques mayores |
| section | 64px | Solo landing/auth hero; **no** en app shell móvil |

### Ritmo de layout

| Medida | Valor |
|--------|-------|
| Gap entre elementos | 12px |
| Padding de card | 16px móvil / 24px desktop (14px en chrome de plan) |
| Gap de sección | 24px móvil / 32px desktop |
| Padding de sheet | 20px (`px-5`) |
| Ancho máximo | según `AppShell` (§6) |

### Radios

| Nombre | Valor | Dónde |
|--------|-------|-------|
| none | 0 | Solo el canvas / grid |
| xs | 4px | Progress track |
| sm | 8px | Stats pills, menús densos |
| btn | 10px | `fp-btn` |
| input | 11px | `fp-input` |
| card | 15px | `fp-card` |
| fab-cal | 16px | Solo `.fp-cal-fab` (excepción calendario) |
| lg | 16–20px | Auth logo, sheets |
| xl | 32px | Orbes, search pill de hub |
| full | 9999px | Badges, FAB canónico, avatares, días de date picker |

---

## 6. Layout y shell

### AppShell

Toda pantalla autenticada: [`AppShell`](src/components/layout/AppShell.tsx).

| Prop | Cuándo |
|------|--------|
| `width="narrow"` | Formularios de rutina, chat IA, player |
| `width="default"` | Mayoría de pantallas |
| `width="wide"` | Dashboard, calendario, **usuarios / planes**, comunidades |
| `subNav` | Subnavegación (`LibrarySubNav`) |
| `hideBottomNav` | Player inmersivo, fullscreen |

Anchos en [`shellWidth.ts`](src/components/layout/shellWidth.ts):

- `narrow`: `max-w-md`
- `default`: `max-w-md md:max-w-3xl lg:max-w-5xl`
- `wide`: `max-w-md md:max-w-4xl lg:max-w-7xl`

`resolveShellWidth`: `/usuarios`, `/library/planes`, `/calendario` → `wide`;
rutina nueva / IA → `narrow`.

Padding `<main>`: `px-4 md:px-6 lg:px-8`, `pt-[70px]`, `pb-24 md:pb-10`.

### Navbar y navegación

- **Top:** `fp-glass fixed top-0 … z-50`, altura **58px**.
- **Bottom (móvil):** `fixed bottom-0 … md:hidden`, ~80px con safe area.
- **Activo:** color + fill del **token de módulo** (§2). No píldora `--brand`
  salvo Inicio. No ink-sobre-muted como único activo.
- Product tabs / subnav: underline o `fp-accent-bar` en el acento del módulo.
- Referencia: [`Navbar.tsx`](src/components/layout/Navbar.tsx).

### Z-index

| Capa | z-index |
|------|---------|
| FAB | 40 |
| Navbar / Bottom nav | 50 |
| Sheet (default) | 60 |
| Toast | 100 |
| Wizard inmersivo (`CreatePlanWizard`) | 100 — no apilar otro toast encima; preferir 60 si no cubre el toast |

---

## 7. Anatomía de una pantalla (Operate)

El entrenador llega a **hacer un trabajo**, no a ver un hero de marketing.
Patrón de listado:

```
AppShell
├── Tesis de pantalla (máx. un display-hero o display-lg)
│   ├── eyebrow / badge (label 11px)
│   ├── título
│   └── subtítulo body-sm (--text-secondary)
├── Barra de acciones (fp-input-group, filtros, un CTA --brand)
├── Contenido (lista fp-card / grilla / vacío / error / skeleton)
└── [móvil] FAB si la acción principal no cabe arriba
```

En **planes**, la tesis es el cliente + semana, no un KPI decorativo. Ver §12.

### Motion

~0.15–0.2s en estado (hover, borde, `:active` `scale(.97)`). Cards clickable:
`translateY(-2px)`, no scale. Respetar `prefers-reduced-motion`.

**No** coreografiar la entrada de un dashboard como landing (`animate-slide-up`
+ delays en cada bloque). Un stagger corto en el primer paint es opcional;
el producto carga en una tarea.

### Estados de control

Todo `fp-btn` / input / card interactiva: **default, hover, `:focus-visible`,
active, disabled, loading, error**. Disabled: bajar opacidad o `--brand-dim` +
muted; el primario disabled no se vuelve overlay genérico. Loading: deshabilitar
el CTA (evitar doble envío), no spinner en medio del contenido si hay skeleton.

### Persistencia

Stores de planes, citas y workout son **memoria de sesión** (sin guardado
real). No diseñar flujos que asuman “ya está en el servidor”: no prometas
autosave; un refresh pierde el draft. `DemoBadge` marca datos mock.

### Destructivo vs primario

CTA de envío = `--brand` a ancho completo, fijo abajo en Sheet. **Eliminar /
quitar / sobrescribir** va en ghost o texto `--accent-red`, nunca verde, y
pide `ConfirmDialog` si no hay undo.

### Tres vacíos distintos

| Vacío | Copy + CTA |
|-------|------------|
| Roster | «Aún no hay clientes» + Nuevo cliente (`UsuariosPage`) |
| Semana | «Esta semana aún no tiene datos en el plan.» (sin CTA de alta de cliente) |
| Sesión | Card de entrenamiento vacía: crear rutina **o** asignar existente |

No reutilizar el empty del roster dentro de una semana.

### Futuro (no implementar aquí)

Teclado, bulk assign, command palette: un párrafo de deuda. El power user
hoy replica con «aplicar a todas» / copiar semana en `PlanSessionNav`.

### Referencias vivas

| Tipo | Archivo |
|------|---------|
| Roster + plan | [`UsuariosPage.tsx`](src/pages/UsuariosPage.tsx) + [`UserPlanWorkspace.tsx`](src/components/users/UserPlanWorkspace.tsx) |
| Dashboard | [`AdminDashboardPage.tsx`](src/pages/admin/AdminDashboardPage.tsx) |
| Subnav | [`LibraryLayout.tsx`](src/components/library/LibraryLayout.tsx) |
| Calendario | [`CalendarPage.tsx`](src/pages/CalendarPage.tsx) |
| Auth | `.auth-*` en `index.css` |
| Comunidades | [`CommunitiesExplorePage.tsx`](src/pages/communities/CommunitiesExplorePage.tsx) |
| Sheet form | [`CitaCreateSheet.tsx`](src/components/calendar/CitaCreateSheet.tsx) |

---

## 8. Componentes — recetas

Preferir estas recetas. Geometría de `index.css`; no aplanar estados.

### Superficies

| Necesidad | Clase / componente |
|-----------|-------------------|
| Card | `fp-card` (+ `fp-card-hover` si es clickable) |
| Card de cliente | [`UserCard`](src/components/users/UserCard.tsx) — `fp-card` + acento azul |
| Card de entrenamiento | [`EntrenamientoCard`](src/components/userPlans/EntrenamientoCard.tsx) |
| Barra difuminada | `fp-glass` |
| Barra lateral de acento | `fp-accent-bar` (token del módulo) |
| Progreso | `fp-progress-track` + `fp-progress-fill` |
| Overlay | [`Sheet`](src/components/common/Sheet.tsx) |
| Mock / no persistido | [`DemoBadge`](src/components/common/DemoBadge.tsx) — usar `--accent-orange`, no hex |

### Botones

| Receta | Fondo | Texto | Radio | Padding | Alto |
|--------|-------|-------|-------|---------|------|
| **primary** `fp-btn fp-btn-primary` | `--brand` | `--on-brand` | 10px | 9×18 | min 44px |
| **secondary** `fp-btn fp-btn-secondary` | `--bg-overlay` | `--text-primary` | 10px | 9×18 | min 44px |
| **ghost** `fp-btn fp-btn-ghost` | transparent | `--text-secondary` | 10px | 9×18 | min 44px |
| **sm** `fp-btn-sm` | hereda variante | hereda | 10px | 4×10 | ver nota |
| **icon circle** | `--bg-overlay` | `--text-primary` | full | — | 32–40px |

- Tipografía: 13px / 600. `:active` → `scale(.97)`. Primario: `--shadow-brand`.
- **`:focus-visible`:** anillo 3px `--brand-dim` (obligatorio; no `outline: none` sin anillo).
- **`fp-btn-sm`:** aparece en chrome denso de plan (`EntrenamientoCard`,
  `PlanSessionNav`, `SesionEditorContent`). **Hoy no tiene CSS** — hereda 44px
  de `.fp-btn`. Si se define: `min-height: 32px`, solo toolbars de sesión/semana,
  **nunca** CTA de formulario ni Sheet footer. No usarlo en pantallas nuevas
  hasta que exista la clase en `index.css`.

### Volver de página interna

Componente: [`PageBackButton`](src/components/common/PageBackButton.tsx).

| Regla | Valor |
|-------|-------|
| Visual | `fp-btn fp-btn-ghost shrink-0 p-2` + `ChevronLeft` **20** (icono solo) |
| Destino | Padre **explícito** en el árbol de rutas (`to` o `onClick`) |
| Accesible | `aria-label="Volver a {destino}"` — verbo + destino, sin texto visible |
| Prohibido | `navigate(-1)`, `history.back`, `ArrowLeft`, label visible «Volver» |

**Cuándo usar:** pantallas internas con pila (detalle cliente, formulario de
rutina, hoja de comunidad). **No usar:** hubs (dashboard, roster, calendario),
Sheets (`X`), wizard multi-paso («Atrás»), chevrons de mes/semana/carrusel.

**Empty / error «no encontrado»:** mismo destino canónico que el volver de la
pantalla (p. ej. rutina inexistente → `ROUTES.library.rutinas`), no historial.

**Comunidades:** tabs de comunidad → home de la comunidad salvo en `/home` (→ explorar); hojas
(post/evento/discusión/create) → lista del tab vía [`communityBackUtils.ts`](src/utils/communityBackUtils.ts).
Usar [`PageBackRow`](src/components/common/PageBackButton.tsx) antes del título; botón cuadrado
44px (`.fp-page-back-btn`).

### FAB — uno, 56px

Canónico: 56×56, `z-40`, `--on-brand` sobre `--brand`, encima del bottom nav
(`bottom: calc(80px + env(safe-area-inset-bottom))`). Componente:
[`Fab.tsx`](src/components/common/Fab.tsx) — círculo (`rounded-full`).

**Excepción calendario:** `.fp-cal-fab` es 56px con radio **16px** (squircle) y
gradiente de marca. Permitido solo en `/calendario`. Al tocar ese CSS: tokens
(`--brand`, `--shadow-brand`), no hex de dark. Superficies nuevas usan `Fab`,
no copian el squircle.

### Campos

| Receta | Fondo | Radio | Alto |
|--------|-------|-------|------|
| **input** `fp-input` | `--bg-elevated` | 11px | min 44px |
| **search group** `fp-input-group` | `--bg-elevated` | 11px | min 44px |
| **search pill** (hubs) | `--bg-card` | full | 44–48px |
| **label** `fp-cal-label` | — | — | — |

Focus: borde `--border-focus` + anillo `--brand-dim`. Textarea: `fp-input resize-none`.

### Badges y estado

| Uso | Clase |
|-----|-------|
| Píldora marca | `badge badge-brand` |
| Info | `badge-blue` |
| Dificultad | `diff-beginner` / `diff-intermediate` / `diff-advanced` |
| Día date picker | círculo; seleccionado = ink invertido o `--brand` |

### Estados de página

| Estado | Componente |
|--------|------------|
| Vacío | [`EmptyState`](src/components/common/EmptyState.tsx) |
| Error | [`ErrorState`](src/components/common/ErrorState.tsx) |
| Carga | [`Skeleton`](src/components/common/Skeleton.tsx) |
| Confirmación | [`ConfirmDialog`](src/components/common/ConfirmDialog.tsx) |
| Menú | [`ActionMenu`](src/components/common/ActionMenu.tsx) |
| Toast | [`ToastProvider`](src/components/common/Toast.tsx) |

Auth: bloques `.auth-*`. Admin: `.fp-admin-*`. Planes: `.fp-user-*` (no
inventes un tercer prefijo).

---

## 9. Formularios y Sheet

1. Siempre `fp-input` + `fp-btn` — no recrear campos con `bg-overlay` +
   `rounded-xl` sueltos.
2. Labels `fp-cal-label`.
3. Error: texto bajo el campo o banner `--accent-red`; qué corregir, no
   disculparse.
4. CTA con verbo activo: «Guardar cambios», «Agendar cita», «Crear cliente».
5. Alto táctil ≥ 44px en formularios.

```tsx
<Sheet open={open} onClose={onClose} flexColumn ariaLabel="Título del sheet">
  <form className="flex flex-col min-h-0 flex-1" onSubmit={handleSubmit}>
    <div className="overflow-y-auto min-h-0 flex-1 px-5 pt-5 space-y-4">
      {/* campos */}
    </div>
    <div className="shrink-0 px-5 pb-5 pt-3 border-t border-line">
      <button type="submit" className="fp-btn fp-btn-primary w-full">
        Guardar
      </button>
    </div>
  </form>
</Sheet>
```

- `flexColumn` — scroll interno.
- `immersive` — fullscreen móvil (wizard de plan, player).
- `zIndex={60}` default.

---

## 10. Forma, ritmo y sombras

- Sombras: `--shadow-sm` / `--shadow-md`; CTA `--shadow-brand`.
- Bordes: `1px solid var(--border)`. Hover de secundario: tinte marca vía
  token, no `rgba(34,197,94,…)` fijo si debe funcionar en light.
- Light: sombras ya más leves en `:root.light`; no `shadow-xl`.

---

## 11. Copy y microcopy

- **Idioma:** español.
- **Tono:** directo, fitness, profesional. Palabra concreta (serie, RPE,
  sesión, cliente) antes que slogan.
- **Botones:** verbo + objeto («Crear rutina», «Asignar entrenamiento»,
  «Nuevo cliente» — el wizard crea cliente **y** plan; el CTA del roster es
  el cliente).
- **Vacíos:** invitar a actuar (tabla §7).
- **Errores:** qué pasó + cómo resolver.
- **Toasts:** mismo verbo que el botón.

---

## 12. Patrones por módulo

### Usuarios y planes (`/usuarios`) — trabajo diario

El entrenador abre **Usuarios**, no el design system. `AppShell width="wide"`.

```
Roster (lista UserCard)
  → detalle cliente
       tabs: Progreso | Entrenamientos | Medidas
            → UserPlanWorkspace (si Entrenamientos)
                 frecuencia / modo / progresión
                 PlanSessionNav (semana, copiar, aplicar a todas)
                 VistaSemana → EntrenamientoCard
                      → SesionEditorSheet (crear/editar, dnd ejercicios)
                      → RutinaPickerSheet (asignar + replicar)
```

| Pieza | Qué es |
|-------|--------|
| Roster | [`UsuariosPage`](src/pages/UsuariosPage.tsx) — búsqueda `fp-input-group`, CTA «Nuevo cliente» |
| Wizard | [`CreatePlanWizard`](src/components/userPlans/CreatePlanWizard.tsx) — 2 pasos, `immersive`, acento `--accent-purple` (wayfinding de planes, CTA sigue `--brand`) |
| Wizard paso 1 | Datos del **cliente** |
| Wizard paso 2 | Plan: nombre, descripción, semanas, **frecuencia** (reserva los huecos de sesión) |
| Plantillas | **No** se asignan en el wizard: al crear se navega a `/usuarios/:id?tab=entrenamientos` y se asignan ahí (`RutinaPickerSheet` / `SesionEditorSheet`), con `modo` y `progresión` editables en el workspace |
| Arranque del plan | `UserPlanWorkspace` muestra un bloque de setup (`--brand`, borde discontinuo) mientras la semana 1 no tenga sesiones configuradas: «Asignar plantilla» + «Crear plan guiado» |
| Workspace | [`UserPlanWorkspace`](src/components/users/UserPlanWorkspace.tsx) |
| Editor | [`SesionEditorSheet`](src/components/users/SesionEditorSheet.tsx) — dnd `@dnd-kit`; si `isSemanaBloqueada`, solo lectura (hay sesión completada esa semana) |
| Semana bloqueada | No sobrescribir; candado + copy de lectura. Replicar / aplicar a todas solo sobre semanas editables |
| Demo | [`DemoBadge`](src/components/common/DemoBadge.tsx) en paneles mock (`CompliancePanel`) |
| Densidad | Grilla de sesiones compacta; no `display-hero` dentro del workspace |

**Calendario vs Usuarios**

| Quiero… | Dónde |
|---------|--------|
| Alta de cliente + esqueleto de plan | Usuarios → Nuevo cliente (`CreatePlanWizard`) |
| Asignar la plantilla del cliente nuevo | Usuarios → cliente → Entrenamientos (misma pantalla que la edición) |
| Editar semana, sesiones, ejercicios, replicar | Usuarios → cliente → Entrenamientos |
| Agendar un hueco (entrenamiento o medidas) | Calendario → `CitaCreateSheet` |
| Colocar una rutina en un día concreto (muta el plan) | Calendario → `AsignarEntrenoSheet` |

No mezclar cita y asignación en un solo sheet. No usar el calendario como
editor de plan.

Wayfinding de este módulo: `--accent-purple` en chrome de plan (selectores,
cards). Voltaje de acción: `--brand`.

### Biblioteca (`/library/*`)

`LibraryLayout` + `LibrarySubNav`. Ancho vía `resolveShellWidth`. Hub con cards
navegables; catálogos con `fp-input-group`. Formularios de rutina `narrow`.

### Calendario (`/calendario`)

1. **Agendar cita** — `CitaCreateSheet`.
2. **Asignar entrenamiento** — `AsignarEntrenoSheet`.

Desktop: dos CTAs en header. Móvil: `.fp-cal-fab` → `CalendarActionSheet`.
Día de picker: círculo, nunca rectángulo.

### Comunidades (`/communities/*`)

UI mock (`useCommunitiesStore`). Mismos tokens y `fp-*`. No confundir roles de
comunidad con RBAC de plataforma.

### Auth (`/login`, `/register`)

Bloques `.auth-*`. Centrado, `max-width: 400px`, `.auth-bg-glow`. Wordmark:
`auth-title` Sora 800 / 22px.

### Admin / dashboard (`/`)

`AppShell width="wide"`. `.fp-admin-*`. Título de briefing = **`display-hero`**
(Sora 800 / 24px). KPIs = escala `kpi` (700). Acento púrpura en métricas admin;
verde en marca / CTA.

---

## 13. Responsive

| Breakpoint | Comportamiento |
|------------|----------------|
| `< md` | Bottom nav, FAB, sheets bottom-sheet, CTAs full-width, densidad compacta |
| `≥ md` | Bottom nav oculta, nav superior, sheets modal centrado |
| `≥ lg` | Grids 2–3 col; workspace de plan: semana + panel 320px |

`useMediaQuery` cuando la lógica (no solo el estilo) dependa del viewport.

---

## 14. Do / Don't

### Do

- `--brand` para **toda** interacción primaria.
- Acento de módulo en nav, icono activo, `fp-accent-bar`, chrome de plan.
- Tokens en nav (`var(--accent-blue)`), nunca `#58a6ff`.
- Superficies a `--bg-app` / cards a `--bg-card`.
- Escala §4; un `display-hero` por vista como máximo.
- Radios §5. FAB nuevo = 56px círculo (`Fab`).
- Probar **modo claro** y **móvil**. Labels con `--text-secondary`, no muted.

### Don't

- No pintar el CTA con el acento del módulo.
- No usar `--brand` como fill de toda la nav (solo Inicio).
- No hex de dark en chrome.
- No `--text-muted` como cuerpo o label esencial (contraste light).
- No `--accent-red` sustituido por muted en errores.
- No Sora 800 fuera de `display-hero` y `.auth-title`.
- No display > 28px en el app shell.
- No `rounded-none` en controles.
- No recetas de otra marca (host, amenity, listing, reserva).
- No coreografiar el dashboard como landing.
- No asumir persistencia de planes/citas al recargar.

---

## 15. Checklist — nueva pantalla

- [ ] `AppShell` con `width` correcto (`wide` en usuarios/planes/calendario).
- [ ] Tokens / `fp-*` — sin hex que rompan light.
- [ ] Tipo: DM Sans cuerpo; Sora según §4 (`display-hero` solo si es la tesis).
- [ ] CTA `--brand`; módulo solo wayfinding.
- [ ] Nav activa = token de módulo, no hex.
- [ ] Radios §5; FAB 56px si aplica.
- [ ] Formularios: `fp-input`, `fp-btn` ≥ 44px, `fp-cal-label`.
- [ ] Sheet: CTA fijo en móvil; destructivo ≠ primario verde.
- [ ] Vacío correcto (roster / semana / sesión) + error + carga.
- [ ] `:focus-visible` no eliminado; `aria-label` en iconos.
- [ ] Hover / active / disabled / loading no aplastados.
- [ ] Copy en español; no promete guardado si el store es memoria.
- [ ] Modo claro: muted no usado como texto; chrome vía variables.

---

## 16. Anti-patrones

| No hacer | Por qué |
|----------|---------|
| Nueva paleta o prefijo (`btn-x`, tercer `fp-plan-*` suelto) | Fragmenta el sistema |
| Inputs Tailwind sueltos | Rompe foco, 44px y light |
| Sheet sin CTA fijo en móvil | Acción oculta |
| Hex en `NAV_ITEMS` / FAB / badge | Rompe `:root.light` |
| `fp-btn` sin `:focus-visible` | Teclado invisible |
| Vacío de roster dentro de una semana | El entrenador no quiere “crear cliente” ahí |
| Cita y asignar entrenamiento en un sheet | Dos jobs distintos |
| Título 800 en cards “para que se sienta premium” | 800 es `display-hero` / auth |
| CTA naranja/azul porque es el módulo | Rompe el voltaje |
| Coreografía de entrada en Operate | El usuario ya está en la tarea |
| Copiar recetas de marketplace (host, amenity) | No es el dominio |

---

## 17. Mantenimiento

- Tokens o clases `fp-*` nuevas → `src/index.css` **y** tablas §3–§8.
- Componente común nuevo → §8 y `src/components/common/`.
- Decisión visual global → ADR en `CONTEXT.md §13`.
- Skill: [`.claude/skills/design-fitpro/SKILL.md`](.claude/skills/design-fitpro/SKILL.md)
  (resumen; este doc manda).
- Código canónico: [`src/index.css`](src/index.css). Si guía y CSS divergen,
  **gana el CSS** y hay que actualizar este archivo — no al revés, salvo ADR
  que pida evolucionar el token.
