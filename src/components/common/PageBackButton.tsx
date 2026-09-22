import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

type PageBackButtonProps = {
  /** Texto accesible: «Volver a {destino}». */
  label: string;
  className?: string;
} & (
  | { to: string; onClick?: never }
  | { onClick: () => void; to?: never }
);

const buttonClass = 'fp-btn fp-btn-ghost fp-page-back-btn shrink-0';

/** Volver de página interna: icono solo, ChevronLeft 20, destino explícito (nunca history.back). */
export function PageBackButton({ label, to, onClick, className = '' }: PageBackButtonProps) {
  const classes = className ? `${buttonClass} ${className}` : buttonClass;

  if (to) {
    return (
      <Link to={to} className={classes} aria-label={label}>
        <ChevronLeft size={20} aria-hidden />
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes} aria-label={label}>
      <ChevronLeft size={20} aria-hidden />
    </button>
  );
}

/** Fila superior estándar para alinear el volver antes del título de página. */
export function PageBackRow({ className = '', ...props }: PageBackButtonProps) {
  return (
    <div className={className ? `fp-page-back-row ${className}` : 'fp-page-back-row'}>
      <PageBackButton {...props} />
    </div>
  );
}
