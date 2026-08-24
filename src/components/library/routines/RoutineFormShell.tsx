import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import type { RoutineFormLevel } from '../../../types';
import type { ValidationError } from '../../../utils/validators';
import { getFieldError } from '../../../utils/routineFormValidators';
import { PresetBanner } from './PresetBanner';

import { ROUTES } from '../../../routes/paths';

const LEVEL_META: Record<
  RoutineFormLevel,
  { title: string; badge: string; accent: string; backTo: string }
> = {
  basica: {
    title: 'Rutina básica',
    badge: 'Principiante',
    accent: '#22c55e',
    backTo: ROUTES.library.rutinasNueva,
  },
  intermedia: {
    title: 'Rutina intermedia',
    badge: 'Intermedio',
    accent: '#58a6ff',
    backTo: ROUTES.library.rutinasNueva,
  },
  avanzada: {
    title: 'Rutina avanzada',
    badge: 'Avanzado',
    accent: '#a371f7',
    backTo: ROUTES.library.rutinasNueva,
  },
};

interface Props {
  level: RoutineFormLevel;
  children: ReactNode;
  errors: ValidationError[];
  presetName?: string;
  matchInfo?: { matched: number; total: number };
  isEdit?: boolean;
  hideActions?: boolean;
  footer?: ReactNode;
}

export const RoutineFormShell = ({
  level,
  children,
  errors,
  presetName,
  matchInfo,
  isEdit,
  hideActions,
  footer,
}: Props) => {
  const meta = LEVEL_META[level];
  const backLabel = 'Elegir otro nivel';
  const nombreError = getFieldError(errors, 'nombre');

  return (
    <div>
      <Link
        to={meta.backTo}
        className="fp-btn fp-btn-ghost animate-slide-up"
        style={{ gap: 4, padding: '4px 0', marginBottom: 12, fontSize: 12 }}
      >
        <ChevronLeft size={14} /> {backLabel}
      </Link>

      <section className="animate-slide-up" style={{ paddingBottom: 14 }}>
        <span
          className="badge"
          style={{
            fontSize: 11,
            padding: '3px 9px',
            background: `${meta.accent}22`,
            color: meta.accent,
            border: `1px solid ${meta.accent}44`,
          }}
        >
          {meta.badge}
        </span>
        <h1
          className="font-sora"
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '-.02em',
            color: 'var(--text-primary)',
            marginTop: 8,
            marginBottom: 4,
          }}
        >
          {isEdit ? `Editar: ${meta.title.toLowerCase()}` : meta.title}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Ejercicios desde ExerciseDB. Revisa el resumen antes de guardar.
        </p>
      </section>

      {presetName && <PresetBanner presetName={presetName} />}
      {matchInfo && matchInfo.matched < matchInfo.total && (
        <p
          style={{
            fontSize: 12,
            color: 'var(--accent-orange, #f0883e)',
            marginBottom: 10,
            padding: '8px 10px',
            borderRadius: 9,
            background: 'rgba(240,136,62,.1)',
            border: '1px solid rgba(240,136,62,.25)',
          }}
        >
          {matchInfo.matched}/{matchInfo.total} ejercicios enlazados con ExerciseDB. Completa
          los faltantes con el picker.
        </p>
      )}

      <div className="animate-slide-up delay-100 fp-card" style={{ borderRadius: 14, padding: 14 }}>
        {children}
      </div>

      {errors.length > 0 && !nombreError && !hideActions && (
        <p style={{ fontSize: 12, color: 'var(--accent-red)', marginTop: 10 }}>
          Revisa los campos marcados antes de continuar.
        </p>
      )}

      {footer}
    </div>
  );
};

export const FormField = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div style={{ marginBottom: 16 }}>
    <label
      style={{
        display: 'block',
        fontSize: 10,
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '.06em',
        marginBottom: 7,
      }}
    >
      {label}
      {required && <span style={{ color: 'var(--accent-red)', marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {error && <p style={{ marginTop: 5, fontSize: 12, color: 'var(--accent-red)' }}>{error}</p>}
  </div>
);

export const LEVEL_ACCENTS: Record<RoutineFormLevel, string> = {
  basica: '#22c55e',
  intermedia: '#58a6ff',
  avanzada: '#a371f7',
};
