import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

interface Props {
  icon: ComponentType<LucideProps>;
  label: string;
  value: string | number;
  accent: string;
}

/** Tarjeta KPI genérica — mismo patrón visual que el bloque STATS de src/pages/Dashboard.tsx. */
export const KpiCard = ({ icon: Icon, label, value, accent }: Props) => (
  <div
    className="fp-card min-w-0"
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      padding: '12px 8px',
      borderRadius: 14,
    }}
  >
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: 9,
        background: `${accent}1f`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
        flexShrink: 0,
      }}
    >
      <Icon size={14} color={accent} />
    </div>
    <span
      className="font-sora"
      style={{
        fontSize: 20,
        fontWeight: 700,
        color: 'var(--text-primary)',
        lineHeight: 1,
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {value}
    </span>
    <span
      className="line-clamp-2"
      style={{
        fontSize: 10,
        fontWeight: 500,
        color: 'var(--text-muted)',
        textAlign: 'center',
        lineHeight: 1.25,
        maxWidth: '100%',
      }}
    >
      {label}
    </span>
  </div>
);
