import { AlertTriangle } from 'lucide-react';
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
  <div className="fp-card min-w-0" style={{ padding: 16, borderRadius: 14 }}>
    <p className="font-sora" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
      {title}
    </p>
    {items.length === 0 ? (
      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sin elementos que revisar.</p>
    ) : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((item, i) => {
          const color = CHART_STATUS_COLORS[item.severidad];
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                padding: '8px 0',
                borderBottom: i < items.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <AlertTriangle size={14} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-start justify-between gap-2">
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      minWidth: 0,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {item.titulo}
                  </p>
                  <span
                    className="badge"
                    style={{ fontSize: 9, padding: '2px 6px', background: CHART_STATUS_BG[item.severidad], color, border: 'none', flexShrink: 0 }}
                  >
                    {SEVERIDAD_LABEL[item.severidad]}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, overflowWrap: 'anywhere' }}>
                  {item.detalle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);
