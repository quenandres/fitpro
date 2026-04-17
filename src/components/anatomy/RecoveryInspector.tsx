import type { ChangeEvent } from 'react';
import { styles } from './anatomy.styles';
import { getRecoveryLevel } from './anatomy.utils';

interface RecoveryInspectorProps {
  canonical: string;
  /** Nivel de recuperación en rango `[0..1]`. */
  level: number;
  onClose: () => void;
  onChange: (level: number) => void;
}

export function RecoveryInspector({
  canonical,
  level,
  onClose,
  onChange,
}: RecoveryInspectorProps) {
  const status = getRecoveryLevel(level);
  const pct = Math.round(level * 100);

  const handleSlider = (e: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseInt(e.target.value, 10);
    if (Number.isFinite(parsed)) onChange(parsed / 100);
  };

  return (
    <div style={styles.inspector}>
      <div style={styles.inspectorHeader}>
        <div>
          <span style={styles.muscleLabel}>{canonical}</span>
          <span
            style={{
              ...styles.badge,
              background: status.bg,
              color: status.color,
            }}
          >
            {status.label}
          </span>
        </div>
        <button
          type="button"
          aria-label="Cerrar inspector"
          style={styles.closeBtn}
          onClick={onClose}
        >
          ×
        </button>
      </div>

      <div style={styles.pctRow}>
        <span style={styles.pctValue}>{pct}%</span>
        <span style={styles.pctLabel}>recuperación</span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={pct}
        onChange={handleSlider}
        style={styles.slider}
        aria-label={`Nivel de recuperación de ${canonical}`}
      />
    </div>
  );
}
