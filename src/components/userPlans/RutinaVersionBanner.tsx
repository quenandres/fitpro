import { RefreshCw, AlertTriangle } from 'lucide-react';
import type { SyncStatus } from '../../utils/compareRutinaSnapshot';

interface Props {
  status: SyncStatus;
  rutinaNombre: string;
  onResync?: () => void;
}

const WARN = '#f0883e';
const ERROR = '#f85149';

export const RutinaVersionBanner = ({ status, rutinaNombre, onResync }: Props) => {
  if (status === 'sincronizado' || status === 'sin_rutina') return null;

  const isDesasignada = status === 'desasignada';
  const color = isDesasignada ? ERROR : WARN;
  const label = isDesasignada ? 'Rutina eliminada' : 'Rutina actualizada';
  const description = isDesasignada
    ? `La rutina "${rutinaNombre}" ya no existe. Los ejercicios siguen disponibles pero sin vínculo.`
    : `La rutina "${rutinaNombre}" cambió desde que se asignó. Puedes resincronizar para aplicar los últimos cambios.`;

  const Icon = isDesasignada ? AlertTriangle : RefreshCw;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 10,
        background: `${color}15`,
        border: `1px solid ${color}40`,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: `${color}25`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.3 }}>
          {description}
        </p>
      </div>
      {!isDesasignada && onResync && (
        <button
          onClick={onResync}
          className="fp-btn"
          style={{
            background: color,
            color: '#fff',
            border: 'none',
            fontSize: 11,
            padding: '6px 10px',
            gap: 4,
            flexShrink: 0,
          }}
        >
          <RefreshCw size={12} /> Resincronizar
        </button>
      )}
    </div>
  );
};
