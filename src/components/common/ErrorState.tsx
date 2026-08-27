import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

/** Estado de error reutilizable con acción de reintentar opcional. */
export function ErrorState({
  title = 'Algo salió mal',
  description = 'No se pudo cargar el contenido. Inténtalo de nuevo.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center text-center gap-3 py-12 px-6 ${className}`} role="alert">
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ width: 56, height: 56, background: 'rgba(248,81,73,.1)', color: 'var(--accent-red)' }}
      >
        <AlertTriangle size={26} />
      </div>
      <div>
        <p className="font-sora font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
          {title}
        </p>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </p>
      </div>
      {onRetry ? (
        <button type="button" className="fp-btn fp-btn-secondary flex items-center gap-2" onClick={onRetry}>
          <RefreshCw size={15} />
          Reintentar
        </button>
      ) : null}
    </div>
  );
}
