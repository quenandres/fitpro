import { ChevronLeft, ChevronRight, Copy, RefreshCw } from 'lucide-react';
import { DIAS_SEMANA } from '../../userPlans/diasSemana';
import type { RoutineCreateMode, RoutineFormSemana } from '../../../types';
import { MAX_RUTINA_SEMANAS, MIN_RUTINA_SEMANAS } from '../../../utils/routineScheduleUtils';

interface Props {
  semanas: number;
  semanaActiva: number;
  diaIndex: number;
  accent: string;
  onSemanasChange: (n: number) => void;
  onSemanaChange: (semana: number) => void;
  onDiaChange: (index: number) => void;
  activeSemanaPlan?: RoutineFormSemana;
  createMode?: RoutineCreateMode;
  onApplyToAll?: () => void;
  onCopyWeekFrom?: (origen: number) => void;
  /** Si se provee, sustituye la detección vía activeSemanaPlan. */
  dayHasExercises?: (index: number) => boolean;
  durationLabel?: string;
  /** Muestra aplicar semana 1 y copiar semana anterior (p. ej. plan de cliente). */
  showBothWeekActions?: boolean;
  variant?: 'card' | 'embedded';
}

export const RoutineWeekDayNav = ({
  semanas,
  semanaActiva,
  diaIndex,
  activeSemanaPlan,
  createMode = 'semana_tipo',
  accent,
  onSemanasChange,
  onSemanaChange,
  onDiaChange,
  onApplyToAll,
  onCopyWeekFrom,
  dayHasExercises,
  durationLabel = 'Duración del programa',
  showBothWeekActions = false,
  variant = 'card',
}: Props) => {
  const decSemanas = () => onSemanasChange(Math.max(MIN_RUTINA_SEMANAS, semanas - 1));
  const incSemanas = () => onSemanasChange(Math.min(MAX_RUTINA_SEMANAS, semanas + 1));

  const showApplyAll = showBothWeekActions
    ? semanas > 1 && !!onApplyToAll
    : createMode === 'semana_tipo' && semanas > 1 && !!onApplyToAll;
  const showCopyWeek = showBothWeekActions
    ? semanas > 1 && semanaActiva > 1 && !!onCopyWeekFrom
    : createMode === 'semana_a_semana' && semanas > 1 && semanaActiva > 1 && !!onCopyWeekFrom;

  return (
    <div
      className={variant === 'card' ? 'fp-card' : undefined}
      style={
        variant === 'card'
          ? { borderRadius: 13, padding: '12px 14px', marginBottom: 16 }
          : undefined
      }
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div>
          <p className="fp-cal-label" style={{ marginBottom: 2 }}>
            {durationLabel}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {semanas} {semanas === 1 ? 'semana' : 'semanas'} · máx. {MAX_RUTINA_SEMANAS}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            className="fp-btn fp-btn-ghost"
            style={{ width: 36, height: 36, padding: 0 }}
            onClick={decSemanas}
            disabled={semanas <= MIN_RUTINA_SEMANAS}
            aria-label="Menos semanas"
          >
            <ChevronLeft size={16} />
          </button>
          <span
            className="font-sora"
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: accent,
              minWidth: 28,
              textAlign: 'center',
            }}
          >
            {semanas}
          </span>
          <button
            type="button"
            className="fp-btn fp-btn-ghost"
            style={{ width: 36, height: 36, padding: 0 }}
            onClick={incSemanas}
            disabled={semanas >= MAX_RUTINA_SEMANAS}
            aria-label="Más semanas"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="fp-week-rail" role="tablist" aria-label="Semanas del programa">
        {Array.from({ length: semanas }, (_, i) => i + 1).map((num) => {
          const active = num === semanaActiva;
          return (
            <button
              key={num}
              type="button"
              role="tab"
              aria-selected={active}
              className="fp-week-rail-chip font-sora"
              onClick={() => onSemanaChange(num)}
              style={{
                borderColor: active ? `${accent}66` : 'var(--border)',
                background: active ? `${accent}18` : 'var(--bg-overlay)',
                color: active ? accent : 'var(--text-muted)',
              }}
            >
              {num}
            </button>
          );
        })}
      </div>

      <p
        className="font-sora"
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '12px 0 8px',
        }}
      >
        Semana {semanaActiva}
      </p>

      <div className="fp-week-day-pills" role="tablist" aria-label="Días de la semana">
        {DIAS_SEMANA.map((def, index) => {
          const planDia = activeSemanaPlan?.dias[index];
          const hasExercises = dayHasExercises
            ? dayHasExercises(index)
            : (planDia?.ejercicios.length ?? 0) > 0;
          const active = index === diaIndex;
          return (
            <button
              key={def.dia}
              type="button"
              role="tab"
              aria-selected={active}
              className="fp-week-day-pill"
              onClick={() => onDiaChange(index)}
              style={{
                borderColor: active ? `${accent}66` : 'var(--border)',
                background: active ? `${accent}14` : 'var(--bg-elevated)',
                color: active ? accent : 'var(--text-secondary)',
              }}
            >
              <span>{def.nombreCorto}</span>
              {hasExercises ? (
                <span
                  className="fp-week-day-dot"
                  style={{ background: active ? accent : 'var(--brand)' }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {(showApplyAll || showCopyWeek) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          {showApplyAll ? (
            <button
              type="button"
              className="fp-btn fp-btn-secondary"
              style={{ fontSize: 12, gap: 6, padding: '8px 12px' }}
              onClick={onApplyToAll}
            >
              <RefreshCw size={14} />
              Aplicar semana 1 a todas
            </button>
          ) : null}
          {showCopyWeek ? (
            <button
              type="button"
              className="fp-btn fp-btn-secondary"
              style={{ fontSize: 12, gap: 6, padding: '8px 12px' }}
              onClick={() => onCopyWeekFrom(semanaActiva - 1)}
            >
              <Copy size={14} />
              Copiar desde semana {semanaActiva - 1}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};
