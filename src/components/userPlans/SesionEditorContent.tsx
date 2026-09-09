import { useMemo, useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { Ejercicio, EjercicioPersonalizado, PlanProgresionModo, Rutina } from '../../types';
import { useDataStore } from '../../store/useDataStore';
import { EjercicioSortable } from './EjercicioSortable';
import { RutinaVersionBanner } from './RutinaVersionBanner';
import type { SyncStatus } from '../../utils/compareRutinaSnapshot';
import { buildEjId } from './dragIds';
import {
  ExercisePickerOverlay,
  type PickedExercise,
} from '../exercise/ExercisePickerOverlay';
import type { SesionPersonalizadaPayload } from '../../utils/sesionPlanUtils';

export type SesionDraft = SesionPersonalizadaPayload;

interface Props {
  draft: SesionDraft;
  onDraftChange: (draft: SesionDraft) => void;
  entrenamientoLabel: string;
  semana: number;
  sesionIndex: number;
  totalSemanas: number;
  progresion: PlanProgresionModo;
  readOnly?: boolean;
  ejercicios: Ejercicio[];
  rutinaBase?: Rutina;
  syncStatus?: SyncStatus;
  onResync?: (rutina: Rutina) => void;
}

export function SesionEditorContent({
  draft,
  onDraftChange,
  entrenamientoLabel,
  semana,
  sesionIndex,
  totalSemanas,
  progresion,
  readOnly = false,
  ejercicios,
  rutinaBase,
  syncStatus = 'sin_rutina',
  onResync,
}: Props) {
  const [showEjercicioPicker, setShowEjercicioPicker] = useState(false);
  const unidades = useDataStore((s) => s.unidades);

  const ejerciciosIds = useMemo(
    () => draft.ejercicios.map((_, i) => buildEjId(semana, sesionIndex, i)),
    [draft.ejercicios, semana, sesionIndex],
  );

  const updateDraft = (partial: Partial<SesionDraft>) => {
    onDraftChange({ ...draft, ...partial });
  };

  const handlePickFromOverlay = (pick: PickedExercise) => {
    const nuevo: EjercicioPersonalizado = {
      ejercicio_id: pick.ejercicio_id,
      nombre: pick.nombre,
      series: 3,
      valor: pick.unidad_id_default === 1 ? 12 : 10,
      unidad_id: pick.unidad_id_default,
      notas: '',
      musculos_anatomia: pick.musculos_anatomia,
      rpe: 7,
    };
    updateDraft({ ejercicios: [...draft.ejercicios, nuevo] });
    setShowEjercicioPicker(false);
  };

  const handleRemove = (index: number) => {
    updateDraft({
      ejercicios: draft.ejercicios.filter((_, i) => i !== index),
    });
  };

  const handleUpdate = (index: number, updates: Partial<EjercicioPersonalizado>) => {
    updateDraft({
      ejercicios: draft.ejercicios.map((e, i) => (i === index ? { ...e, ...updates } : e)),
    });
  };

  return (
    <div>
      <p className="text-[11px] text-muted mb-4 leading-relaxed">
        {entrenamientoLabel} · Los cambios se guardan solo en el plan de este cliente, no en tu
        biblioteca.
      </p>

      <div className="mb-4">
        <label htmlFor="sesion-nombre" className="fp-cal-label block mb-1.5">
          Nombre de la rutina (opcional)
        </label>
        <input
          id="sesion-nombre"
          type="text"
          className="fp-input w-full"
          placeholder="Ej. Pierna A, Full body…"
          value={draft.nombre}
          onChange={(e) => updateDraft({ nombre: e.target.value })}
          disabled={readOnly}
        />
      </div>

      {rutinaBase && syncStatus !== 'sin_rutina' ? (
        <RutinaVersionBanner
          status={syncStatus}
          rutinaNombre={rutinaBase.nombre}
          onResync={!readOnly && onResync ? () => onResync(rutinaBase) : undefined}
        />
      ) : null}

      <div className="flex items-center justify-between mb-3 mt-4">
        <p className="text-sm font-semibold text-primary">Ejercicios</p>
        {!readOnly ? (
          <button
            type="button"
            className="fp-btn fp-btn-primary fp-btn-sm gap-1"
            onClick={() => setShowEjercicioPicker(true)}
          >
            <Plus size={12} />
            Añadir
          </button>
        ) : null}
      </div>

      {showEjercicioPicker ? (
        <ExercisePickerOverlay
          localExercises={ejercicios}
          selectedExerciseIds={draft.ejercicios.map((e) => e.ejercicio_id)}
          onSelect={handlePickFromOverlay}
          onClose={() => setShowEjercicioPicker(false)}
          title={`Añadir a ${draft.nombre.trim() || entrenamientoLabel}`}
        />
      ) : null}

      <SortableContext items={ejerciciosIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {draft.ejercicios.map((ej, ejIndex) => (
            <div key={ejerciciosIds[ejIndex]} style={readOnly ? { pointerEvents: 'none', opacity: 0.85 } : undefined}>
              <EjercicioSortable
                id={ejerciciosIds[ejIndex]}
                ejercicio={ej}
                progresion={progresion}
                totalSemanas={totalSemanas}
                semanaBase={semana}
                unidades={unidades}
                onRemove={() => handleRemove(ejIndex)}
                onUpdate={(updates) => handleUpdate(ejIndex, updates)}
              />
            </div>
          ))}
          {draft.ejercicios.length === 0 ? (
            <div
              className="fp-card text-center"
              style={{ padding: 28, borderRadius: 12, border: '1px dashed var(--border)' }}
            >
              <p className="text-[13px] text-muted">
                Aún no hay ejercicios. Usa &quot;Añadir&quot; para armar la rutina.
              </p>
            </div>
          ) : null}
        </div>
      </SortableContext>
    </div>
  );
}

export function reorderDraftEjercicios(
  draft: SesionDraft,
  oldIndex: number,
  newIndex: number,
): SesionDraft {
  if (oldIndex === newIndex) return draft;
  const copy = [...draft.ejercicios];
  const [moved] = copy.splice(oldIndex, 1);
  copy.splice(newIndex, 0, moved);
  return { ...draft, ejercicios: copy };
}
