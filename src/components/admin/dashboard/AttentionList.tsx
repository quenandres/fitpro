import type { AlertaAtencion } from '../../../types/adminDashboard';
import { CHART_STATUS_BG, CHART_STATUS_COLORS } from './chartColors';

const SEVERIDAD_LABEL: Record<AlertaAtencion['severidad'], string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

interface Props {
  title: string;
  items: AlertaAtencion[];
}

/** Sección "Atención": lista de alertas con severidad (usuarios en riesgo, comunidades inactivas, etc.). */
export const AttentionList = ({ title, items }: Props) => (
  <div className="fp-card fp-admin-callout min-w-0">
    <p className="font-sora fp-admin-callout-title">{title}</p>
    {items.length === 0 ? (
      <p className="fp-admin-callout-empty">Nada que revisar aquí.</p>
    ) : (
      <ul className="fp-admin-callout-list">
        {items.map((item) => {
          const color = CHART_STATUS_COLORS[item.severidad];
          return (
            <li key={item.id} className="fp-admin-callout-item">
              <span className="fp-admin-callout-rail" style={{ background: color }} />
              <div className="fp-admin-callout-body">
                <div className="flex items-start justify-between gap-2">
                  <p className="fp-admin-callout-name">{item.titulo}</p>
                  <span
                    className="badge"
                    style={{
                      fontSize: 9,
                      padding: '2px 6px',
                      background: CHART_STATUS_BG[item.severidad],
                      color,
                      border: 'none',
                      flexShrink: 0,
                    }}
                  >
                    {SEVERIDAD_LABEL[item.severidad]}
                  </span>
                </div>
                <p className="fp-admin-callout-detail">{item.detalle}</p>
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </div>
);
