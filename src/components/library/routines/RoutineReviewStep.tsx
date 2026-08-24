import { useMemo } from 'react';
import { AnatomyMuscleHeatmap } from '../../anatomy';
import { useDataStore } from '../../../store/useDataStore';
import { useRoutineMuscleCounts } from '../../../hooks/useRoutineMuscleCounts';
import type { RoutineFormData } from '../../../types';

interface Props {
  form: RoutineFormData;
  isEdit: boolean;
  onMusclesResolved?: (updates: Array<{ key: string; musculos_anatomia: string[] }>) => void;
}

export const RoutineReviewStep = ({ form, isEdit, onMusclesResolved }: Props) => {
  const ejerciciosLib = useDataStore((s) => s.ejercicios);

  const { counts: muscleCounts, loading: musclesLoading } = useRoutineMuscleCounts(
    form.ejercicios,
    ejerciciosLib,
    onMusclesResolved,
  );

  const muscleEntries = useMemo(
    () =>
      Object.entries(muscleCounts).sort(([, a], [, b]) => b - a),
    [muscleCounts],
  );

  const hasMuscleData = muscleEntries.length > 0;

  const totalSeries = form.ejercicios.reduce((a, e) => a + e.series, 0);
  const rows = [
    { lbl: 'Nombre', val: form.nombre || '—' },
    { lbl: 'Categoría', val: form.categoria || '—' },
    { lbl: 'Dificultad', val: form.dificultad },
    { lbl: 'Duración', val: `${form.duracion_min} min` },
    { lbl: 'Tipo', val: form.tipo },
    { lbl: 'Ejercicios', val: form.ejercicios.length },
    { lbl: 'Series totales', val: totalSeries, accent: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="fp-card" style={{ borderRadius: 13, overflow: 'hidden' }}>
        {rows.map(({ lbl, val, accent }, i) => (
          <div
            key={lbl}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '11px 14px',
              borderBottom: i < rows.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{lbl}</span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: accent ? 'var(--brand)' : 'var(--text-primary)',
              }}
            >
              {val}
            </span>
          </div>
        ))}
      </div>

      {form.descripcion && (
        <div className="fp-card" style={{ borderRadius: 13, padding: '12px 14px' }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '.06em',
              marginBottom: 6,
            }}
          >
            Descripción
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {form.descripcion}
          </p>
        </div>
      )}

      {form.notes && (
        <div className="fp-card" style={{ borderRadius: 13, padding: '12px 14px' }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '.06em',
              marginBottom: 6,
            }}
          >
            Notas
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {form.notes}
          </p>
        </div>
      )}

      {form.ejercicios.length > 0 && (
        <div className="fp-card" style={{ borderRadius: 13, padding: '12px 14px' }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '.06em',
              marginBottom: 8,
            }}
          >
            Ejercicios
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {form.ejercicios.map((ej) => (
              <div
                key={ej._key ?? ej.nombre}
                className="flex justify-between gap-2 text-xs text-secondary min-w-0"
              >
                <span className="min-w-0 truncate">{ej.nombre}</span>
                <span className="shrink-0 text-muted">
                  {ej.series}×{ej.valor}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fp-card" style={{ borderRadius: 13, padding: 14 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '.06em',
            marginBottom: 10,
          }}
        >
          Músculos trabajados
        </p>
        {form.ejercicios.length > 0 ? (
          musclesLoading ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              Resolviendo músculos desde ExerciseDB…
            </p>
          ) : hasMuscleData ? (
            <>
              <div className="max-h-[38vh] md:max-h-[52vh] overflow-hidden">
                <AnatomyMuscleHeatmap counts={muscleCounts} compact />
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  marginTop: 10,
                }}
              >
                {muscleEntries.slice(0, 8).map(([muscle, count]) => (
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
                    {muscle} · {count}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              Añade ejercicios desde ExerciseDB para ver el mapa muscular.
            </p>
          )
        ) : (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
            Aún no has añadido ejercicios.
          </p>
        )}
      </div>

      <div
        style={{
          padding: '12px 14px',
          borderRadius: 13,
          background: 'var(--brand-dim)',
          border: '1px solid rgba(34,197,94,.2)',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 500 }}>
          {isEdit ? '¿Todo correcto? Guarda los cambios abajo.' : '¿Todo correcto? Crea la rutina abajo.'}
        </p>
      </div>
    </div>
  );
};
