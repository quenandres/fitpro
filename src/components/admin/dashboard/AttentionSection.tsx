import type { ComponentType, ReactNode } from 'react';
import type { LucideProps } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import { SectionHeader } from './SectionHeader';

interface Props {
  children: ReactNode;
  title?: string;
  icon?: ComponentType<LucideProps>;
  columns?: 2 | 3;
}

/** Bloque destacado de alertas (segundo en el dashboard, fondo rojo). */
export const AttentionSection = ({
  children,
  title = 'Alertas',
  icon = AlertTriangle,
  columns = 2,
}: Props) => (
  <section className="fp-admin-attention animate-slide-up">
    <SectionHeader icon={icon} title={title} accent="var(--accent-red)" compact />
    <div className={`fp-admin-attention-grid${columns === 3 ? ' fp-admin-attention-grid--3' : ''}`}>
      {children}
    </div>
  </section>
);
