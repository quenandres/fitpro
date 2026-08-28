import type { SesionEntrenamiento } from '../../types';
import {
  TRACKING_MODALIDAD_LABELS,
  formatSessionDate,
} from '../../utils/trackingUtils';

interface RecentSessionsListProps {
  sesiones: SesionEntrenamiento[];
  limit?: number;
}

export function RecentSessionsList({ sesiones, limit = 10 }: RecentSessionsListProps) {
  const recent = sesiones.slice(0, limit);

  if (recent.length === 0) {
    return (
      <p className="fp-tracking-empty" style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        Sin sesiones registradas para este cliente.
      </p>
    );
  }

  return (
    <ul className="fp-tracking-session-list">
      {recent.map((s) => (
        <li key={s.id} className="fp-tracking-session-row">
          <div className="fp-tracking-session-main">
            <p className="fp-tracking-session-title">{s.rutina_nombre}</p>
            <p className="fp-tracking-session-meta">
              {formatSessionDate(s.fecha)} · {s.duracion_min} min · {s.series_completadas} series
            </p>
          </div>
          <span className={`fp-tracking-badge fp-tracking-badge--${s.modalidad}`}>
            {TRACKING_MODALIDAD_LABELS[s.modalidad]}
          </span>
        </li>
      ))}
    </ul>
  );
}
