import type { Ejercicio, Rutina, SesionEntrenamiento } from '../types';
import { aggregateRoutineMuscles } from './routineMuscles';

/**
 * Estima músculos trabajados a partir de las rutinas asociadas a sesiones completadas.
 * Prueba/demo: el historial mock no guarda ejercicios ejecutados por sesión.
 */
export function aggregateSessionMuscleLoad(
  sesiones: readonly SesionEntrenamiento[],
  rutinas: readonly Rutina[],
  ejerciciosLib: readonly Ejercicio[],
): Record<string, number> {
  const totals: Record<string, number> = {};

  for (const sesion of sesiones) {
    const rutina = rutinas.find((r) => r.id === sesion.rutina_id);
    if (!rutina) continue;

    const hits = aggregateRoutineMuscles(rutina.ejercicios, ejerciciosLib);
    const plannedSeries = rutina.ejercicios.reduce((acc, e) => acc + e.series, 0);
    const weight = plannedSeries > 0 ? sesion.series_completadas / plannedSeries : 1;

    for (const [muscle, count] of Object.entries(hits)) {
      totals[muscle] = (totals[muscle] ?? 0) + count * weight;
    }
  }

  return totals;
}
