import { createPortal } from 'react-dom';
import type { CSSProperties, ReactNode } from 'react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  zIndex?: number;
  /** Panel is a flex column (scroll handled by children). */
  flexColumn?: boolean;
  /** Full viewport on mobile; centered modal from md+. */
  immersive?: boolean;
  panelClassName?: string;
  panelStyle?: CSSProperties;
  ariaLabel?: string;
}

export function Sheet({
  open,
  onClose,
  children,
  zIndex = 60,
  flexColumn = false,
  immersive = false,
  panelClassName = '',
  panelStyle,
  ariaLabel,
}: SheetProps) {
  if (!open) return null;

  const panelBase = immersive
    ? 'fp-card w-full max-w-md md:max-w-lg max-h-[100dvh] md:max-h-[min(90vh,720px)] rounded-none md:rounded-2xl animate-slide-up md:animate-fade-in overflow-y-auto'
    : 'fp-card w-full max-w-md md:max-w-lg max-h-[85vh] md:max-h-[min(80vh,720px)] rounded-t-2xl md:rounded-2xl animate-slide-up md:animate-fade-in';

  const overflowClass = flexColumn
    ? 'min-h-0 overflow-y-auto flex flex-col pb-[max(16px,env(safe-area-inset-bottom))]'
    : 'overflow-y-auto pb-[max(16px,env(safe-area-inset-bottom))]';

  return createPortal(
    <div
      className="animate-fade-in fixed inset-0 flex items-end md:items-center justify-center p-0 md:p-6 bg-[rgba(0,0,0,.75)] backdrop-blur-sm"
      style={{ zIndex }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`${panelBase} ${overflowClass} ${panelClassName}`}
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
