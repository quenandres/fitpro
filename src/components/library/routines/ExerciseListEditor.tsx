import { useState } from 'react';
import { Eye, Plus, Trash2, Link2, Unlink, Dumbbell, GripVertical, Clock } from 'lucide-react';
import {
  ExercisePickerOverlay,
  type PickedExercise,
} from '../../exercise/ExercisePickerOverlay';
import type { RoutineFormExercise, RoutineFormLevel } from '../../../types';
import { getFieldError } from '../../../utils/routineFormValidators';
import type { ValidationError } from '../../../utils/validators';
import { ExercisePreviewModal } from './ExercisePreviewModal';
import { EmptyState } from '../../common/EmptyState';

interface Props {
  level: RoutineFormLevel;
  ejercicios: RoutineFormExercise[];
  errors: ValidationError[];
  selectedExerciseIds: number[];
  restBetweenSetsSec?: number;
  showRpe?: boolean;
  showSuperset?: boolean;
  onAdd: (picked: PickedExercise) => void;
  onUpdate: (key: string, patch: Partial<RoutineFormExercise>) => void;
  onRemove: (key: string) => void;
  onCreateSuperset: (keys: string[]) => void;
  onRemoveSuperset: (groupId: string) => void;
  displayMode?: 'default' | 'studio';
}

export const ExerciseListEditor = ({
  level,
  ejercicios,
  errors,
  selectedExerciseIds,
  restBetweenSetsSec = 60,
  showRpe = false,
  showSuperset = false,
  onAdd,
  onUpdate,
  onRemove,
  onCreateSuperset,
  onRemoveSuperset,
  displayMode = 'default',
}: Props) => {
  const studio = displayMode === 'studio';
  const restMin = Math.round(restBetweenSetsSec / 60) || 1;
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedForSuperset, setSelectedForSuperset] = useState<string[]>([]);
  const [previewKey, setPreviewKey] = useState<string | null>(null);

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
      <div className="flex justify-between items-center mb-2.5">
        <label className="fp-cal-label mb-0">
          {studio ? 'Secuencia de ejercicios' : 'Ejercicios (ExerciseDB)'}
        </label>
        <button
          type="button"
          className="fp-btn fp-btn-secondary"
          style={{ gap: 5, fontSize: 12, padding: '6px 10px' }}
          onClick={() => {
            setPreviewKey(null);
            setPickerOpen(true);
          }}
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
        <EmptyState
          icon={Dumbbell}
          title="Sin ejercicios"
          description="Añade ejercicios desde la biblioteca ExerciseDB"
          className="py-8"
          action={
            <button type="button" className="fp-btn fp-btn-secondary text-xs gap-1" onClick={() => { setPreviewKey(null); setPickerOpen(true); }}>
              <Plus size={14} /> Añadir ejercicio
            </button>
          }
        />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ejercicios.map((ej, rowIndex) => {
          const key = exerciseKey(ej);
          const inSuperset = Boolean(ej.grupo_superset);
          const supersetSelected = selectedForSuperset.includes(key);
          const muscleTags = ej.musculos_anatomia?.slice(0, 2) ?? [];

          return (
            <div
              key={key}
              className="fp-card relative"
              style={{
                padding: studio ? '12px 12px 12px 10px' : 10,
                borderRadius: 12,
                borderColor: inSuperset ? 'rgba(163,113,247,.35)' : undefined,
                background: inSuperset ? 'rgba(163,113,247,.06)' : undefined,
              }}
            >
              <div className="flex flex-col gap-2">
              <div className="flex gap-2.5 items-start">
                {studio ? (
                  <div className="flex flex-col items-center gap-1 shrink-0 pt-1" aria-hidden>
                    <GripVertical size={14} color="var(--text-muted)" />
                    <span
                      className="font-sora"
                      style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}
                    >
                      {rowIndex + 1}
                    </span>
                  </div>
                ) : null}
                {ej.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setPreviewKey(key)}
                    aria-label={`Previsualizar ${ej.nombre}`}
                    className="shrink-0 w-11 h-11 rounded-[9px] overflow-hidden border border-[rgba(88,166,255,.2)] p-0 bg-transparent cursor-pointer"
                  >
                    <img
                      src={ej.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                )}
                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    className="font-sora truncate block w-full text-left text-[13px] font-semibold text-primary mb-2 p-0 bg-transparent border-none cursor-pointer"
                    onClick={() => setPreviewKey(key)}
                  >
                    {ej.nombre}
                  </button>
                  {studio ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                      {muscleTags.map((m) => (
                        <span
                          key={m}
                          className="badge badge-blue"
                          style={{ fontSize: 9, padding: '2px 6px', textTransform: 'capitalize' }}
                        >
                          {m}
                        </span>
                      ))}
                      <span
                        className="badge"
                        style={{
                          fontSize: 9,
                          padding: '2px 6px',
                          background: 'var(--bg-overlay)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Vol: {ej.series} × {ej.valor}
                      </span>
                      {showRpe && ej.rpe != null ? (
                        <span
                          className="badge"
                          style={{
                            fontSize: 9,
                            padding: '2px 6px',
                            background: 'var(--text-primary)',
                            color: 'var(--bg-app)',
                          }}
                        >
                          RPE {ej.rpe}
                        </span>
                      ) : null}
                      <span
                        style={{
                          fontSize: 10,
                          color: 'var(--text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <Clock size={10} />
                        {restMin} min
                      </span>
                    </div>
                  ) : null}
                  <div
                    className={`grid gap-2 ${showRpe ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}
                  >
                    <div>
                      <label className="fp-cal-label mb-1">Series</label>
                      <input
                        className="fp-input mt-1 py-1.5 px-2.5"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={20}
                        value={ej.series}
                        onChange={(e) =>
                          onUpdate(key, { series: Number(e.target.value) || 1 })
                        }
                      />
                    </div>
                    <div>
                      <label className="fp-cal-label mb-1">Reps</label>
                      <input
                        className="fp-input mt-1 py-1.5 px-2.5"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={1000}
                        value={ej.valor}
                        onChange={(e) =>
                          onUpdate(key, { valor: Number(e.target.value) || 1 })
                        }
                      />
                    </div>
                    {showRpe && (
                      <div className="col-span-2 sm:col-span-1">
                        <label className="fp-cal-label mb-1">RPE</label>
                        <input
                          className="fp-input mt-1 py-1.5 px-2.5"
                          type="number"
                          inputMode="numeric"
                          min={1}
                          max={10}
                          placeholder="—"
                          value={ej.rpe ?? ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            onUpdate(key, { rpe: v === '' ? undefined : Number(v) });
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {inSuperset && (
                    <span
                      className="badge inline-block mt-2 text-[9px]"
                      style={{
                        background: 'rgba(163,113,247,.14)',
                        color: '#a371f7',
                        border: '1px solid rgba(163,113,247,.3)',
                      }}
                    >
                      Superset
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 justify-end sm:flex-col sm:absolute sm:top-2.5 sm:right-2.5">
                  <button
                    type="button"
                    className="fp-btn fp-btn-ghost p-1.5 rounded-lg"
                    onClick={() => setPreviewKey(key)}
                    aria-label="Previsualizar ejercicio"
                  >
                    <Eye size={14} color="var(--text-muted)" />
                  </button>
                  {showSuperset && (
                    <button
                      type="button"
                      className="fp-btn fp-btn-ghost p-1.5 rounded-lg"
                      style={{
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
                    className="fp-btn fp-btn-ghost p-1.5 rounded-lg text-[var(--accent-red)]"
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
          selectedExerciseIds={selectedExerciseIds}
          onClose={() => setPickerOpen(false)}
          onSelect={onAdd}
        />
      )}

      <ExercisePreviewModal
        ejercicio={ejercicios.find((ej) => exerciseKey(ej) === previewKey) ?? null}
        restBetweenSetsSec={restBetweenSetsSec}
        onClose={() => setPreviewKey(null)}
      />
    </div>
  );
};
