import type { RoutinePreset } from '../data/routinePresets';
import type { RoutineFormData, RoutineFormExercise } from '../types';
import { resolveOneExercise } from './resolveExercisesAgainstApi';

const uid = (): string =>
  `ex_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

const DIFFICULTY_BY_LEVEL = {
  basica: 'Principiante',
  intermedia: 'Intermedio',
  avanzada: 'Avanzado',
} as const;

export interface ApplyPresetResult {
  form: RoutineFormData;
  matchedCount: number;
  totalCount: number;
}

export const applyRoutinePreset = async (
  preset: RoutinePreset,
): Promise<ApplyPresetResult> => {
  const resolved = await Promise.all(
    preset.exercises.map((slot) =>
      resolveOneExercise(slot.searchTerm, slot.series, slot.valor, slot.unidad_id),
    ),
  );

  const ejercicios: RoutineFormExercise[] = resolved.map((ex, i) => {
    const slot = preset.exercises[i];
    const supersetGroup = slot.supersetGroup;
    return {
      _key: uid(),
      nombre: ex.nombre,
      series: ex.series,
      valor: ex.valor,
      unidad_id: ex.unidad_id,
      exerciseDbId: ex.exerciseDbId,
      imageUrl: ex.imageUrl,
      rpe: slot.rpe,
      musculos_anatomia: ex.musculos_anatomia,
      grupo_superset: supersetGroup ? `ss_preset_${supersetGroup}` : undefined,
    };
  });

  const matchedCount = resolved.filter((e) => e.matchStatus === 'matched').length;

  const form: RoutineFormData = {
    nombre: preset.nombre,
    categoria: preset.categoria,
    descripcion: preset.descripcion,
    dificultad: DIFFICULTY_BY_LEVEL[preset.level],
    duracion_min: preset.duracion_min,
    tipo: preset.tipo ?? 'estandar',
    ejercicios,
    rest_between_sets: preset.rest_between_sets ?? 60,
    notes: preset.notes ?? '',
  };

  return {
    form,
    matchedCount,
    totalCount: preset.exercises.length,
  };
};
