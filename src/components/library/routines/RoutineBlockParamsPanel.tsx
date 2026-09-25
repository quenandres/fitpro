import type { AtletaAsignado } from '../../users/AtletaAsignadoCard';
import { AtletaAsignadoCard } from '../../users/AtletaAsignadoCard';
import { useNavigate } from 'react-router-dom';
import type { RoutineFormData, RoutineFormLevel } from '../../../types';
import { LEVEL_ROUTES } from '../../../hooks/useRoutineFormWithPreset';
import { countTotalEjercicios, countDiasEntreno } from '../../../utils/routineScheduleUtils';
import { MOCK_PROGRESSION_WEEKS } from '../../../data/routineBuilderMock';

const LEVEL_OPTIONS: Array<{ id: RoutineFormLevel; label: string }> = [
  { id: 'basica', label: 'Básica' },
  { id: 'intermedia', label: 'Intermedia' },
  { id: 'avanzada', label: 'Avanzada' },
];

interface Props {
  level: RoutineFormLevel;
  form?: RoutineFormData;
  savedId?: number | null;
  presetQueued?: string | null;
  blockWeeks?: number;
  onSaveDraft?: () => void;
  isSaving?: boolean;
  showProgressionChart?: boolean;
  atleta?: AtletaAsignado | null;
  onCambiarAtleta?: () => void;
}

export const RoutineBlockParamsPanel = ({
  level,
  form,
  savedId,
  presetQueued,
  blockWeeks,
  onSaveDraft,
  isSaving,
  showProgressionChart = true,
  atleta = null,
  onCambiarAtleta,
}: Props) => {
  const navigate = useNavigate();
  const semanas = blockWeeks ?? form?.semanas ?? 8;
  const freq =
    form?.programacion_semanal?.[0] != null
      ? countDiasEntreno(form.programacion_semanal[0])
      : null;
  const uniqueEx =
    form != null ? countTotalEjercicios(form.programacion_semanal) : null;

  const handleLevelChange = (next: RoutineFormLevel) => {
    if (next === level) return;
    navigate(LEVEL_ROUTES[next], {
      state: form ? { presetForm: form } : undefined,
    });
  };

  return (
    <div className="fp-card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p className="fp-cal-label" style={{ margin: 0 }}>
          Parámetros del bloque
        </p>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text-muted)' }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--brand)',
            }}
            aria-hidden
          />
          Autoguardado local
        </span>
      </div>

      <div style={{ marginBottom: 14 }}>
        <p className="fp-cal-label" style={{ marginBottom: 6 }}>
          Precisión del constructor
        </p>
        <div className="flex flex-wrap gap-1.5">
          {LEVEL_OPTIONS.map(({ id, label }) => {
            const active = id === level;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleLevelChange(id)}
                className="text-xs font-semibold"
                style={{
                  padding: '5px 10px',
                  borderRadius: 100,
                  cursor: 'pointer',
                  border: `1px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
                  background: active ? 'var(--brand-dim)' : 'var(--bg-elevated)',
                  color: active ? 'var(--brand)' : 'var(--text-secondary)',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <AtletaAsignadoCard atleta={atleta} onCambiar={onCambiarAtleta} />
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 14px', fontSize: 12, color: 'var(--text-secondary)' }}>
        <li style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <span>Duración del bloque</span>
          <strong style={{ color: 'var(--text-primary)' }}>{semanas} sem</strong>
        </li>
        <li style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <span>Estado</span>
          <span className="badge badge-brand" style={{ fontSize: 9, padding: '2px 8px' }}>
            {savedId != null ? 'En biblioteca' : 'Borrador'}
          </span>
        </li>
        {freq != null ? (
          <li style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <span>Frecuencia semanal</span>
            <strong style={{ color: 'var(--text-primary)' }}>{freq} días / sem</strong>
          </li>
        ) : null}
        {uniqueEx != null ? (
          <li style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span>Ejercicios (programación)</span>
            <strong style={{ color: 'var(--text-primary)' }}>{uniqueEx}</strong>
          </li>
        ) : null}
      </ul>

      {presetQueued ? (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
          Plantilla en cola: <strong style={{ color: 'var(--text-secondary)' }}>{presetQueued}</strong>
        </p>
      ) : null}

      {showProgressionChart && level !== 'basica' ? (
        <div style={{ marginBottom: 14 }}>
          <p className="fp-cal-label" style={{ marginBottom: 8 }}>
            Curva de progresión (vista)
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 48 }}>
            {MOCK_PROGRESSION_WEEKS.map((w, i) => (
              <div
                key={w.week}
                title={`${w.label}: ${w.note}`}
                style={{
                  flex: 1,
                  height: `${30 + (i % 3) * 12 + (w.note === 'Descarga' ? -8 : 0)}%`,
                  borderRadius: 3,
                  background:
                    w.note === 'Descarga'
                      ? 'color-mix(in srgb, var(--text-muted) 35%, transparent)'
                      : 'color-mix(in srgb, var(--accent-purple) 45%, transparent)',
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>
            Referencia visual — no altera el guardado.
          </p>
        </div>
      ) : null}

      {onSaveDraft ? (
        <button
          type="button"
          className="fp-btn fp-btn-secondary w-full justify-center"
          disabled={isSaving}
          onClick={() => void onSaveDraft()}
        >
          {isSaving ? 'Guardando…' : 'Guardar borrador ahora'}
        </button>
      ) : null}
    </div>
  );
};
