import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

interface Props {
  icon: ComponentType<LucideProps>;
  label: string;
  value: string | number;
  accent: string;
}

/** Tarjeta KPI del dashboard de inicio (métricas por rol). */
export const KpiCard = ({ icon: Icon, label, value, accent }: Props) => (
  <div className="fp-card fp-admin-kpi min-w-0">
    <div className="fp-admin-kpi-icon" style={{ background: `${accent}1f` }}>
      <Icon size={15} color={accent} />
    </div>
    <div className="fp-admin-kpi-copy">
      <span className="font-sora fp-admin-kpi-value">{value}</span>
      <span className="fp-admin-kpi-label">{label}</span>
    </div>
  </div>
);
