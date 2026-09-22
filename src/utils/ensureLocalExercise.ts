import type { Ejercicio } from '../types';
import { useDataStore } from '../store/useDataStore';

export const normalizeExerciseName = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export interface EnsureLocalExerciseInput {
  nombre: string;
  unidad_id_default?: number;
  exerciseDbId?: string;
  imageUrl?: string;
  musculos_anatomia?: string[];
  categoria?: string;
  grupo_muscular?: string[];
  equipamiento?: string[];
  dificultad?: string;
  descripcion?: string;
  tags?: string[];
}

const getMaxId = (ejercicios: Ejercicio[]): number =>
  ejercicios.length > 0 ? Math.max(...ejercicios.map((e) => e.id)) : 0;

/**
 * Resuelve o crea un ejercicio en el catálogo local mock.
 * No es la tabla `exercises` de Supabase — sustituir por gateway en Fase 2.
 */
export function ensureLocalExercise(
  ejercicios: Ejercicio[],
  input: EnsureLocalExerciseInput,
): { ejercicios: Ejercicio[]; id: number } {
  const normalized = normalizeExerciseName(input.nombre);

  const byDbId =
    input.exerciseDbId != null
      ? ejercicios.find((e) => e.tags.includes(`exdb:${input.exerciseDbId}`))
      : undefined;

  const byName = ejercicios.find((e) => normalizeExerciseName(e.nombre) === normalized);

  const existing = byDbId ?? byName;
  if (existing) {
    return { ejercicios, id: existing.id };
  }

  const id = getMaxId(ejercicios) + 1;
  const tags = [...(input.tags ?? [])];
  if (input.exerciseDbId && !tags.includes(`exdb:${input.exerciseDbId}`)) {
    tags.push(`exdb:${input.exerciseDbId}`);
  }

  const created: Ejercicio = {
    id,
    nombre: input.nombre.trim(),
    categoria: input.categoria ?? 'General',
    grupo_muscular: input.grupo_muscular ?? input.musculos_anatomia ?? [],
    musculos_anatomia: input.musculos_anatomia,
    equipamiento: input.equipamiento ?? [],
    dificultad: input.dificultad ?? 'Intermedio',
    unidad_id_default: input.unidad_id_default ?? 1,
    descripcion: input.descripcion ?? '',
    tags,
    imagen: input.imageUrl,
  };

  return { ejercicios: [...ejercicios, created], id };
}

/** Upsert en el catálogo mock y persiste en `useDataStore` si cambió. */
export function ensureLocalExerciseInStore(input: EnsureLocalExerciseInput): number {
  const state = useDataStore.getState();
  const result = ensureLocalExercise(state.ejercicios, input);
  if (result.ejercicios !== state.ejercicios) {
    useDataStore.setState({ ejercicios: result.ejercicios });
  }
  return result.id;
}
