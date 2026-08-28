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
  <div className={`flex items-center gap-2 mb-2.5${compact ? '' : ' mt-5 md:mt-6'}`}>
    <Icon size={16} color={accent} className="shrink-0" />
    <h2 className="font-sora" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
      {title}
    </h2>
  </div>
);
