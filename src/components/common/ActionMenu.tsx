import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';
import { MoreVertical } from 'lucide-react';
import { Sheet } from './Sheet';
import { useIsMobile } from '../../hooks/useMediaQuery';

export interface ActionMenuItem {
  key: string;
  label: string;
  icon: ComponentType<LucideProps>;
  onSelect: () => void;
  danger?: boolean;
}

interface ActionMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ActionMenuItem[];
  ariaLabel?: string;
  /** Botón disparador custom; por defecto un ícono de "..." */
  trigger?: React.ReactNode;
}

/** Menú de acciones tipo `...`: bottom sheet en móvil, dropdown flotante en desktop. */
export function ActionMenu({ open, onOpenChange, items, ariaLabel = 'Más opciones', trigger }: ActionMenuProps) {
  const isMobile = useIsMobile();

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="fp-btn fp-btn-ghost"
        style={{ padding: '6px 8px', borderRadius: 9 }}
        onClick={() => onOpenChange(!open)}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger ?? <MoreVertical size={16} />}
      </button>

      {isMobile ? (
        <Sheet open={open} onClose={() => onOpenChange(false)} ariaLabel={ariaLabel}>
          <div className="p-2">
            {items.map(({ key, label, icon: Icon, danger, onSelect }) => (
              <button
                key={key}
                type="button"
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-[var(--bg-overlay)]"
                style={{ color: danger ? 'var(--accent-red)' : 'var(--text-primary)' }}
                onClick={() => {
                  onSelect();
                  onOpenChange(false);
                }}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>
        </Sheet>
      ) : open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => onOpenChange(false)} role="presentation" />
          <div
            role="menu"
            className="fp-card absolute right-0 top-full mt-1 z-50 min-w-[190px] py-1.5 shadow-lg"
          >
            {items.map(({ key, label, icon: Icon, danger, onSelect }) => (
              <button
                key={key}
                type="button"
                role="menuitem"
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium transition-colors hover:bg-[var(--bg-overlay)]"
                style={{ color: danger ? 'var(--accent-red)' : 'var(--text-primary)' }}
                onClick={() => {
                  onSelect();
                  onOpenChange(false);
                }}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
