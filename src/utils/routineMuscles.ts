import type { Ejercicio } from '../types';
import { musclesFromGrupoMuscular } from './muscleCanonicalMap';

export interface RoutineExerciseRef {
  nombre: string;
  ejercicio_id?: number;
  /** Nombres canónicos del heatmap (p. ej. "Abs", "Quads") */
  musculos_anatomia?: string[];
}

/**
 * Agrega músculos canónicos de los ejercicios de una rutina.
 * Prioridad: musculos_anatomia en el slot → biblioteca local → grupo_muscular local.
 */
export function aggregateRoutineMuscles(
  routineExercises: readonly RoutineExerciseRef[],
  ejerciciosLib: readonly Ejercicio[],
): Record<string, number> {
  const counts: Record<string, number> = {};

  const addMuscles = (musculos: readonly string[]) => {
    for (const m of musculos) {
      counts[m] = (counts[m] ?? 0) + 1;
    }
  };

  for (const ref of routineExercises) {
    if (ref.musculos_anatomia?.length) {
      addMuscles(ref.musculos_anatomia);
      continue;
    }

    const match =
      (ref.ejercicio_id != null
        ? ejerciciosLib.find((e) => e.id === ref.ejercicio_id)
        : undefined) ?? ejerciciosLib.find((e) => e.nombre === ref.nombre);

    if (match?.musculos_anatomia?.length) {
      addMuscles(match.musculos_anatomia);
    } else if (match?.grupo_muscular?.length) {
      addMuscles(musclesFromGrupoMuscular(match.grupo_muscular));
    }
  }

  return counts;
}

export function maxMuscleCount(counts: Record<string, number>): number {
  let max = 0;
  for (const v of Object.values(counts)) {
    if (v > max) max = v;
  }
  return max;
}
