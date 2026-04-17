import { LEGEND } from './anatomy.constants';
import { styles } from './anatomy.styles';

export function RecoveryLegend() {
  return (
    <div style={styles.legend}>
      {LEGEND.map((item) => (
        <div key={item.label} style={styles.legendItem}>
          <div style={{ ...styles.legendDot, background: item.color }} />
          <span style={styles.legendLabel}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
