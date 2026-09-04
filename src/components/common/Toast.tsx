import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastHook must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev.slice(-2), newToast]);

    if (toast.type !== 'loading') {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration || 4000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({
  toasts,
  removeToast,
}) => (
  <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
    {toasts.map((toast, index) => (
      <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} index={index} />
    ))}
  </div>
);

const toastStyles: Record<
  ToastType,
  { border: string; background: string; iconColor: string }
> = {
  success: {
    border: 'rgba(34, 197, 94, 0.35)',
    background: 'var(--brand-dim)',
    iconColor: 'var(--brand-bright)',
  },
  error: {
    border: 'rgba(248, 81, 73, 0.35)',
    background: 'rgba(248, 81, 73, 0.1)',
    iconColor: 'var(--accent-red)',
  },
  warning: {
    border: 'rgba(240, 136, 62, 0.35)',
    background: 'rgba(240, 136, 62, 0.1)',
    iconColor: 'var(--accent-orange)',
  },
  info: {
    border: 'rgba(88, 166, 255, 0.35)',
    background: 'var(--accent-blue-dim)',
    iconColor: 'var(--accent-blue)',
  },
  loading: {
    border: 'rgba(240, 136, 62, 0.35)',
    background: 'rgba(240, 136, 62, 0.1)',
    iconColor: 'var(--accent-orange)',
  },
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void; index: number }> = ({
  toast,
  onClose,
  index,
}) => {
  const styles = toastStyles[toast.type];

  const icons = {
    success: <CheckCircle size={20} style={{ color: styles.iconColor }} />,
    error: <XCircle size={20} style={{ color: styles.iconColor }} />,
    warning: <AlertTriangle size={20} style={{ color: styles.iconColor }} />,
    info: <Info size={20} style={{ color: styles.iconColor }} />,
    loading: <Loader2 size={20} className="animate-spin" style={{ color: styles.iconColor }} />,
  };

  return (
    <div
      className="fp-card pointer-events-auto p-4 shadow-md animate-slide-down flex items-start gap-3"
      style={{
        animationDelay: `${index * 50}ms`,
        borderColor: styles.border,
        background: styles.background,
      }}
      role="status"
      aria-live="polite"
    >
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-primary">{toast.title}</p>
        {toast.message ? (
          <p className="text-xs mt-1 text-secondary">{toast.message}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="fp-btn fp-btn-ghost shrink-0"
        style={{ minHeight: 32, padding: '4px 6px' }}
        aria-label="Cerrar notificación"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const useToastHook = () => {
  const { addToast } = useToastContext();

  return {
    success: (title: string, message?: string) => addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) => addToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) => addToast({ type: 'info', title, message }),
    loading: (title: string, message?: string) => addToast({ type: 'loading', title, message }),
  };
};
