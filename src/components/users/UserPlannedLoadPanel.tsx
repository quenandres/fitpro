import { useMemo } from 'react';
import { AnatomyMuscleHeatmap } from '../anatomy/AnatomyMuscleHeatmap';
import type { Ejercicio, Rutina, Usuario } from '../../types';
import {
  aggregatePlannedWeekLoad,
  detectLoadWarnings,
  topMusclesByLoad,
  totalPlannedSeries,
} from '../../utils/plannedMuscleLoad';

interface Props {
  user: Usuario;
  semana: number;
  ejercicios: Ejercicio[];
  rutinas: Rutina[];
}

export function UserPlannedLoadPanel({ user, semana, ejercicios, rutinas }: Props) {
  const counts = useMemo(
    () => aggregatePlannedWeekLoad(user, semana, ejercicios, rutinas),
    [user, semana, ejercicios, rutinas],
  );

  const top = useMemo(() => topMusclesByLoad(counts, 6), [counts]);
  const warnings = useMemo(() => detectLoadWarnings(counts), [counts]);
  const seriesTotal = useMemo(() => totalPlannedSeries(user, semana, rutinas), [user, semana, rutinas]);

  return (
    <div className="fp-card min-w-0" style={{ padding: 16, borderRadius: 16 }}>
      <div className="mb-3">
        <h3 className="font-sora text-sm font-bold text-primary">Carga planificada</h3>
        <p className="text-[11px] text-muted mt-1 leading-snug">
          Estimación relativa según series y RPE programados — no representa tonelaje ni carga
          realizada.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-[10px] px-3 py-2" style={{ background: '#58a6ff15' }}>
          <p className="text-[9px] font-bold tracking-wide" style={{ color: '#58a6ff' }}>
            SERIES SEMANA
          </p>
          <p className="font-sora text-lg font-bold" style={{ color: '#58a6ff' }}>
            {seriesTotal}
          </p>
        </div>
        <div className="rounded-[10px] px-3 py-2" style={{ background: '#a371f715' }}>
          <p className="text-[9px] font-bold tracking-wide" style={{ color: '#a371f7' }}>
            MÚSCULOS
          </p>
          <p className="font-sora text-lg font-bold" style={{ color: '#a371f7' }}>
            {top.length}
          </p>
        </div>
      </div>

      {top.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {top.map(({ muscle, load }) => (
            <span
              key={muscle}
              className="badge"
              style={{
                fontSize: 10,
                padding: '3px 8px',
                background: 'var(--bg-overlay)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {muscle} · {Math.round(load)}
            </span>
          ))}
        </div>
      ) : null}

      <div className="max-h-[42vh] overflow-hidden mb-3">
        <AnatomyMuscleHeatmap counts={counts} compact />
      </div>

      {warnings.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {warnings.map((w) => (
            <li
              key={w}
              className="text-[11px] rounded-lg px-2.5 py-2"
              style={{
                background: 'rgba(240,136,62,.12)',
                color: 'var(--text-secondary)',
                border: '1px solid rgba(240,136,62,.25)',
              }}
            >
              {w}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
