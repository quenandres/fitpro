import type { Dispatch, SetStateAction } from 'react';
import type { ChatPrefs } from '../../../lib/ai/chatHelpers';
import type { RoutineFormLevel } from '../../../types';
import { RoutineBlockParamsPanel } from './RoutineBlockParamsPanel';

const PRECISION_OPTIONS: Array<{ id: RoutineFormLevel; label: string }> = [
  { id: 'basica', label: 'Básica' },
  { id: 'intermedia', label: 'Intermedia' },
  { id: 'avanzada', label: 'Avanzada' },
];

interface Props {
  precisionLevel: RoutineFormLevel;
  onPrecisionChange: (level: RoutineFormLevel) => void;
  prefs: ChatPrefs;
  setPrefs: Dispatch<SetStateAction<ChatPrefs>>;
  usuarios: Array<{ id: number; nombre: string; peso_kg?: number; objetivo?: string; dias_entrenar?: number; edad?: number; nivel?: string }>;
  selectedCliente?: { objetivo?: string; dias_entrenar?: number };
  mesocycleWeeks: number;
  onMesocycleWeeksChange: (w: number) => void;
}

export const AIRoutineAssistantPanel = ({
  precisionLevel,
  onPrecisionChange,
  prefs,
  setPrefs,
  usuarios,
  selectedCliente,
  mesocycleWeeks,
  onMesocycleWeeksChange,
}: Props) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <RoutineBlockParamsPanel level={precisionLevel} blockWeeks={mesocycleWeeks} showProgressionChart={false} />

    <div className="fp-card" style={{ padding: 14 }}>
      <p className="fp-cal-label" style={{ marginBottom: 8 }}>
        Precisión al editar
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {PRECISION_OPTIONS.map(({ id, label }) => {
          const active = precisionLevel === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onPrecisionChange(id)}
              style={{
                padding: '5px 10px',
                borderRadius: 100,
                fontSize: 11,
                fontWeight: 600,
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

      <p className="fp-cal-label" style={{ marginBottom: 6 }}>
        Duración del mesociclo (referencia)
      </p>
      <div className="flex gap-1.5 mb-4">
        {[4, 6, 8, 12].map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => onMesocycleWeeksChange(w)}
            style={{
              flex: 1,
              padding: '6px 0',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              border: `1px solid ${mesocycleWeeks === w ? 'var(--brand)' : 'var(--border)'}`,
              background: mesocycleWeeks === w ? 'var(--brand-dim)' : 'var(--bg-elevated)',
              color: mesocycleWeeks === w ? 'var(--brand)' : 'var(--text-secondary)',
            }}
          >
            {w} sem
          </button>
        ))}
      </div>

      <label className="fp-cal-label" htmlFor="ia-panel-cliente">
        Cliente (opcional)
      </label>
      <select
        id="ia-panel-cliente"
        className="fp-input mt-1 mb-3 w-full"
        value={prefs.clienteId ?? ''}
        onChange={(e) => {
          const id = e.target.value ? Number(e.target.value) : null;
          const user = id != null ? usuarios.find((u) => u.id === id) : undefined;
          setPrefs((p) => ({
            ...p,
            clienteId: id,
            edad: user?.edad ?? '',
            nivel: user?.nivel?.toString() ?? p.nivel,
          }));
        }}
      >
        <option value="">Sin cliente</option>
        {usuarios.map((u) => (
          <option key={u.id} value={u.id}>
            {u.nombre}
          </option>
        ))}
      </select>

      {selectedCliente ? (
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
          {selectedCliente.objetivo}
          {selectedCliente.dias_entrenar ? ` · ${selectedCliente.dias_entrenar} días/sem` : ''}
        </p>
      ) : null}

      <label className="fp-cal-label" htmlFor="ia-panel-duracion">
        Duración sesión (min)
      </label>
      <input
        id="ia-panel-duracion"
        type="number"
        className="fp-input mt-1 mb-3 w-full"
        min={5}
        max={120}
        value={prefs.duracion_min}
        onChange={(e) =>
          setPrefs((p) => ({
            ...p,
            duracion_min: Number(e.target.value) || 45,
          }))
        }
      />

      <label className="fp-cal-label" htmlFor="ia-panel-equipo">
        Equipamiento
      </label>
      <input
        id="ia-panel-equipo"
        className="fp-input mt-1 mb-3 w-full"
        placeholder="Opcional"
        value={prefs.equipamiento}
        onChange={(e) => setPrefs((p) => ({ ...p, equipamiento: e.target.value }))}
      />

      <label className="fp-cal-label" htmlFor="ia-panel-limitaciones">
        Limitaciones
      </label>
      <input
        id="ia-panel-limitaciones"
        className="fp-input mt-1 w-full"
        placeholder="Opcional"
        value={prefs.limitaciones}
        onChange={(e) => setPrefs((p) => ({ ...p, limitaciones: e.target.value }))}
      />

      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.4 }}>
        El borrador se guarda en biblioteca; la edición detallada abre en el nivel de precisión elegido.
      </p>
    </div>
  </div>
);
