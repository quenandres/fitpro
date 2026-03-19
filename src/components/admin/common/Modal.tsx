import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
}

const SIZE_MAP = {
  sm:   360,
  md:   480,
  lg:   680,
  xl:   880,
  full: undefined,
};

export const Modal: React.FC<ModalProps> = ({
  isOpen, onClose, title, children, size = 'lg', showClose = true,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="animate-fade-in"
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="fp-card animate-scale-in"
        style={{ width: '100%', maxWidth: SIZE_MAP[size], maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: 18, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div style={{ height: 3, background: 'linear-gradient(90deg,var(--brand),var(--accent-blue))', flexShrink: 0 }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <h2 className="font-sora" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
          {showClose && (
            <button className="fp-btn fp-btn-ghost" style={{ padding: '5px 7px', borderRadius: 9 }} onClick={onClose}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, onClose, onConfirm, title, message,
  confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger',
}) => {
  if (!isOpen) return null;

  const btnColor =
    type === 'danger'  ? 'var(--accent-red)'    :
    type === 'warning' ? 'var(--accent-orange)'  :
    'var(--accent-blue)';

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div className="fp-card animate-scale-in" style={{ maxWidth: 380, width: '100%', padding: 20, borderRadius: 16 }} onClick={(e) => e.stopPropagation()}>
        <p className="font-sora" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{title}</p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>{message}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="fp-btn fp-btn-secondary" style={{ flex: 1 }} onClick={onClose}>{cancelText}</button>
          <button className="fp-btn fp-btn-primary" style={{ flex: 1, background: btnColor }} onClick={() => { onConfirm(); onClose(); }}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};
