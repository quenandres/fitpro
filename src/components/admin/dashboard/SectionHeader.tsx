import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

interface Props {
  icon: ComponentType<LucideProps>;
  title: string;
  accent?: string;
  /** Sin margen superior (p. ej. dentro de AttentionSection). */
  compact?: boolean;
}

export const SectionHeader = ({ icon: Icon, title, accent = 'var(--brand)', compact = false }: Props) => (
  <div className={`fp-admin-section-head${compact ? ' fp-admin-section-head--compact' : ''}`}>
    <Icon size={16} color={accent} className="shrink-0" />
    <h2 className="font-sora fp-admin-section-title">{title}</h2>
    <span className="fp-admin-section-rule" aria-hidden />
  </div>
);
