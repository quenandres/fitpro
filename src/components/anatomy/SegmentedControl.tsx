import { styles } from './anatomy.styles';
import type { SegmentOption } from './anatomy.types';

interface SegmentedControlProps<T extends string> {
  options: ReadonlyArray<SegmentOption<T>>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}

/**
 * Control segmentado con indicador deslizante animado. El indicador se
 * posiciona vía `left`/`width` porcentuales calculados a partir del índice
 * del valor actual, de forma que la transición entre opciones sea fluida.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: SegmentedControlProps<T>) {
  const activeIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const pct = 100 / options.length;

  return (
    <div style={styles.segControl} role="tablist" aria-label={ariaLabel}>
      <span
        aria-hidden="true"
        style={{
          ...styles.segIndicator,
          left: `calc(${activeIndex * pct}% + 3px)`,
          width: `calc(${pct}% - 6px)`,
        }}
      />
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            style={{
              ...styles.segBtn,
              ...(isActive ? styles.segBtnActive : {}),
            }}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
