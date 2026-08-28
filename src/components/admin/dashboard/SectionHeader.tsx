import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

interface Props {
  icon: ComponentType<LucideProps>;
  title: string;
  accent?: string;
}

export const SectionHeader = ({ icon: Icon, title, accent = 'var(--brand)' }: Props) => (
  <div className="flex items-center gap-2 mt-5 md:mt-6 mb-2.5">
    <Icon size={16} color={accent} className="shrink-0" />
    <h2 className="font-sora" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
      {title}
    </h2>
  </div>
);
