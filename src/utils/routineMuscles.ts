import type { Ejercicio } from '../types';

export interface RoutineExerciseRef {
  nombre: string;
  ejercicio_id?: number;
}

/**
 * Agrega los músculos canónicos de todos los ejercicios de una rutina,
 * contando cuántos ejercicios tocan cada uno. Hace lookup por `ejercicio_id`
 * si está disponible y cae de vuelta al match por `nombre`, lo que permite
 * funcionar tanto en creación nueva (con id) como al editar (sólo nombre).
 */
export function aggregateRoutineMuscles(
  routineExercises: readonly RoutineExerciseRef[],
  ejerciciosLib: readonly Ejercicio[],
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const ref of routineExercises) {
    const match =
      (ref.ejercicio_id != null
        ? ejerciciosLib.find((e) => e.id === ref.ejercicio_id)
        : undefined) ?? ejerciciosLib.find((e) => e.nombre === ref.nombre);
    const musculos = match?.musculos_anatomia;
    if (!musculos?.length) continue;
    for (const m of musculos) {
      counts[m] = (counts[m] ?? 0) + 1;
    }
  }
  return counts;
}

/**
 * Devuelve el valor máximo de un mapa de conteos. Útil para normalizar
 * intensidades en el heatmap. Devuelve 0 si el mapa está vacío.
 */
export function maxMuscleCount(counts: Record<string, number>): number {
  let max = 0;
  for (const v of Object.values(counts)) {
    if (v > max) max = v;
  }
  return max;
}
