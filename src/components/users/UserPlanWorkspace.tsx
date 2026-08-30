import { useMemo, useState } from 'react';
import { ClipboardList, Dumbbell, Plus } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Ejercicio, EjercicioPersonalizado, Rutina, Usuario } from '../../types';
import { VistaSemana } from '../userPlans/VistaSemana';
import { DiaCard } from '../userPlans/DiaCard';
import { parseDragId, parseEjId } from '../userPlans/dragIds';
import type { usePlanMutations } from '../../hooks/usePlanMutations';
import type { DiaRef } from '../../hooks/usePlanMutations';
import { ExercisePickerOverlay, type PickedExercise } from '../exercise/ExercisePickerOverlay';
import { UserPlannedLoadPanel } from './UserPlannedLoadPanel';
import { DiaEditorSheet } from './DiaEditorSheet';
import { RutinaPickerSheet } from './RutinaPickerSheet';
import { formatPesoKg, isNivelAvanzado } from '../../utils/userSummary';

type Mutations = ReturnType<typeof usePlanMutations>;

interface Props {
  user: Usuario;
  rutinas: Rutina[];
  ejercicios: Ejercicio[];
  mutations: Mutations;
  semana: number;
  onSemanaChange: (semana: number) => void;
  diaEditorIndex: number | null;
  onDiaEditorChange: (diaIndex: number | null) => void;
  selectedDiaIndex: number;
  onSelectedDiaChange: (diaIndex: number) => void;
}

export function UserPlanWorkspace({
  user,
  rutinas,
  ejercicios,
  mutations,
  semana,
  onSemanaChange,
  diaEditorIndex,
  onDiaEditorChange,
  selectedDiaIndex,
  onSelectedDiaChange,
}: Props) {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [showRutinaPicker, setShowRutinaPicker] = useState(false);
  const [showEjercicioPicker, setShowEjercicioPicker] = useState(false);

  const semanaPlan = useMemo(
    () => user.plan.programacion_semanal.find((s) => s.semana === semana),
    [user, semana],
  );

  const selectedDia = semanaPlan?.dias[selectedDiaIndex];
  const diaRef: DiaRef = { semana, diaIndex: selectedDiaIndex };
  const editorRef: DiaRef | null =
    diaEditorIndex != null ? { semana, diaIndex: diaEditorIndex } : null;

  const semanasRestantes = Math.max(0, user.plan.semanas - semana);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = (e: DragStartEvent) => {
    setActiveDragId(String(e.active.id));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const ejActive = parseEjId(activeId);
    const ejOver = parseEjId(overId);
    if (ejActive && ejOver && ejActive.semana === ejOver.semana && ejActive.diaIndex === ejOver.diaIndex) {
      const sem = user.plan.programacion_semanal.find((s) => s.semana === ejActive.semana);
      const dia = sem?.dias[ejActive.diaIndex];
      if (!dia) return;
      const newOrder = arrayMove(
        dia.ejercicios_personalizados.map((_, i) => i),
        ejActive.ejIndex,
        ejOver.ejIndex,
      );
      if (newOrder[ejOver.ejIndex] === ejActive.ejIndex) return;
      mutations.reorderEjerciciosInDia(
        { semana: ejActive.semana, diaIndex: ejActive.diaIndex },
        ejActive.ejIndex,
        ejOver.ejIndex,
      );
      return;
    }

    const diaActive = parseDragId(activeId);
    const diaOver = parseDragId(overId);
    if (diaActive && diaOver) {
      mutations.moveDia(diaActive as DiaRef, diaOver as DiaRef);
    }
  };

  const activeDragDia = useMemo(() => {
    if (!activeDragId) return null;
    const ref = parseDragId(activeDragId);
    if (!ref) return null;
    const sem = user.plan.programacion_semanal.find((s) => s.semana === ref.semana);
    const dia = sem?.dias[ref.diaIndex];
    if (!dia) return null;
    return { dia, ...ref };
  }, [activeDragId, user]);

  const handleOpenDia = (sem: number, diaIndex: number) => {
    onSemanaChange(sem);
    onSelectedDiaChange(diaIndex);
    onDiaEditorChange(diaIndex);
  };

  const handleSelectRutina = (rutina: Rutina, replicar: boolean) => {
    if (replicar) {
      mutations.selectRutinaForDiaReplicada(diaRef, rutina);
    } else {
      mutations.selectRutinaForDia(diaRef, rutina);
    }
  };

  const handleQuickAddEjercicio = (pick: PickedExercise) => {
    const ej: EjercicioPersonalizado = {
      nombre: pick.nombre,
      series: 3,
      reps: pick.unidad_id_default === 1 ? 12 : 10,
      notas: '',
      ejercicio_id: pick.ejercicio_id,
      musculos_anatomia: pick.musculos_anatomia,
      rpe: 7,
    };
    mutations.addEjercicio(diaRef, ej);
    setShowEjercicioPicker(false);
  };

  const diaLabel = selectedDia
    ? `${selectedDia.nombre} · Semana ${semana}`
    : `Semana ${semana}`;

  return (
    <>
      <div className="fp-user-spec">
        <div className="fp-user-spec-item">
          <p className="fp-user-spec-k">Objetivo</p>
          <p className="fp-user-spec-v">{user.objetivo}</p>
        </div>
        <div className="fp-user-spec-item">
          <p className="fp-user-spec-k">Nivel</p>
          <p className="fp-user-spec-v">{isNivelAvanzado(user.nivel) ? 'Avanzado' : user.nivel}</p>
        </div>
        <div className="fp-user-spec-item">
          <p className="fp-user-spec-k">Peso</p>
          <p className="fp-user-spec-v">{formatPesoKg(user.peso_kg)}</p>
        </div>
        <div className="fp-user-spec-item">
          <p className="fp-user-spec-k">Plan</p>
          <p className="fp-user-spec-v">{user.plan.semanas} sem</p>
        </div>
      </div>

      {semanaPlan ? (
        <div className="fp-card mb-4" style={{ padding: 14, borderRadius: 14 }}>
          <p className="fp-cal-label mb-2">Día activo · {diaLabel}</p>
          <div className="fp-user-days scrollbar-hide">
            {semanaPlan.dias.map((d, idx) => {
              const activo = idx === selectedDiaIndex;
              return (
                <button
                  key={d.dia}
                  type="button"
                  onClick={() => onSelectedDiaChange(idx)}
                  className={`fp-user-day${activo ? ' fp-user-day--on' : ''}`}
                >
                  {d.nombre.slice(0, 3)}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              className="fp-btn fp-btn-secondary fp-btn-sm gap-1.5"
              onClick={() => setShowRutinaPicker(true)}
            >
              <ClipboardList size={14} />
              Asignar rutina
            </button>
            <button
              type="button"
              className="fp-btn fp-btn-primary fp-btn-sm gap-1.5"
              onClick={() => setShowEjercicioPicker(true)}
            >
              <Plus size={14} />
              Añadir ejercicio
            </button>
            <button
              type="button"
              className="fp-btn fp-btn-ghost fp-btn-sm gap-1.5"
              onClick={() => onDiaEditorChange(selectedDiaIndex)}
            >
              <Dumbbell size={14} />
              Editar día
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start min-w-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <VistaSemana
            user={user}
            selectedWeek={semana}
            onSelectWeek={onSemanaChange}
            onOpenDia={handleOpenDia}
            rutinas={rutinas}
          />
          <DragOverlay>
            {activeDragDia ? (
              <DiaCard
                dia={activeDragDia.dia}
                semana={activeDragDia.semana}
                diaIndex={activeDragDia.diaIndex}
                variant="full"
                draggable={false}
              />
            ) : null}
          </DragOverlay>
        </DndContext>

        <div className="lg:sticky lg:top-[78px] min-w-0">
          <UserPlannedLoadPanel user={user} semana={semana} ejercicios={ejercicios} rutinas={rutinas} />
        </div>
      </div>

      {editorRef ? (
        <DiaEditorSheet
          open={diaEditorIndex != null}
          user={user}
          diaRef={editorRef}
          rutinas={rutinas}
          ejercicios={ejercicios}
          onClose={() => onDiaEditorChange(null)}
          onToggleEntreno={() => mutations.toggleDiaEntreno(editorRef)}
          onSelectRutina={(r) => mutations.selectRutinaForDia(editorRef, r)}
          onAddEjercicio={(ej, rep) =>
            (rep ? mutations.addEjercicioReplicado : mutations.addEjercicio)(editorRef, ej)
          }
          onRemoveEjercicio={(idx) => mutations.removeEjercicio(editorRef, idx)}
          onUpdateEjercicio={(idx, updates) => mutations.updateEjercicio(editorRef, idx, updates)}
          onResync={(r) => mutations.resincronizarDesdeRutina(editorRef, r)}
        />
      ) : null}

      <RutinaPickerSheet
        open={showRutinaPicker}
        rutinas={rutinas}
        semanasRestantes={semanasRestantes}
        diaLabel={diaLabel}
        onClose={() => setShowRutinaPicker(false)}
        onSelect={handleSelectRutina}
      />

      {showEjercicioPicker ? (
        <ExercisePickerOverlay
          localExercises={ejercicios}
          selectedNames={selectedDia?.ejercicios_personalizados.map((e) => e.nombre) ?? []}
          onSelect={handleQuickAddEjercicio}
          onClose={() => setShowEjercicioPicker(false)}
          title={`Añadir a ${selectedDia?.nombre ?? 'día'}`}
        />
      ) : null}
    </>
  );
}
