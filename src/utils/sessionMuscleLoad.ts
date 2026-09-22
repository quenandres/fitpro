import type { Ejercicio, SesionEntrenamiento } from '../types';
import { aggregateRoutineMuscles } from './routineMuscles';

/** Agrega músculos desde ejercicios ejecutados (mock local). */
export function aggregateSessionMuscleLoad(
  sesiones: readonly SesionEntrenamiento[],
  _rutinas: readonly unknown[],
  ejerciciosLib: readonly Ejercicio[],
): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const sesion of sesiones) {
    if (!sesion.ejercicios?.length) continue;

    for (const ejecutado of sesion.ejercicios) {
      const seriesCount = ejecutado.series.length;
      if (seriesCount === 0) continue;

      const hits = aggregateRoutineMuscles(
        [{ ejercicio_id: ejecutado.ejercicio_id, nombre: ejecutado.nombre }],
        ejerciciosLib,
      );

      for (const [muscle, count] of Object.entries(hits)) {
        totals[muscle] = (totals[muscle] ?? 0) + count * seriesCount;
      }
    }
  }

  return totals;
}
