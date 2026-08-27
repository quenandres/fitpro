import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import { Plus } from 'lucide-react';

interface FabProps {
  icon?: ComponentType<LucideProps>;
  onClick: () => void;
  ariaLabel: string;
  /** Color de acento del botón (default: marca). */
  accent?: string;
  className?: string;
}

/** Botón de acción flotante (FAB), pensado para acciones rápidas en móvil. */
export function Fab({ icon: Icon = Plus, onClick, ariaLabel, accent = 'var(--brand)', className = '' }: FabProps) {
  return (
    <button
      type="button"
      className={`fixed z-40 flex items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 ${className}`}
      style={{
        width: 56,
        height: 56,
        right: 20,
        bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        background: accent,
        color: '#fff',
        boxShadow: '0 6px 20px rgba(0,0,0,.35)',
      }}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <Icon size={24} />
    </button>
  );
}
