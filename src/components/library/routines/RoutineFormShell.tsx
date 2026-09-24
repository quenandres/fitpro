import type { ReactNode } from 'react';
import { PageBackRow } from '../../common/PageBackButton';
import type { RoutineFormLevel } from '../../../types';
import type { ValidationError } from '../../../utils/validators';
import { getFieldError } from '../../../utils/routineFormValidators';
import { PresetBanner } from './PresetBanner';

import { ROUTES } from '../../../routes/paths';
import { RoutineCreationChrome } from './RoutineCreationChrome';

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
  const backLabel = 'Volver a métodos de creación';
  const nombreError = getFieldError(errors, 'nombre');

  return (
    <div>
      <PageBackRow to={meta.backTo} label={backLabel} className="animate-slide-up" />

      <RoutineCreationChrome
        crumbs={[
          { label: 'Rutinas', to: ROUTES.library.rutinas },
          { label: 'Nueva rutina', to: ROUTES.library.rutinasNueva },
          { label: 'Constructor manual' },
        ]}
        title={isEdit ? `Editar rutina (${meta.badge.toLowerCase()})` : 'Constructor de rutina paso a paso'}
        subtitle="Tres fases: estructura semanal, ejercicios y cargas. Los ejercicios se resuelven con ExerciseDB."
        badges={
          <>
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
              Modo constructor · {meta.badge}
            </span>
            <span className="badge badge-brand" style={{ fontSize: 10, padding: '3px 8px' }}>
              Listo para editar
            </span>
          </>
        }
      />

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
  <div className="mb-4">
    <label className="fp-cal-label">
      {label}
      {required ? <span className="text-[var(--accent-red)] ml-0.5">*</span> : null}
    </label>
    {children}
    {error ? <p className="mt-1 text-xs text-[var(--accent-red)]">{error}</p> : null}
  </div>
);

export const LEVEL_ACCENTS: Record<RoutineFormLevel, string> = {
  basica: '#22c55e',
  intermedia: '#58a6ff',
  avanzada: '#a371f7',
};
