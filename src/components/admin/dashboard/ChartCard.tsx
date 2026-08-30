import type { CSSProperties, ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  height?: number;
  children: ReactNode;
}

/** Envuelve cualquier gráfica de recharts en un fp-card con título/subtítulo. */
export const ChartCard = ({ title, subtitle, height = 240, children }: Props) => (
  <div className="fp-card fp-admin-chart-card">
    <div style={{ marginBottom: 12 }}>
      <p className="font-sora" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--text-primary)' }}>
        {title}
      </p>
      {subtitle && (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{subtitle}</p>
      )}
    </div>
    <div
      className="fp-admin-chart-body"
      style={{ '--chart-h': `${height}px` } as CSSProperties}
    >
      {children}
    </div>
  </div>
);
