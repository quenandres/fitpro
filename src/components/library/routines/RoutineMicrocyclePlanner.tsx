import { DIAS_SEMANA } from '../../userPlans/diasSemana';
import type { RoutineFormSemana } from '../../../types';

interface Props {
  accent: string;
  semanaActiva: number;
  totalSemanas: number;
  diaIndex: number;
  activeSemanaPlan?: RoutineFormSemana;
  onDiaChange: (index: number) => void;
  onSessionNameChange?: (index: number, nombre: string) => void;
}

function countTrainingDays(semana?: RoutineFormSemana): number {
  if (!semana) return 0;
  return semana.dias.filter((d) => d.ejercicios.length > 0).length;
}

export const RoutineMicrocyclePlanner = ({
  accent,
  semanaActiva,
  totalSemanas,
  diaIndex,
  activeSemanaPlan,
  onDiaChange,
  onSessionNameChange,
}: Props) => {
  const trainingDays = countTrainingDays(activeSemanaPlan);
  const optimalFreq = 4;

  const activeDia = activeSemanaPlan?.dias[diaIndex];
  const seriesTotal =
    activeDia?.ejercicios.reduce((acc, e) => acc + e.series, 0) ?? 0;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
        <div>
          <p className="fp-cal-label" style={{ marginBottom: 2 }}>
            Distribución del microciclo
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Semana {semanaActiva} de {totalSemanas} · {trainingDays} días con sesión
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => {
            const match = trainingDays === n;
            return (
              <span
                key={n}
                title={`${n} días / semana`}
                style={{
                  minWidth: 28,
                  height: 28,
                  borderRadius: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  border: `1px solid ${match ? accent : 'var(--border)'}`,
                  background: match ? `color-mix(in srgb, ${accent} 18%, transparent)` : 'var(--bg-elevated)',
                  color: match ? accent : 'var(--text-muted)',
                }}
              >
                {n}
              </span>
            );
          })}
          {trainingDays === optimalFreq ? (
            <span className="badge badge-brand" style={{ fontSize: 9, padding: '2px 8px', marginLeft: 4 }}>
              Óptimo
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-3" role="tablist" aria-label="Días de la semana">
        {DIAS_SEMANA.map((def, index) => {
          const dia = activeSemanaPlan?.dias[index];
          const active = index === diaIndex;
          const hasWork = (dia?.ejercicios.length ?? 0) > 0;
          const label = dia?.nombre?.trim() || (hasWork ? 'Sesión' : 'Descanso');
          return (
            <button
              key={def.dia}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onDiaChange(index)}
              style={{
                padding: '8px 4px',
                borderRadius: 10,
                cursor: 'pointer',
                border: `1px solid ${active ? accent : 'var(--border)'}`,
                background: active ? `color-mix(in srgb, ${accent} 14%, var(--bg-card))` : 'var(--bg-elevated)',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 700, color: active ? accent : 'var(--text-primary)' }}>
                {def.nombreCorto.charAt(0)}
              </p>
              <p
                style={{
                  fontSize: 8,
                  fontWeight: 600,
                  color: hasWork ? 'var(--text-secondary)' : 'var(--text-muted)',
                  marginTop: 2,
                  lineHeight: 1.2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {hasWork ? label : '—'}
              </p>
            </button>
          );
        })}
      </div>

      {activeDia ? (
        <div
          className="fp-card"
          style={{
            padding: '10px 12px',
            background: 'var(--bg-elevated)',
            boxShadow: 'none',
            marginBottom: 8,
          }}
        >
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>
              {DIAS_SEMANA[diaIndex]?.nombre ?? 'Día'}
            </strong>
            {' — '}
            {onSessionNameChange ? (
              <input
                className="fp-input inline-block"
                style={{ display: 'inline', width: 'auto', minWidth: 120, padding: '2px 8px', fontSize: 12 }}
                value={activeDia.nombre}
                onChange={(e) => onSessionNameChange(diaIndex, e.target.value)}
                aria-label="Nombre de la sesión"
              />
            ) : (
              activeDia.nombre
            )}
            {' · '}
            {activeDia.ejercicios.length} ejercicios · {seriesTotal} series
          </p>
        </div>
      ) : null}
    </div>
  );
};
