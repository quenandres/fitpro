import { useCallback } from 'react';
import type {
  DiaSemana,
  EjercicioPersonalizado,
  Rutina,
  SemanaPlan,
  Usuario,
} from '../types';
import { resincronizarDia as buildResync } from '../utils/compareRutinaSnapshot';
import { toEjercicioPersonalizado } from '../utils/distributeExercises';

export interface DiaRef {
  semana: number;
  diaIndex: number;
}

type UpdateFn = (updated: Usuario) => void;

const mapSemana = (
  user: Usuario,
  semanaNum: number,
  transform: (s: SemanaPlan) => SemanaPlan
): Usuario => ({
  ...user,
  plan: {
    ...user.plan,
    programacion_semanal: user.plan.programacion_semanal.map((s) =>
      s.semana === semanaNum ? transform(s) : s
    ),
  },
});

const mapDia = (
  user: Usuario,
  ref: DiaRef,
  transform: (d: DiaSemana) => DiaSemana
): Usuario =>
  mapSemana(user, ref.semana, (semana) => ({
    ...semana,
    dias: semana.dias.map((dia, idx) => (idx === ref.diaIndex ? transform(dia) : dia)),
  }));

const findDia = (user: Usuario, ref: DiaRef): DiaSemana | undefined =>
  user.plan.programacion_semanal
    .find((s) => s.semana === ref.semana)
    ?.dias[ref.diaIndex];

export const usePlanMutations = (selectedUser: Usuario | null, onUpdate: UpdateFn) => {
  const toggleDiaEntreno = useCallback(
    (ref: DiaRef) => {
      if (!selectedUser) return;
      const dia = findDia(selectedUser, ref);
      if (!dia) return;
      const isEntreno = dia.rutina_id !== null && dia.rutina_id !== -1;
      const patch: Partial<DiaSemana> = isEntreno
        ? { rutina_id: null, rutina_nombre: '', ejercicios_personalizados: [] }
        : { rutina_id: 0, rutina_nombre: 'Entrenamiento', ejercicios_personalizados: [] };
      onUpdate(mapDia(selectedUser, ref, (d) => ({ ...d, ...patch })));
    },
    [selectedUser, onUpdate]
  );

  const selectRutinaForDia = useCallback(
    (ref: DiaRef, rutina: Rutina) => {
      if (!selectedUser) return;
      onUpdate(
        mapDia(selectedUser, ref, (d) => ({
          ...d,
          rutina_id: rutina.id,
          rutina_nombre: rutina.nombre,
          ejercicios_personalizados: rutina.ejercicios.map(toEjercicioPersonalizado),
        }))
      );
    },
    [selectedUser, onUpdate]
  );

  const addEjercicio = useCallback(
    (ref: DiaRef, ejercicio: EjercicioPersonalizado) => {
      if (!selectedUser) return;
      onUpdate(
        mapDia(selectedUser, ref, (d) => {
          const nextId = d.rutina_id ?? 0;
          return {
            ...d,
            rutina_id: nextId === null ? 0 : nextId,
            rutina_nombre: d.rutina_nombre || 'Entrenamiento',
            ejercicios_personalizados: [...d.ejercicios_personalizados, ejercicio],
          };
        })
      );
    },
    [selectedUser, onUpdate]
  );

  const removeEjercicio = useCallback(
    (ref: DiaRef, ejercicioIndex: number) => {
      if (!selectedUser) return;
      onUpdate(
        mapDia(selectedUser, ref, (d) => ({
          ...d,
          ejercicios_personalizados: d.ejercicios_personalizados.filter(
            (_, i) => i !== ejercicioIndex
          ),
        }))
      );
    },
    [selectedUser, onUpdate]
  );

  const updateEjercicio = useCallback(
    (ref: DiaRef, ejercicioIndex: number, updates: Partial<EjercicioPersonalizado>) => {
      if (!selectedUser) return;
      onUpdate(
        mapDia(selectedUser, ref, (d) => ({
          ...d,
          ejercicios_personalizados: d.ejercicios_personalizados.map((e, i) =>
            i === ejercicioIndex ? { ...e, ...updates } : e
          ),
        }))
      );
    },
    [selectedUser, onUpdate]
  );

  const reorderEjerciciosInDia = useCallback(
    (ref: DiaRef, oldIndex: number, newIndex: number) => {
      if (!selectedUser) return;
      if (oldIndex === newIndex) return;
      onUpdate(
        mapDia(selectedUser, ref, (d) => {
          const copy = [...d.ejercicios_personalizados];
          const [moved] = copy.splice(oldIndex, 1);
          copy.splice(newIndex, 0, moved);
          return { ...d, ejercicios_personalizados: copy };
        })
      );
    },
    [selectedUser, onUpdate]
  );

  const moveDia = useCallback(
    (origen: DiaRef, destino: DiaRef) => {
      if (!selectedUser) return;
      if (origen.semana === destino.semana && origen.diaIndex === destino.diaIndex) return;

      const diaOrigen = findDia(selectedUser, origen);
      const diaDestino = findDia(selectedUser, destino);
      if (!diaOrigen || !diaDestino) return;

      const payload = (source: DiaSemana): Pick<DiaSemana, 'rutina_id' | 'rutina_nombre' | 'ejercicios_personalizados'> => ({
        rutina_id: source.rutina_id,
        rutina_nombre: source.rutina_nombre,
        ejercicios_personalizados: source.ejercicios_personalizados,
      });

      let next = mapDia(selectedUser, destino, (d) => ({ ...d, ...payload(diaOrigen) }));
      next = mapDia(next, origen, (d) => ({ ...d, ...payload(diaDestino) }));
      onUpdate(next);
    },
    [selectedUser, onUpdate]
  );

  const resincronizarDesdeRutina = useCallback(
    (ref: DiaRef, rutina: Rutina) => {
      if (!selectedUser) return;
      onUpdate(
        mapDia(selectedUser, ref, (d) => ({
          ...d,
          rutina_id: rutina.id,
          rutina_nombre: rutina.nombre,
          ejercicios_personalizados: buildResync(rutina, d),
        }))
      );
    },
    [selectedUser, onUpdate]
  );

  return {
    toggleDiaEntreno,
    selectRutinaForDia,
    addEjercicio,
    removeEjercicio,
    updateEjercicio,
    reorderEjerciciosInDia,
    moveDia,
    resincronizarDesdeRutina,
  };
};
