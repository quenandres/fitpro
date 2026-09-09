import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Lock, Save, X } from 'lucide-react';
import type { Ejercicio, Rutina, Usuario } from '../../types';
import { Sheet } from '../common/Sheet';
import {
  SesionEditorContent,
  reorderDraftEjercicios,
  type SesionDraft,
} from '../userPlans/SesionEditorContent';
import type { SesionRef } from '../../hooks/usePlanMutations';
import { compareRutinaSnapshot } from '../../utils/compareRutinaSnapshot';
import { toEjercicioPersonalizado } from '../../utils/distributeExercises';
import { normalizeEjercicioPersonalizado } from '../../utils/planScheduleUtils';
import { entrenamientoLabel } from '../../utils/sesionPlanUtils';
import { parseEjId } from '../userPlans/dragIds';
import { sesionesForDisplay } from '../../utils/planScheduleUtils';
import { countSemanasEditables, isSemanaBloqueada } from '../../utils/planWeekUtils';

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  user: Usuario;
  sesionRef: SesionRef;
  rutinas: Rutina[];
  ejercicios: Ejercicio[];
  onClose: () => void;
  onSave: (ref: SesionRef, draft: SesionDraft) => void;
  onResync?: (ref: SesionRef, rutina: Rutina) => void;
}

function draftFromSesion(
  sesion: { nombre?: string; rutina_nombre?: string; ejercicios_personalizados: SesionDraft['ejercicios'] },
  mode: 'create' | 'edit',
): SesionDraft {
  if (mode === 'create') {
    return { nombre: '', ejercicios: [] };
  }
  return {
    nombre: sesion.nombre || sesion.rutina_nombre || '',
    ejercicios: sesion.ejercicios_personalizados.map((e) => normalizeEjercicioPersonalizado(e)),
  };
}

export function SesionEditorSheet({
  open,
  mode,
  user,
  sesionRef,
  rutinas,
  ejercicios,
  onClose,
  onSave,
  onResync,
}: Props) {
  const semanaPlan = user.plan.programacion_semanal.find((s) => s.semana === sesionRef.semana);
  const displaySesiones = semanaPlan ? sesionesForDisplay(semanaPlan, user.plan.modo) : [];
  const sesion = displaySesiones[sesionRef.sesionIndex];

  const [draft, setDraft] = useState<SesionDraft>({ nombre: '', ejercicios: [] });

  const semanaBloqueada = useMemo(
    () => isSemanaBloqueada(user.id, user.plan, sesionRef.semana),
    [user.id, user.plan, sesionRef.semana],
  );

  const semanasEditables = useMemo(
    () => countSemanasEditables(user.id, user.plan),
    [user.id, user.plan],
  );

  useEffect(() => {
    if (!open || !sesion) return;
    setDraft(draftFromSesion(sesion, mode));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sesion se lee solo al abrir
  }, [open, mode, sesionRef.semana, sesionRef.sesionIndex]);

  const label = sesion
    ? entrenamientoLabel(sesion, sesionRef.sesionIndex, user.plan.modo)
    : 'Entrenamiento';

  const rutinaBase = rutinas.find((r) => r.id === sesion?.rutina_id);
  const syncStatus = sesion ? compareRutinaSnapshot(rutinaBase, sesion) : 'sin_rutina';

  const titulo =
    mode === 'create'
      ? `Crear rutina · ${label}`
      : `Editar · ${label}`;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    if (semanaBloqueada) return;
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = parseEjId(String(active.id));
    const to = parseEjId(String(over.id));
    if (
      !from
      || !to
      || from.semana !== sesionRef.semana
      || from.sesionIndex !== sesionRef.sesionIndex
      || to.sesionIndex !== sesionRef.sesionIndex
    ) {
      return;
    }
    setDraft((prev) => reorderDraftEjercicios(prev, from.ejIndex, to.ejIndex));
  };

  const canSave = draft.ejercicios.length > 0 && !semanaBloqueada;

  const handleSave = () => {
    if (!canSave) return;
    onSave(sesionRef, draft);
    onClose();
  };

  const handleResync = (rutina: Rutina) => {
    onResync?.(sesionRef, rutina);
    setDraft({
      nombre: rutina.nombre,
      ejercicios: rutina.ejercicios.map(toEjercicioPersonalizado),
    });
  };

  if (!sesion) return null;

  const progresionBanner =
    user.plan.progresion === 'fijo'
      ? `Modo fijo — los cambios se aplican a ${semanasEditables} semana${semanasEditables === 1 ? '' : 's'} pendiente${semanasEditables === 1 ? '' : 's'}.`
      : 'Modo incremental — define valores base y reglas; el plan calcula las semanas siguientes.';

  return (
    <Sheet open={open} onClose={onClose} flexColumn immersive ariaLabel={titulo}>
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 shrink-0 border-b border-line">
        <div className="min-w-0">
          <p className="font-sora text-base font-bold text-primary truncate">{titulo}</p>
          <p className="text-xs text-muted truncate">
            Semana {sesionRef.semana} · {user.nombre}
          </p>
        </div>
        <button
          type="button"
          className="fp-btn fp-btn-ghost shrink-0 p-2"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
      </div>

      <div className="overflow-y-auto min-h-0 flex-1 px-5 py-4">
        {semanaBloqueada ? (
          <div
            className="fp-card mb-4 flex items-start gap-2.5"
            style={{
              padding: 12,
              borderRadius: 10,
              border: '1px solid rgba(240,136,62,.35)',
              background: 'rgba(240,136,62,.06)',
            }}
          >
            <Lock size={16} className="shrink-0 mt-0.5" style={{ color: '#f0883e' }} />
            <p className="text-xs text-muted leading-relaxed">
              Esta semana ya fue completada por el cliente. Solo lectura — no se sobrescribirán
              sesiones realizadas.
            </p>
          </div>
        ) : (
          <div
            className="fp-card mb-4"
            style={{
              padding: 12,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--bg-overlay)',
            }}
          >
            <p className="text-xs text-muted leading-relaxed">{progresionBanner}</p>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SesionEditorContent
            draft={draft}
            onDraftChange={setDraft}
            entrenamientoLabel={label}
            semana={sesionRef.semana}
            sesionIndex={sesionRef.sesionIndex}
            totalSemanas={user.plan.semanas}
            progresion={user.plan.progresion}
            readOnly={semanaBloqueada}
            ejercicios={ejercicios}
            rutinaBase={rutinaBase}
            syncStatus={syncStatus}
            onResync={rutinaBase && onResync ? handleResync : undefined}
          />
        </DndContext>
      </div>

      <div className="shrink-0 px-5 py-4 border-t border-line bg-[var(--bg-elevated)]">
        {semanaBloqueada ? (
          <button type="button" className="fp-btn fp-btn-secondary w-full justify-center" onClick={onClose}>
            Cerrar
          </button>
        ) : (
          <>
            <button
              type="button"
              className="fp-btn fp-btn-primary w-full justify-center gap-2"
              disabled={!canSave}
              onClick={handleSave}
            >
              <Save size={16} />
              Guardar y aplicar al plan
            </button>
            {!canSave && draft.ejercicios.length === 0 ? (
              <p className="text-[11px] text-muted text-center mt-2">
                Añade al menos un ejercicio para guardar.
              </p>
            ) : null}
          </>
        )}
      </div>
    </Sheet>
  );
}
