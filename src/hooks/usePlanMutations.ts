import { useCallback } from 'react';
import { isMockMode } from '../lib/mock-mode';
import { createPlan, linkClient } from '../lib/gateway/training.service';
import { planUsuarioToCreatePlanBody } from '../utils/planGatewayAdapter';
import type {
  EjercicioPersonalizado,
  PlanModo,
  PlanProgresionModo,
  PlanUsuario,
  Rutina,
  SesionPlan,
  Usuario,
} from '../types';
import { resincronizarSesion as buildResync } from '../utils/compareRutinaSnapshot';
import { toEjercicioPersonalizado } from '../utils/distributeExercises';
import { mapSesion, type SesionRef } from '../utils/planMutations';
import {
  applySaveSesionPersonalizada,
  aplicarRutinaEnSemanasEditables,
  recalcularPlanCompletoIncremental,
  unificarPlanFijo,
} from '../utils/planProgresionUtils';
import {
  cloneSemanaPlan,
  expandPlanSemanas,
  normalizePlanUsuario,
  resizeSesiones,
  sesionesForDisplay,
} from '../utils/planScheduleUtils';
import type { SesionPersonalizadaPayload } from '../utils/sesionPlanUtils';
import { getSemanasEditables } from '../utils/planWeekUtils';

export type { SesionRef };

type UpdateFn = (updated: Usuario) => void;

const findSesion = (user: Usuario, ref: SesionRef): SesionPlan | undefined =>
  user.plan.programacion_semanal
    .find((s) => s.semana === ref.semana)
    ?.sesiones[ref.sesionIndex];

export const usePlanMutations = (selectedUser: Usuario | null, onUpdate: UpdateFn) => {
  const saveSesionPersonalizada = useCallback(
    (ref: SesionRef, payload: SesionPersonalizadaPayload) => {
      if (!selectedUser) return;
      onUpdate({
        ...selectedUser,
        plan: applySaveSesionPersonalizada(selectedUser.id, selectedUser.plan, ref, payload),
      });
    },
    [selectedUser, onUpdate],
  );

  const toggleSesionEntreno = useCallback(
    (ref: SesionRef) => {
      if (!selectedUser) return;
      const sesion = findSesion(selectedUser, ref);
      if (!sesion) return;
      const isEntreno = sesion.rutina_id !== null && sesion.rutina_id !== -1;
      const patch: Partial<SesionPlan> = isEntreno
        ? { rutina_id: null, rutina_nombre: '', ejercicios_personalizados: [] }
        : { rutina_id: 0, rutina_nombre: 'Entrenamiento', ejercicios_personalizados: [] };
      onUpdate(mapSesion(selectedUser, ref, (s) => ({ ...s, ...patch })));
    },
    [selectedUser, onUpdate],
  );

  const selectRutinaForSesion = useCallback(
    (ref: SesionRef, rutina: Rutina) => {
      if (!selectedUser) return;
      onUpdate(
        mapSesion(selectedUser, ref, (s) => ({
          ...s,
          rutina_id: rutina.id,
          rutina_nombre: rutina.nombre,
          ejercicios_personalizados: rutina.ejercicios.map(toEjercicioPersonalizado),
        })),
      );
    },
    [selectedUser, onUpdate],
  );

  const selectRutinaForSesionReplicada = useCallback(
    (ref: SesionRef, rutina: Rutina) => {
      if (!selectedUser) return;
      const editables = getSemanasEditables(selectedUser.id, selectedUser.plan);
      onUpdate({
        ...selectedUser,
        plan: {
          ...selectedUser.plan,
          programacion_semanal: aplicarRutinaEnSemanasEditables(
            selectedUser.plan.programacion_semanal,
            ref,
            (s) => ({
              ...s,
              rutina_id: rutina.id,
              rutina_nombre: rutina.nombre,
              ejercicios_personalizados: rutina.ejercicios.map(toEjercicioPersonalizado),
            }),
            editables,
            ref.semana,
          ),
        },
      });
    },
    [selectedUser, onUpdate],
  );

  const addEjercicio = useCallback(
    (ref: SesionRef, ejercicio: EjercicioPersonalizado) => {
      if (!selectedUser) return;
      onUpdate(
        mapSesion(selectedUser, ref, (s) => {
          const nextId = s.rutina_id ?? 0;
          return {
            ...s,
            rutina_id: nextId === null ? 0 : nextId,
            rutina_nombre: s.rutina_nombre || 'Entrenamiento',
            ejercicios_personalizados: [...s.ejercicios_personalizados, ejercicio],
          };
        }),
      );
    },
    [selectedUser, onUpdate],
  );

  const addEjercicioReplicado = useCallback(
    (ref: SesionRef, ejercicio: EjercicioPersonalizado) => {
      if (!selectedUser) return;
      const editables = getSemanasEditables(selectedUser.id, selectedUser.plan);
      onUpdate({
        ...selectedUser,
        plan: {
          ...selectedUser.plan,
          programacion_semanal: aplicarRutinaEnSemanasEditables(
            selectedUser.plan.programacion_semanal,
            ref,
            (s) => {
              const nextId = s.rutina_id ?? 0;
              return {
                ...s,
                rutina_id: nextId === null ? 0 : nextId,
                rutina_nombre: s.rutina_nombre || 'Entrenamiento',
                ejercicios_personalizados: [...s.ejercicios_personalizados, ejercicio],
              };
            },
            editables,
            ref.semana,
          ),
        },
      });
    },
    [selectedUser, onUpdate],
  );

  const removeEjercicio = useCallback(
    (ref: SesionRef, ejercicioIndex: number) => {
      if (!selectedUser) return;
      onUpdate(
        mapSesion(selectedUser, ref, (s) => ({
          ...s,
          ejercicios_personalizados: s.ejercicios_personalizados.filter(
            (_, i) => i !== ejercicioIndex,
          ),
        })),
      );
    },
    [selectedUser, onUpdate],
  );

  const updateEjercicio = useCallback(
    (ref: SesionRef, ejercicioIndex: number, updates: Partial<EjercicioPersonalizado>) => {
      if (!selectedUser) return;
      onUpdate(
        mapSesion(selectedUser, ref, (s) => ({
          ...s,
          ejercicios_personalizados: s.ejercicios_personalizados.map((e, i) =>
            i === ejercicioIndex ? { ...e, ...updates } : e,
          ),
        })),
      );
    },
    [selectedUser, onUpdate],
  );

  const reorderEjerciciosInSesion = useCallback(
    (ref: SesionRef, oldIndex: number, newIndex: number) => {
      if (!selectedUser) return;
      if (oldIndex === newIndex) return;
      onUpdate(
        mapSesion(selectedUser, ref, (s) => {
          const copy = [...s.ejercicios_personalizados];
          const [moved] = copy.splice(oldIndex, 1);
          copy.splice(newIndex, 0, moved);
          return { ...s, ejercicios_personalizados: copy };
        }),
      );
    },
    [selectedUser, onUpdate],
  );

  const resincronizarDesdeRutina = useCallback(
    (ref: SesionRef, rutina: Rutina) => {
      if (!selectedUser) return;
      onUpdate(
        mapSesion(selectedUser, ref, (s) => ({
          ...s,
          rutina_id: rutina.id,
          rutina_nombre: rutina.nombre,
          ejercicios_personalizados: buildResync(rutina, s),
        })),
      );
    },
    [selectedUser, onUpdate],
  );

  const setPlanSemanas = useCallback(
    (semanas: number) => {
      if (!selectedUser) return;
      const programacion = expandPlanSemanas(
        selectedUser.plan.programacion_semanal,
        semanas,
        'clone_last',
        selectedUser.plan.dias_entrenar_semana,
        selectedUser.plan.modo,
      );
      onUpdate({
        ...selectedUser,
        plan: {
          ...selectedUser.plan,
          semanas,
          programacion_semanal: programacion,
        },
      });
    },
    [selectedUser, onUpdate],
  );

  const setDiasEntrenarSemana = useCallback(
    (n: number) => {
      if (!selectedUser) return;
      onUpdate({
        ...selectedUser,
        dias_entrenar: n,
        plan: {
          ...selectedUser.plan,
          dias_entrenar_semana: n,
          programacion_semanal: selectedUser.plan.programacion_semanal.map((s) => ({
            ...s,
            sesiones: resizeSesiones(s.sesiones, n, selectedUser.plan.modo),
          })),
        },
      });
    },
    [selectedUser, onUpdate],
  );

  const setPlanModo = useCallback(
    (modo: PlanModo) => {
      if (!selectedUser) return;
      const { dias_entrenar_semana } = selectedUser.plan;
      onUpdate({
        ...selectedUser,
        plan: {
          ...selectedUser.plan,
          modo,
          programacion_semanal: selectedUser.plan.programacion_semanal.map((s) => ({
            ...s,
            sesiones: resizeSesiones(s.sesiones, dias_entrenar_semana, modo),
          })),
        },
      });
    },
    [selectedUser, onUpdate],
  );

  const setPlanProgresion = useCallback(
    (progresion: PlanProgresionModo) => {
      if (!selectedUser) return;
      if (progresion === selectedUser.plan.progresion) return;

      let plan = { ...selectedUser.plan, progresion };
      if (progresion === 'incremental') {
        plan = recalcularPlanCompletoIncremental(selectedUser.id, plan);
      } else {
        plan = unificarPlanFijo(selectedUser.id, plan);
      }

      onUpdate({ ...selectedUser, plan });
    },
    [selectedUser, onUpdate],
  );

  const applyWeek1ToAll = useCallback(() => {
    if (!selectedUser) return;
    const week1 = selectedUser.plan.programacion_semanal.find((s) => s.semana === 1);
    if (!week1) return;
    const editables = getSemanasEditables(selectedUser.id, selectedUser.plan);
    onUpdate({
      ...selectedUser,
      plan: {
        ...selectedUser.plan,
        programacion_semanal: selectedUser.plan.programacion_semanal.map((s) => {
          if (s.semana === 1) return s;
          if (!editables.includes(s.semana)) return s;
          return cloneSemanaPlan(week1, s.semana);
        }),
      },
    });
  }, [selectedUser, onUpdate]);

  const copyWeekFrom = useCallback(
    (destinoSemana: number, origenSemana: number) => {
      if (!selectedUser) return;
      const source = selectedUser.plan.programacion_semanal.find((s) => s.semana === origenSemana);
      if (!source) return;
      if (!getSemanasEditables(selectedUser.id, selectedUser.plan).includes(destinoSemana)) return;
      onUpdate({
        ...selectedUser,
        plan: {
          ...selectedUser.plan,
          programacion_semanal: selectedUser.plan.programacion_semanal.map((s) =>
            s.semana === destinoSemana ? cloneSemanaPlan(source, s.semana) : s,
          ),
        },
      });
    },
    [selectedUser, onUpdate],
  );

  const getDisplaySesiones = useCallback(
    (semanaNum: number) => {
      if (!selectedUser) return [];
      const semana = selectedUser.plan.programacion_semanal.find((s) => s.semana === semanaNum);
      if (!semana) return [];
      return sesionesForDisplay(semana, selectedUser.plan.modo);
    },
    [selectedUser],
  );

  const replacePlan = useCallback(
    (plan: PlanUsuario) => {
      if (!selectedUser) return;
      const normalized = normalizePlanUsuario(plan);
      onUpdate({
        ...selectedUser,
        dias_entrenar: normalized.dias_entrenar_semana,
        plan: normalized,
      });

      if (selectedUser.client_uuid && !isMockMode()) {
        void (async () => {
          await linkClient(selectedUser.client_uuid!);
          await createPlan(planUsuarioToCreatePlanBody(selectedUser.client_uuid!, normalized));
        })().catch(() => undefined);
      }
    },
    [selectedUser, onUpdate],
  );

  return {
    saveSesionPersonalizada,
    toggleSesionEntreno,
    selectRutinaForSesion,
    selectRutinaForSesionReplicada,
    addEjercicio,
    addEjercicioReplicado,
    removeEjercicio,
    updateEjercicio,
    reorderEjerciciosInSesion,
    resincronizarDesdeRutina,
    setPlanSemanas,
    setDiasEntrenarSemana,
    setPlanModo,
    setPlanProgresion,
    applyWeek1ToAll,
    copyWeekFrom,
    getDisplaySesiones,
    replacePlan,
  };
};
