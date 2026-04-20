import { useMemo, useState, type SyntheticEvent } from 'react';
import { MuscleLayer } from './MuscleLayer';
import { SegmentedControl } from './SegmentedControl';
import { styles } from './anatomy.styles';
import {
  HEATMAP_OFF_FILTER,
  MUSCLE_MAP,
  RECOVERY_LEVELS,
  VIEW_OPTIONS,
} from './anatomy.constants';
import { buildSilhouetteUrl, getCanonical } from './anatomy.utils';
import type { AnatomyView, Gender } from './anatomy.types';
import './anatomy.css';

const GENDER: Gender = 'male';

/** Rampa de intensidad. Reutiliza los filtros de RECOVERY_LEVELS para mantener
 *  la paleta visual consistente con el tracker de recuperación, pero la
 *  semántica aquí es "carga de trabajo": verde -> naranja -> rojo. */
const INTENSITY_TIERS = [
  { label: 'Ligero',   color: RECOVERY_LEVELS[2].color, filter: RECOVERY_LEVELS[2].filter },
  { label: 'Moderado', color: RECOVERY_LEVELS[1].color, filter: RECOVERY_LEVELS[1].filter },
  { label: 'Intenso',  color: RECOVERY_LEVELS[0].color, filter: RECOVERY_LEVELS[0].filter },
];

function getIntensityFilter(count: number, max: number): string {
  if (count <= 0 || max <= 0) return HEATMAP_OFF_FILTER;
  const ratio = count / max;
  if (ratio <= 0.34) return INTENSITY_TIERS[0].filter;
  if (ratio <= 0.67) return INTENSITY_TIERS[1].filter;
  return INTENSITY_TIERS[2].filter;
}

function hideOnError(e: SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = 'none';
}

export interface AnatomyMuscleHeatmapProps {
  /** Mapa canónico -> número de ejercicios que lo trabajan. */
  counts: Record<string, number>;
  initialView?: AnatomyView;
  /** Layout reducido: oculta la leyenda y baja el viewport. */
  compact?: boolean;
}

/**
 * Visor anatómico de sólo lectura que pinta un heatmap de carga:
 * cuantos más ejercicios toquen un músculo, más intenso su color.
 * Los clics sobre la figura se ignoran (no se abre inspector).
 */
export function AnatomyMuscleHeatmap({
  counts,
  initialView = 'front',
  compact = false,
}: AnatomyMuscleHeatmapProps) {
  const [view, setView] = useState<AnatomyView>(initialView);

  const muscles = useMemo(() => MUSCLE_MAP[view]?.[GENDER] ?? [], [view]);

  const max = useMemo(() => {
    let m = 0;
    for (const v of Object.values(counts)) if (v > m) m = v;
    return m;
  }, [counts]);

  const viewportStyle = compact
    ? { ...styles.viewport, maxHeight: '38vh' }
    : styles.viewport;

  const noop = () => {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <SegmentedControl
        ariaLabel="Vista anatómica"
        options={VIEW_OPTIONS}
        value={view}
        onChange={setView}
      />

      <div
        style={{ ...viewportStyle, cursor: 'default' }}
        className="anatomy-viewport"
        data-role="viewport"
      >
        <img
          data-role="silhouette"
          src={buildSilhouetteUrl(view, GENDER)}
          style={styles.silhouette}
          alt=""
          onError={hideOnError}
        />

        {/* Capa no-interactiva: pointer-events desactivado, y flex centering
            para que los MuscleLayer (position: absolute) se anclen al centro,
            igual que en el viewport original. */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          {muscles.map((name) => {
            const canonical = getCanonical(name);
            const count = counts[canonical] ?? 0;
            const filter = getIntensityFilter(count, max);
            return (
              <MuscleLayer
                key={name}
                name={name}
                gender={GENDER}
                canonical={canonical}
                filter={filter}
                isSelected={false}
                onSelect={noop}
              />
            );
          })}
        </div>
      </div>

      {!compact && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
          {INTENSITY_TIERS.map((t) => (
            <span
              key={t.label}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 999,
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: t.color,
                  boxShadow: '0 0 0 2px rgba(255,255,255,0.04)',
                }}
              />
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.01em',
                }}
              >
                {t.label}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default AnatomyMuscleHeatmap;
