import { useCallback, useMemo, useState, type MouseEvent, type SyntheticEvent } from 'react';
import { MuscleLayer } from './MuscleLayer';
import { SegmentedControl } from './SegmentedControl';
import { styles } from './anatomy.styles';
import {
  HEATMAP_OFF_FILTER,
  RECOVERY_LEVELS,
  VIEW_OPTIONS,
  MUSCLE_MAP,
} from './anatomy.constants';
import { buildSilhouetteUrl, getCanonical } from './anatomy.utils';
import type { AnatomyView, Gender } from './anatomy.types';
import './anatomy.css';

export interface AnatomyMuscleSelectorProps {
  /** Lista de músculos canónicos actualmente seleccionados. */
  value: string[];
  /** Se invoca con la nueva lista tras cada toggle. */
  onChange: (next: string[]) => void;
  initialView?: AnatomyView;
}

const GENDER: Gender = 'male';

// Filtro verde brillante usado para marcar músculos seleccionados.
const SELECTED_FILTER = RECOVERY_LEVELS[2].filter;

function hideOnError(e: SyntheticEvent<HTMLImageElement>) {
  e.currentTarget.style.display = 'none';
}

/**
 * Selector multi-select de músculos sobre la silueta anatómica. Reutiliza
 * `MuscleLayer` pero cambia la semántica: click → toggle del nombre canónico
 * en el array `value`. Los músculos seleccionados se pintan con filtro
 * brillante y los demás con filtro atenuado.
 */
export function AnatomyMuscleSelector({
  value,
  onChange,
  initialView = 'front',
}: AnatomyMuscleSelectorProps) {
  const [view, setView] = useState<AnatomyView>(initialView);

  const muscles = useMemo(() => MUSCLE_MAP[view]?.[GENDER] ?? [], [view]);

  const selectedSet = useMemo(() => new Set(value), [value]);

  const toggle = useCallback(
    (canonical: string) => {
      const next = new Set(value);
      if (next.has(canonical)) next.delete(canonical);
      else next.add(canonical);
      onChange([...next]);
    },
    [value, onChange],
  );

  const handleBackgroundClick = (e: MouseEvent<HTMLDivElement>) => {
    // Sin acción: los clicks en fondo/silueta no hacen nada en modo selección.
    e.stopPropagation();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <SegmentedControl
        ariaLabel="Vista anatómica"
        options={VIEW_OPTIONS}
        value={view}
        onChange={setView}
      />

      <div
        style={styles.viewport}
        className="anatomy-viewport"
        data-role="viewport"
        onClick={handleBackgroundClick}
      >
        <img
          data-role="silhouette"
          src={buildSilhouetteUrl(view, GENDER)}
          style={styles.silhouette}
          alt=""
          onError={hideOnError}
        />

        {muscles.map((name) => {
          const canonical = getCanonical(name);
          const isSelected = selectedSet.has(canonical);
          const filter = isSelected
            ? `${SELECTED_FILTER} drop-shadow(0 0 6px rgba(34,197,94,.45))`
            : HEATMAP_OFF_FILTER;

          return (
            <MuscleLayer
              key={name}
              name={name}
              gender={GENDER}
              canonical={canonical}
              filter={filter}
              isSelected={isSelected}
              onSelect={toggle}
            />
          );
        })}
      </div>

      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {value.map((c) => (
            <span
              key={c}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 100,
                background: 'var(--brand-dim)',
                border: '1px solid rgba(34,197,94,.35)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--brand-bright, var(--brand))',
              }}
            >
              {c}
              <button
                type="button"
                onClick={() => toggle(c)}
                aria-label={`Quitar ${c}`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'inherit',
                  padding: 0,
                  fontSize: 13,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default AnatomyMuscleSelector;
