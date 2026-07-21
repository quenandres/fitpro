import type { RoutineFormExercise } from '../types';

const SECONDS_PER_REP = 3;
/** Tiempo de transición al cambiar de ejercicio (preparación / desplazamiento). */
export const EXERCISE_CHANGE_SEC = 45;
/** Transición breve entre ejercicios dentro de un superset. */
const SUPERSET_TRANSITION_SEC = 15;

export interface RoutineDurationInput {
  ejercicios: RoutineFormExercise[];
  restBetweenSetsSec: number;
}

export interface RoutineDurationBreakdown {
  totalSeconds: number;
  workSeconds: number;
  restSeconds: number;
  transitionSeconds: number;
  totalMinutes: number;
}

type Block =
  | { type: 'single'; ej: RoutineFormExercise }
  | { type: 'superset'; group: RoutineFormExercise[] };

const singleSetWorkSeconds = (ej: RoutineFormExercise): number => {
  const { valor, unidad_id } = ej;
  switch (unidad_id) {
    case 4:
      return valor * 60;
    case 5:
      return valor;
    case 2:
      return valor / 0.2;
    case 3:
      return valor * 360;
    case 14:
      return valor * 600;
    default:
      return valor * SECONDS_PER_REP;
  }
};

const singleExerciseSeconds = (
  ej: RoutineFormExercise,
  restBetweenSetsSec: number,
): { work: number; rest: number } => {
  const work = singleSetWorkSeconds(ej) * ej.series;
  const rest = Math.max(0, ej.series - 1) * restBetweenSetsSec;
  return { work, rest };
};

const supersetBlockSeconds = (
  group: RoutineFormExercise[],
  restBetweenSetsSec: number,
): { work: number; rest: number; transition: number } => {
  const rounds = Math.max(...group.map((e) => e.series));
  let work = 0;
  let rest = 0;
  let transition = 0;

  for (let round = 0; round < rounds; round += 1) {
    group.forEach((ej, idx) => {
      if (round < ej.series) {
        work += singleSetWorkSeconds(ej);
        if (idx < group.length - 1) {
          transition += SUPERSET_TRANSITION_SEC;
        }
      }
    });
    if (round < rounds - 1) {
      rest += restBetweenSetsSec;
    }
  }

  return { work, rest, transition };
};

const toBlocks = (ejercicios: RoutineFormExercise[]): Block[] => {
  const blocks: Block[] = [];
  let i = 0;

  while (i < ejercicios.length) {
    const ej = ejercicios[i];
    if (ej.grupo_superset) {
      const groupId = ej.grupo_superset;
      const group: RoutineFormExercise[] = [];
      while (i < ejercicios.length && ejercicios[i].grupo_superset === groupId) {
        group.push(ejercicios[i]);
        i += 1;
      }
      blocks.push({ type: 'superset', group });
    } else {
      blocks.push({ type: 'single', ej });
      i += 1;
    }
  }

  return blocks;
};

export const calculateRoutineDuration = (
  input: RoutineDurationInput,
): RoutineDurationBreakdown => {
  const { ejercicios, restBetweenSetsSec } = input;

  if (ejercicios.length === 0) {
    return {
      totalSeconds: 0,
      workSeconds: 0,
      restSeconds: 0,
      transitionSeconds: 0,
      totalMinutes: 0,
    };
  }

  const blocks = toBlocks(ejercicios);
  let workSeconds = 0;
  let restSeconds = 0;
  let transitionSeconds = 0;

  blocks.forEach((block, blockIdx) => {
    if (block.type === 'single') {
      const { work, rest } = singleExerciseSeconds(block.ej, restBetweenSetsSec);
      workSeconds += work;
      restSeconds += rest;
    } else {
      const blockTotals = supersetBlockSeconds(block.group, restBetweenSetsSec);
      workSeconds += blockTotals.work;
      restSeconds += blockTotals.rest;
      transitionSeconds += blockTotals.transition;
    }

    if (blockIdx < blocks.length - 1) {
      transitionSeconds += EXERCISE_CHANGE_SEC;
    }
  });

  const totalSeconds = workSeconds + restSeconds + transitionSeconds;
  const totalMinutes = totalSeconds === 0 ? 0 : Math.max(1, Math.ceil(totalSeconds / 60));

  return {
    totalSeconds,
    workSeconds,
    restSeconds,
    transitionSeconds,
    totalMinutes,
  };
};
