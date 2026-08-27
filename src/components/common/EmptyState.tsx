import type { ComponentType, ReactNode } from 'react';
import type { LucideProps } from 'lucide-react';

interface EmptyStateProps {
  icon: ComponentType<LucideProps>;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/** Estado vacío reutilizable: ícono + título + descripción + acción opcional. */
export function EmptyState({ icon: Icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center text-center gap-3 py-12 px-6 ${className}`}
      role="status"
    >
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ width: 56, height: 56, background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}
      >
        <Icon size={26} />
      </div>
      <div>
        <p className="font-sora font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
          {title}
        </p>
        {description ? (
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
