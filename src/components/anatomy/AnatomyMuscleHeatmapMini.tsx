import { useMemo, type SyntheticEvent } from 'react';
import { MuscleLayer } from './MuscleLayer';
import { styles } from './anatomy.styles';
import {
  HEATMAP_OFF_FILTER,
  MUSCLE_MAP,
  RECOVERY_LEVELS,
} from './anatomy.constants';
import { buildSilhouetteUrl, getCanonical } from './anatomy.utils';
import type { Gender } from './anatomy.types';
import './anatomy.css';

const GENDER: Gender = 'male';

const INTENSITY_FILTERS = [
  RECOVERY_LEVELS[2].filter,
  RECOVERY_LEVELS[1].filter,
  RECOVERY_LEVELS[0].filter,
];

function getIntensityFilter(count: number, max: number): string {
  if (count <= 0 || max <= 0) return HEATMAP_OFF_FILTER;
  const ratio = count / max;
  if (ratio <= 0.34) return INTENSITY_FILTERS[0];
  if (ratio <= 0.67) return INTENSITY_FILTERS[1];
  return INTENSITY_FILTERS[2];
}

function hideOnError(e: SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = 'none';
}

interface Props {
  counts: Record<string, number>;
  /** Etiqueta accesible para lectores de pantalla */
  ariaLabel?: string;
}

/** Heatmap anatómico embebido (vista frontal, sin controles) para celdas compactas. */
export function AnatomyMuscleHeatmapMini({ counts, ariaLabel }: Props) {
  const muscles = MUSCLE_MAP.front?.[GENDER] ?? [];

  const max = useMemo(() => {
    let m = 0;
    for (const v of Object.values(counts)) if (v > m) m = v;
    return m;
  }, [counts]);

  const noop = () => {};

  return (
    <div
      className="anatomy-mini-viewport"
      aria-label={ariaLabel}
      role="img"
    >
      <img
        src={buildSilhouetteUrl('front', GENDER)}
        style={{ ...styles.silhouette, height: '88%', opacity: 0.08 }}
        alt=""
        onError={hideOnError}
      />
      <div className="anatomy-mini-layers">
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
  );
}
