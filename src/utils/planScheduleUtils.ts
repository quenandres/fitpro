import { DIAS_SEMANA } from '../components/userPlans/diasSemana';
import type { DiaSemana, SemanaPlan } from '../types';
import { MAX_RUTINA_SEMANAS, MIN_RUTINA_SEMANAS } from './routineScheduleUtils';

export { MAX_RUTINA_SEMANAS, MIN_RUTINA_SEMANAS };

const cloneEjercicios = (ejercicios: DiaSemana['ejercicios_personalizados']) =>
  ejercicios.map((e) => ({ ...e }));

export const createEmptyDiaSemana = (dia: number, nombre: string): DiaSemana => ({
  dia,
  nombre,
  rutina_id: null,
  rutina_nombre: '',
  ejercicios_personalizados: [],
});

export const createEmptySemanaPlan = (semana: number): SemanaPlan => ({
  semana,
  dias: DIAS_SEMANA.map((d) => createEmptyDiaSemana(d.dia, d.nombre)),
});

export const cloneSemanaPlan = (source: SemanaPlan, newNum: number): SemanaPlan => ({
  semana: newNum,
  dias: source.dias.map((d) => ({
    ...d,
    ejercicios_personalizados: cloneEjercicios(d.ejercicios_personalizados),
  })),
});

export const expandPlanSemanas = (
  programacion: SemanaPlan[],
  target: number,
  mode: 'clone_first' | 'empty' | 'clone_last',
): SemanaPlan[] => {
  const clamped = Math.min(MAX_RUTINA_SEMANAS, Math.max(MIN_RUTINA_SEMANAS, target));
  const next = [...programacion];

  while (next.length < clamped) {
    const newNum = next.length + 1;
    if (mode === 'empty') {
      next.push(createEmptySemanaPlan(newNum));
    } else if (mode === 'clone_last' && next.length > 0) {
      next.push(cloneSemanaPlan(next[next.length - 1], newNum));
    } else if (next.length > 0) {
      next.push(cloneSemanaPlan(next[0], newNum));
    } else {
      next.push(createEmptySemanaPlan(newNum));
    }
  }

  return next.slice(0, clamped).map((s, i) => ({ ...s, semana: i + 1 }));
};
