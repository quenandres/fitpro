import { useState } from 'react';
import { Plus, Trash2, Link2, Unlink } from 'lucide-react';
import {
  ExercisePickerOverlay,
  type PickedExercise,
} from '../../exercise/ExercisePickerOverlay';
import type { RoutineFormExercise, RoutineFormLevel } from '../../../types';
import { getFieldError } from '../../../utils/routineFormValidators';
import type { ValidationError } from '../../../utils/validators';

interface Props {
  level: RoutineFormLevel;
  ejercicios: RoutineFormExercise[];
  errors: ValidationError[];
  selectedNames: string[];
  showRpe?: boolean;
  showSuperset?: boolean;
  onAdd: (picked: PickedExercise) => void;
  onUpdate: (key: string, patch: Partial<RoutineFormExercise>) => void;
  onRemove: (key: string) => void;
  onCreateSuperset: (keys: string[]) => void;
  onRemoveSuperset: (groupId: string) => void;
}

export const ExerciseListEditor = ({
  level,
  ejercicios,
  errors,
  selectedNames,
  showRpe = false,
  showSuperset = false,
  onAdd,
  onUpdate,
  onRemove,
  onCreateSuperset,
  onRemoveSuperset,
}: Props) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedForSuperset, setSelectedForSuperset] = useState<string[]>([]);

  const ejerciciosError = getFieldError(errors, 'ejercicios');
  const exerciseKey = (ej: RoutineFormExercise) => ej._key ?? ej.nombre;

  const toggleSupersetSelect = (key: string) => {
    setSelectedForSuperset((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleCreateSuperset = () => {
    if (selectedForSuperset.length >= 2) {
      onCreateSuperset(selectedForSuperset);
      setSelectedForSuperset([]);
    }
  };

  const groupedSupersets = [...new Set(ejercicios.map((e) => e.grupo_superset).filter(Boolean))];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '.06em',
          }}
        >
          Ejercicios (ExerciseDB)
        </p>
        <button
          type="button"
          className="fp-btn fp-btn-secondary"
          style={{ gap: 5, fontSize: 12, padding: '6px 10px' }}
          onClick={() => setPickerOpen(true)}
        >
          <Plus size={14} /> Añadir
        </button>
      </div>

      {showSuperset && selectedForSuperset.length >= 2 && (
        <button
          type="button"
          className="fp-btn fp-btn-primary"
          style={{ width: '100%', marginBottom: 10, gap: 6, fontSize: 12 }}
          onClick={handleCreateSuperset}
        >
          <Link2 size={14} />
          Crear superset ({selectedForSuperset.length})
        </button>
      )}

      {showSuperset &&
        groupedSupersets.map((groupId) => (
          <div
            key={groupId}
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: 6,
            }}
          >
            <button
              type="button"
              className="fp-btn fp-btn-ghost"
              style={{ gap: 4, fontSize: 11, padding: '4px 8px' }}
              onClick={() => onRemoveSuperset(groupId!)}
            >
              <Unlink size={12} /> Desagrupar superset
            </button>
          </div>
        ))}

      {ejercicios.length === 0 && (
        <div
          className="fp-card text-center"
          style={{ padding: '28px 16px', borderRadius: 12, marginBottom: 8 }}
        >
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Añade ejercicios desde la biblioteca ExerciseDB
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ejercicios.map((ej) => {
          const key = exerciseKey(ej);
          const inSuperset = Boolean(ej.grupo_superset);
          const supersetSelected = selectedForSuperset.includes(key);

          return (
            <div
              key={key}
              className="fp-card"
              style={{
                padding: 10,
                borderRadius: 12,
                borderColor: inSuperset ? 'rgba(163,113,247,.35)' : undefined,
                background: inSuperset ? 'rgba(163,113,247,.06)' : undefined,
              }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                {ej.imageUrl && (
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 9,
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '1px solid rgba(88,166,255,.2)',
                    }}
                  >
                    <img
                      src={ej.imageUrl}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    className="font-sora truncate"
                    style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}
                  >
                    {ej.nombre}
                  </p>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: showRpe ? '1fr 1fr 1fr' : '1fr 1fr',
                      gap: 8,
                    }}
                  >
                    <div>
                      <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
                        Series
                      </label>
                      <input
                        className="fp-input"
                        type="number"
                        min={1}
                        max={20}
                        value={ej.series}
                        onChange={(e) =>
                          onUpdate(key, { series: Number(e.target.value) || 1 })
                        }
                        style={{ padding: '7px 10px', marginTop: 4 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
                        Reps
                      </label>
                      <input
                        className="fp-input"
                        type="number"
                        min={1}
                        max={1000}
                        value={ej.valor}
                        onChange={(e) =>
                          onUpdate(key, { valor: Number(e.target.value) || 1 })
                        }
                        style={{ padding: '7px 10px', marginTop: 4 }}
                      />
                    </div>
                    {showRpe && (
                      <div>
                        <label style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
                          RPE
                        </label>
                        <input
                          className="fp-input"
                          type="number"
                          min={1}
                          max={10}
                          placeholder="—"
                          value={ej.rpe ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            onUpdate(key, { rpe: v === '' ? undefined : Number(v) });
                          }}
                          style={{ padding: '7px 10px', marginTop: 4 }}
                        />
                      </div>
                    )}
                  </div>
                  {inSuperset && (
                    <span
                      className="badge"
                      style={{
                        marginTop: 8,
                        fontSize: 9,
                        background: 'rgba(163,113,247,.14)',
                        color: '#a371f7',
                        border: '1px solid rgba(163,113,247,.3)',
                      }}
                    >
                      Superset
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {showSuperset && (
                    <button
                      type="button"
                      className="fp-btn fp-btn-ghost"
                      style={{
                        padding: 6,
                        borderRadius: 8,
                        borderColor: supersetSelected ? 'rgba(163,113,247,.4)' : undefined,
                      }}
                      onClick={() => toggleSupersetSelect(key)}
                      aria-label="Seleccionar para superset"
                    >
                      <Link2 size={14} color={supersetSelected ? '#a371f7' : 'var(--text-muted)'} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="fp-btn fp-btn-ghost"
                    style={{ padding: 6, borderRadius: 8, color: 'var(--accent-red)' }}
                    onClick={() => onRemove(key)}
                    aria-label="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {ejerciciosError && (
        <p style={{ fontSize: 12, color: 'var(--accent-red)', marginTop: 8 }}>{ejerciciosError}</p>
      )}

      {pickerOpen && (
        <ExercisePickerOverlay
          title={`Añadir ejercicio — rutina ${level}`}
          selectedNames={selectedNames}
          onClose={() => setPickerOpen(false)}
          onSelect={onAdd}
        />
      )}
    </div>
  );
};
