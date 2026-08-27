import { Sheet } from './Sheet';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Estilo de peligro para acciones destructivas (eliminar, suspender). */
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Diálogo de confirmación reutilizable sobre `Sheet`, para acciones irreversibles o sensibles. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Sheet open={open} onClose={onClose} immersive ariaLabel={title}>
      <div className="p-5">
        <h2 className="font-sora text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        ) : null}

        <div className="mt-6 flex gap-3">
          <button type="button" className="fp-btn fp-btn-secondary flex-1" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="fp-btn flex-1"
            style={
              danger
                ? { background: 'var(--accent-red)', color: '#fff' }
                : { background: 'var(--brand)', color: '#fff' }
            }
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
