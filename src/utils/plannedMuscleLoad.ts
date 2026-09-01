import type { Ejercicio, EjercicioPersonalizado, Rutina, Usuario } from '../types';
import { isDiaEntreno } from '../components/userPlans/diasSemana';
import { findRutinaById } from './rutinaId';
import { aggregateRoutineMuscles, type RoutineExerciseRef } from './routineMuscles';

const DEFAULT_RPE = 7;

function ejercicioToRef(ej: EjercicioPersonalizado): RoutineExerciseRef {
  return {
    nombre: ej.nombre,
    ejercicio_id: ej.ejercicio_id,
    musculos_anatomia: ej.musculos_anatomia,
  };
}

function rpeFactor(rpe?: number): number {
  const value = rpe ?? DEFAULT_RPE;
  return Math.max(0.5, Math.min(1.5, value / DEFAULT_RPE));
}

/** Suma conteos musculares ponderados por series × factor RPE. */
function addWeightedMuscles(
  target: Record<string, number>,
  muscleHits: Record<string, number>,
  weight: number,
) {
  for (const [muscle, hits] of Object.entries(muscleHits)) {
    target[muscle] = (target[muscle] ?? 0) + hits * weight;
  }
}

/**
 * Carga planificada relativa de una semana del plan (estimación, no tonelaje real).
 * Cada ejercicio del día suma series × (RPE/7) a los músculos que trabaja.
 */
export function aggregatePlannedWeekLoad(
  user: Usuario,
  semanaNum: number,
  ejerciciosLib: readonly Ejercicio[],
  rutinas: readonly Rutina[],
): Record<string, number> {
  const semana = user.plan.programacion_semanal.find((s) => s.semana === semanaNum);
  if (!semana) return {};

  const totals: Record<string, number> = {};

  for (const dia of semana.dias) {
    const ejercicios =
      dia.ejercicios_personalizados.length > 0
        ? dia.ejercicios_personalizados
        : (() => {
            if (!isDiaEntreno(dia.rutina_id)) return [];
            const rutina = findRutinaById(rutinas, dia.rutina_id);
            if (!rutina) return [];
            return rutina.ejercicios.map((e) => ({
              nombre: e.nombre,
              series: e.series,
              reps: e.valor,
              rpe: e.rpe,
              musculos_anatomia: e.musculos_anatomia,
            } satisfies EjercicioPersonalizado));
          })();

    for (const ej of ejercicios) {
      const hits = aggregateRoutineMuscles([ejercicioToRef(ej)], ejerciciosLib);
      const weight = ej.series * rpeFactor(ej.rpe);
      addWeightedMuscles(totals, hits, weight);
    }
  }

  return totals;
}

export function topMusclesByLoad(
  counts: Record<string, number>,
  limit = 5,
): Array<{ muscle: string; load: number }> {
  return Object.entries(counts)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([muscle, load]) => ({ muscle, load }));
}

export function totalPlannedSeries(user: Usuario, semanaNum: number, rutinas: readonly Rutina[]): number {
  const semana = user.plan.programacion_semanal.find((s) => s.semana === semanaNum);
  if (!semana) return 0;

  let total = 0;
  for (const dia of semana.dias) {
    if (dia.ejercicios_personalizados.length > 0) {
      total += dia.ejercicios_personalizados.reduce((acc, e) => acc + e.series, 0);
    } else if (isDiaEntreno(dia.rutina_id)) {
      const rutina = findRutinaById(rutinas, dia.rutina_id);
      if (rutina) {
        total += rutina.ejercicios.reduce((acc, e) => acc + e.series, 0);
      }
    }
  }
  return total;
}

/** Detecta concentración: un músculo con >40% de la carga total. */
export function detectLoadWarnings(counts: Record<string, number>): string[] {
  const entries = Object.entries(counts).filter(([, v]) => v > 0);
  if (entries.length === 0) return ['Sin ejercicios planificados esta semana.'];

  const total = entries.reduce((acc, [, v]) => acc + v, 0);
  const warnings: string[] = [];

  const [topMuscle, topLoad] = entries.sort((a, b) => b[1] - a[1])[0];
  if (topLoad / total > 0.4) {
    warnings.push(`Alta concentración en ${topMuscle} (${Math.round((topLoad / total) * 100)}%).`);
  }

  const lowCount = entries.filter(([, v]) => v / total < 0.05).length;
  if (lowCount > entries.length * 0.6) {
    warnings.push('Distribución muy dispersa; revisa si falta volumen en grupos clave.');
  }

  return warnings;
}
