import { Clock } from 'lucide-react';
import type { RoutineDurationBreakdown } from '../../../utils/calculateRoutineDuration';

interface Props {
  breakdown: RoutineDurationBreakdown;
  accent?: string;
  error?: string;
}

const formatMinutes = (seconds: number): string => {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (min === 0) return `${sec} s`;
  if (sec === 0) return `${min} min`;
  return `${min} min ${sec} s`;
};

export const CalculatedDurationField = ({
  breakdown,
  accent = '#58a6ff',
  error,
}: Props) => {
  const hasExercises = breakdown.totalSeconds > 0;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 14px',
          borderRadius: 12,
          border: `1px solid ${hasExercises ? `${accent}44` : 'var(--border)'}`,
          background: hasExercises ? `${accent}12` : 'var(--bg-elevated)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: hasExercises ? `${accent}22` : 'var(--bg-overlay)',
            flexShrink: 0,
          }}
        >
          <Clock size={18} color={hasExercises ? accent : 'var(--text-muted)'} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            className="font-sora"
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: hasExercises ? accent : 'var(--text-muted)',
              lineHeight: 1.1,
            }}
          >
            {hasExercises ? `${breakdown.totalMinutes} min` : '—'}
          </p>
          <p className="text-[11px] text-muted mt-1 flex flex-wrap gap-x-1 gap-y-0.5">
            {hasExercises ? (
              <>
                <span>Trabajo {formatMinutes(breakdown.workSeconds)}</span>
                <span className="text-muted/60">·</span>
                <span>Descanso {formatMinutes(breakdown.restSeconds)}</span>
                <span className="text-muted/60">·</span>
                <span>Cambios {formatMinutes(breakdown.transitionSeconds)}</span>
              </>
            ) : (
              'Se calcula al añadir ejercicios'
            )}
          </p>
        </div>
      </div>
      {error && (
        <p style={{ marginTop: 5, fontSize: 12, color: 'var(--accent-red)' }}>{error}</p>
      )}
    </div>
  );
};
