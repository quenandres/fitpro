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
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev.slice(-2), newToast]); // Max 3 toasts
    
    if (toast.type !== 'loading') {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, toast.duration || 4000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
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

const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast, index) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} index={index} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void; index: number }> = ({ toast, onClose, index }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    loading: <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />,
  };

  const colors = {
    success: 'border-green-500/50 bg-green-500/10',
    error: 'border-red-500/50 bg-red-500/10',
    warning: 'border-yellow-500/50 bg-yellow-500/10',
    info: 'border-blue-500/50 bg-blue-500/10',
    loading: 'border-orange-500/50 bg-orange-500/10',
  };

  return (
    <div
      className={`
        backdrop-blur-xl rounded-xl border ${colors[toast.type]}
        p-4 shadow-2xl animate-[slideIn_0.3s_ease-out]
        flex items-start gap-3
      `}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm">{toast.title}</p>
        {toast.message && <p className="text-gray-400 text-xs mt-1">{toast.message}</p>}
      </div>
      <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Hook for easy toast usage
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

// Simple toast state for components without context
export interface SimpleToastState {
  visible: boolean;
  type: ToastType;
  message: string;
}

export const useToast = () => {
  const [toast, setToast] = useState<SimpleToastState>({ visible: false, type: 'success', message: '' });

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ visible: true, type, message });
    setTimeout(() => setToast({ visible: false, type: 'success', message: '' }), 3000);
  }, []);

  return { toast, showToast };
};

// Simple Toast component for inline usage
export const SimpleToast: React.FC<SimpleToastState> = ({ visible, type, message }) => {
  if (!visible) return null;
  
  const colors = {
    success: 'bg-green-50 border-green-500 text-green-700',
    error: 'bg-red-50 border-red-500 text-red-700',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-700',
    info: 'bg-blue-50 border-blue-500 text-blue-700',
    loading: 'bg-orange-50 border-orange-500 text-orange-700',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border ${colors[type]} shadow-lg animate-[slideIn_0.3s_ease-out] max-w-sm`}>
      <p className="font-medium text-sm">{message}</p>
    </div>
  );
};
