import type { ChangeEvent } from 'react';
import { X } from 'lucide-react';
import { styles } from './anatomy.styles';
import { getRecoveryLevel } from './anatomy.utils';

interface RecoveryInspectorProps {
  canonical: string;
  /** Nivel de recuperación en rango `[0..1]`. */
  level: number;
  onClose: () => void;
  onChange: (level: number) => void;
}

const QUICK_PRESETS: readonly number[] = [0, 25, 50, 75, 100];

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

  /** Gradient del track que refleja el estado actual. */
  const trackBackground = `linear-gradient(90deg, ${status.color} 0%, ${status.color} ${pct}%, var(--bg-overlay) ${pct}%, var(--bg-overlay) 100%)`;

  return (
    <div
      className="fp-card anatomy-slide-up"
      style={{
        ...styles.inspector,
        borderColor: status.color + '40',
        boxShadow: `0 10px 24px ${status.color}15, 0 2px 6px rgba(0,0,0,.25)`,
      }}
    >
      <div style={styles.inspectorHeader}>
        <div style={styles.inspectorMeta}>
          <span style={styles.muscleHint}>Músculo seleccionado</span>
          <span style={styles.muscleLabel}>{canonical}</span>
          <span
            style={{
              ...styles.badge,
              background: status.bg,
              color: status.color,
              border: `1px solid ${status.color}33`,
            }}
          >
            <span style={{ ...styles.badgeDot, background: status.color }} />
            {status.label}
          </span>
        </div>
        <button
          type="button"
          aria-label="Cerrar inspector"
          className="anatomy-close"
          style={styles.closeBtn}
          onClick={onClose}
        >
          <X size={16} strokeWidth={2.4} />
        </button>
      </div>

      <div style={styles.pctRow}>
        <span style={{ ...styles.pctValue, color: status.color }}>{pct}%</span>
        <span style={styles.pctLabel}>recuperación</span>
      </div>

      <div style={styles.sliderWrap}>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={pct}
          onChange={handleSlider}
          className="anatomy-slider"
          style={{ background: trackBackground }}
          aria-label={`Nivel de recuperación de ${canonical}`}
        />

        <div style={styles.quickRow}>
          {QUICK_PRESETS.map((preset) => {
            const isActive = pct === preset;
            return (
              <button
                key={preset}
                type="button"
                className="anatomy-chip"
                style={{
                  ...styles.quickChip,
                  ...(isActive ? styles.quickChipActive : {}),
                }}
                onClick={() => onChange(preset / 100)}
                aria-pressed={isActive}
              >
                {preset}%
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
