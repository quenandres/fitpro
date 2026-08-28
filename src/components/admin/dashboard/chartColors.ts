/**
 * Paleta categórica de las gráficas del Dashboard Admin.
 *
 * Los acentos "de marca" de FitPro (--brand, --accent-blue, --accent-purple,
 * --accent-orange, --accent-red, --accent-pink) fallan la validación de
 * accesibilidad de color para uso categórico en gráficas (bandas de
 * luminosidad fuera de rango en modo oscuro, separación CVD insuficiente
 * entre morado/azul y rojo/naranja — ver skill `dataviz`). Estos 6 tonos son
 * una variante más oscura/saturada de esos mismos hues, reordenada, que pasa
 * las 5 verificaciones (banda de luminosidad, piso de croma, separación CVD,
 * piso de visión normal, contraste) contra ambas superficies de FitPro
 * (`#161b22` oscuro / `#ffffff` claro) — validado con
 * `dataviz/scripts/validate_palette.js`. Asignar siempre en este orden fijo,
 * nunca ciclar ni reordenar por serie.
 */
export const CHART_SERIES_COLORS = [
  '#16a34a', // verde — serie 1
  '#3b82f6', // azul — serie 2
  '#ec4899', // rosa — serie 3
  '#ea580c', // naranja — serie 4
  '#9333ea', // morado — serie 5
  '#dc2626', // rojo — serie 6 (evitar como única serie positiva; reservado para "crítico" cuando aplique)
] as const;

export const CHART_STATUS_COLORS: Record<'alta' | 'media' | 'baja', string> = {
  alta: '#dc2626',
  media: '#ea580c',
  baja: 'var(--text-muted)',
};

/** Fondo tenue a juego con CHART_STATUS_COLORS — no se deriva con `${color}NN` porque
 * 'baja' es un token var(--...), no un hex, y esa concatenación rompería el color. */
export const CHART_STATUS_BG: Record<'alta' | 'media' | 'baja', string> = {
  alta: 'rgba(220,38,38,.12)',
  media: 'rgba(234,88,12,.12)',
  baja: 'var(--bg-overlay)',
};

export const CHART_GRID_COLOR = 'var(--border-subtle)';
export const CHART_AXIS_COLOR = 'var(--text-muted)';
export const CHART_TOOLTIP_STYLE = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  fontSize: 12,
};
export const CHART_TOOLTIP_LABEL_STYLE = { color: 'var(--text-primary)' };
export const CHART_CURSOR_FILL = { fill: 'var(--bg-overlay)' };
