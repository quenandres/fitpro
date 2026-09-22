import { getExerciseMedia } from '../lib/gateway/exercises.service';
import type {
  EjercicioRutina,
  GenerateRoutineApiResponse,
  ResolvedExercise,
  ResolvedRoutineDraft,
} from '../types';
import { ensureLocalExerciseInStore } from './ensureLocalExercise';
import { resolveExercisesAgainstApi } from './resolveExercisesAgainstApi';

const hasCatalogIds = (response: GenerateRoutineApiResponse): boolean =>
  response.rutina.ejercicios.every(
    (ex) => typeof ex.ejercicio_id === 'number' && ex.ejercicio_id > 0,
  );

export const resolveCatalogRoutine = async (
  response: GenerateRoutineApiResponse,
): Promise<ResolvedRoutineDraft> => {
  if (!hasCatalogIds(response)) {
    return resolveExercisesAgainstApi(response);
  }

  const exercises: ResolvedExercise[] = await Promise.all(
    response.rutina.ejercicios.map(async (ex) => {
      const catalogId = ex.ejercicio_id!;
      let imageUrl: string | undefined;
      try {
        const media = await getExerciseMedia(catalogId);
        imageUrl = media.imagen_url || undefined;
      } catch {
        imageUrl = undefined;
      }

      return {
        catalogExerciseId: catalogId,
        nombre: ex.nombre,
        series: ex.series,
        valor: ex.valor,
        unidad_id: ex.unidad_id ?? 1,
        exerciseDbId: ex.exerciseDbId,
        imageUrl,
        matchStatus: 'matched' as const,
      };
    }),
  );

  const rutinaExercises: EjercicioRutina[] = exercises.map((ex) => ({
    ejercicio_id: ensureLocalExerciseInStore({
      nombre: ex.nombre,
      unidad_id_default: ex.unidad_id,
      exerciseDbId: ex.exerciseDbId,
      imageUrl: ex.imageUrl,
      musculos_anatomia: ex.musculos_anatomia,
    }),
    nombre: ex.nombre,
    series: ex.series,
    valor: ex.valor,
    unidad_id: ex.unidad_id,
    exerciseDbId: ex.exerciseDbId,
    imageUrl: ex.imageUrl,
    musculos_anatomia: ex.musculos_anatomia,
  }));

  return {
    rutina: {
      ...response.rutina,
      ejercicios: rutinaExercises,
    },
    dias_entrenamiento: response.dias_entrenamiento,
    razonamiento: response.razonamiento,
    exercises,
  };
};
