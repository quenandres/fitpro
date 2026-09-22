import { ChevronLeft, ChevronRight, Copy, Lock, RefreshCw } from 'lucide-react';
import { MAX_RUTINA_SEMANAS, MIN_RUTINA_SEMANAS } from '../../utils/routineScheduleUtils';

interface Props {
  semanas: number;
  semanaActiva: number;
  onSemanasChange: (n: number) => void;
  onSemanaChange: (semana: number) => void;
  onApplyToAll?: () => void;
  onCopyWeekFrom?: (origen: number) => void;
  durationLabel?: string;
  showBothWeekActions?: boolean;
  semanaBloqueada?: boolean;
  variant?: 'card' | 'embedded';
}

export function PlanSessionNav({
  semanas,
  semanaActiva,
  onSemanasChange,
  onSemanaChange,
  onApplyToAll,
  onCopyWeekFrom,
  durationLabel = 'Duración del plan',
  showBothWeekActions = false,
  semanaBloqueada = false,
  variant = 'card',
}: Props) {
  const decSemanas = () => onSemanasChange(Math.max(MIN_RUTINA_SEMANAS, semanas - 1));
  const incSemanas = () => onSemanasChange(Math.min(MAX_RUTINA_SEMANAS, semanas + 1));

  const showApplyAll = showBothWeekActions && semanas > 1 && !!onApplyToAll;
  const showCopyWeek = showBothWeekActions && semanas > 1 && semanaActiva > 1 && !!onCopyWeekFrom;

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
            className="fp-btn fp-btn-ghost p-1.5"
            onClick={decSemanas}
            disabled={semanas <= MIN_RUTINA_SEMANAS}
            aria-label="Menos semanas"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs font-semibold tabular-nums min-w-[20px] text-center">{semanas}</span>
          <button
            type="button"
            className="fp-btn fp-btn-ghost p-1.5"
            onClick={incSemanas}
            disabled={semanas >= MAX_RUTINA_SEMANAS}
            aria-label="Más semanas"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: showApplyAll || showCopyWeek ? 0 : undefined,
        }}
      >
        <button
          type="button"
          className="fp-btn fp-btn-ghost p-1.5"
          onClick={() => onSemanaChange(Math.max(1, semanaActiva - 1))}
          disabled={semanaActiva <= 1}
          aria-label="Semana anterior"
        >
          <ChevronLeft size={14} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            Semana {semanaActiva}
          </span>
          {semanaBloqueada ? (
            <span
              className="inline-flex items-center gap-1 badge"
              style={{
                fontSize: 10,
                padding: '2px 7px',
                background: 'rgba(240,136,62,.12)',
                color: '#f0883e',
                border: '1px solid rgba(240,136,62,.3)',
              }}
            >
              <Lock size={10} />
              Completada
            </span>
          ) : null}
        </div>
        <button
          type="button"
          className="fp-btn fp-btn-ghost p-1.5"
          onClick={() => onSemanaChange(Math.min(semanas, semanaActiva + 1))}
          disabled={semanaActiva >= semanas}
          aria-label="Semana siguiente"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {(showApplyAll || showCopyWeek) && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[var(--border-subtle)]">
          {showApplyAll ? (
            <button
              type="button"
              className="fp-btn fp-btn-ghost fp-btn-sm gap-1"
              onClick={onApplyToAll}
            >
              <RefreshCw size={12} />
              Aplicar sem. 1 a todas
            </button>
          ) : null}
          {showCopyWeek ? (
            <button
              type="button"
              className="fp-btn fp-btn-ghost fp-btn-sm gap-1"
              onClick={() => onCopyWeekFrom?.(semanaActiva - 1)}
            >
              <Copy size={12} />
              Copiar semana anterior
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
