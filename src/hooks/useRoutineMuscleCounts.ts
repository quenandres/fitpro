import { useEffect, useMemo, useState } from 'react';
import { getExerciseById } from '../lib/exercisedb';
import type { RoutineFormExercise } from '../types';
import { musclesFromExerciseDb } from '../utils/muscleCanonicalMap';
import { aggregateRoutineMuscles } from '../utils/routineMuscles';
import type { Ejercicio } from '../types';

/**
 * Calcula conteos musculares para el heatmap, resolviendo vía API
 * ejercicios ExerciseDB que aún no tienen musculos_anatomia en el formulario.
 */
export const useRoutineMuscleCounts = (
  ejercicios: RoutineFormExercise[],
  ejerciciosLib: Ejercicio[],
  onMusclesResolved?: (updates: Array<{ key: string; musculos_anatomia: string[] }>) => void,
): { counts: Record<string, number>; loading: boolean } => {
  const [resolved, setResolved] = useState<Record<string, string[]>>({});

  const needsFetch = useMemo(
    () =>
      ejercicios.filter(
        (ej) =>
          !ej.musculos_anatomia?.length &&
          ej.exerciseDbId &&
          !resolved[ej._key ?? ej.nombre],
      ),
    [ejercicios, resolved],
  );

  useEffect(() => {
    if (needsFetch.length === 0) return;

    let cancelled = false;

    void (async () => {
      const entries = await Promise.all(
        needsFetch.map(async (ej) => {
          try {
            const detail = await getExerciseById(ej.exerciseDbId!);
            return [
              ej._key ?? ej.nombre,
              musclesFromExerciseDb(detail.targetMuscles, detail.secondaryMuscles),
            ] as const;
          } catch {
            return [ej._key ?? ej.nombre, [] as string[]] as const;
          }
        }),
      );

      if (cancelled) return;

      setResolved((prev) => {
        const next = { ...prev };
        for (const [key, muscles] of entries) {
          next[key] = muscles;
        }
        return next;
      });

      const withMuscles = entries.filter(([, muscles]) => muscles.length > 0);
      if (withMuscles.length > 0) {
        onMusclesResolved?.(
          withMuscles.map(([key, musculos_anatomia]) => ({ key, musculos_anatomia })),
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [needsFetch, onMusclesResolved]);

  const enriched = useMemo(
    () =>
      ejercicios.map((ej) => {
        const key = ej._key ?? ej.nombre;
        const fetched = resolved[key];
        if (ej.musculos_anatomia?.length) return ej;
        if (fetched?.length) {
          return { ...ej, musculos_anatomia: fetched };
        }
        return ej;
      }),
    [ejercicios, resolved],
  );

  const counts = useMemo(
    () => aggregateRoutineMuscles(enriched, ejerciciosLib),
    [enriched, ejerciciosLib],
  );

  return {
    counts,
    loading: needsFetch.length > 0 && needsFetch.some((ej) => !resolved[ej._key ?? ej.nombre]),
  };
};
