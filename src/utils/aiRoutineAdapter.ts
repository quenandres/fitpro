import type {
  Ejercicio,
  GenerateRoutineExercise,
  GenerateRoutineResponse,
  Rutina,
} from '../types';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

const normalizeText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const normalizeDay = (value: string): string | null => {
  const normalized = normalizeText(value);
  const byAlias: Record<string, string> = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miercoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sabado',
    domingo: 'Domingo',
  };
  return byAlias[normalized] ?? null;
};

const clampNumber = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const fallbackDays = (goal: string): string[] => {
  const g = normalizeText(goal);
  if (g.includes('principiante') || g.includes('volver') || g.includes('retomar')) {
    return ['Lunes', 'Miercoles', 'Viernes'];
  }
  if (g.includes('hyrox') || g.includes('competencia')) {
    return ['Lunes', 'Martes', 'Jueves', 'Viernes', 'Sabado'];
  }
  return ['Lunes', 'Miercoles', 'Viernes', 'Sabado'];
};

const mapExercise = (
  exercise: GenerateRoutineExercise,
  catalogByName: Map<string, Ejercicio>,
): Rutina['ejercicios'][number] | null => {
  const exact = catalogByName.get(normalizeText(exercise.nombre));
  if (exact) {
    return {
      nombre: exact.nombre,
      series: clampNumber(Math.round(exercise.series || 3), 1, 10),
      valor: clampNumber(Math.round(exercise.valor || 10), 1, 1000),
      unidad_id: exercise.unidad_id ?? exact.unidad_id_default,
    };
  }
  return null;
};

export const adaptGeneratedRoutine = (
  generated: GenerateRoutineResponse,
  catalog: Ejercicio[],
): { rutina: Omit<Rutina, 'id'>; dias_entrenamiento: string[] } => {
  const byName = new Map(catalog.map((exercise) => [normalizeText(exercise.nombre), exercise]));
  const matchedExercises = generated.ejercicios
    .map((exercise) => mapExercise(exercise, byName))
    .filter((exercise): exercise is Rutina['ejercicios'][number] => Boolean(exercise));

  const fallbackExercisePool = catalog.slice(0, 4).map((exercise) => ({
    nombre: exercise.nombre,
    series: 3,
    valor: 10,
    unidad_id: exercise.unidad_id_default,
  }));

  const ejercicios = matchedExercises.length > 0 ? matchedExercises : fallbackExercisePool;

  const normalizedDays = generated.dias_entrenamiento
    .map(normalizeDay)
    .filter((day): day is string => Boolean(day))
    .filter((day, index, arr) => arr.indexOf(day) === index);

  const dias_entrenamiento = normalizedDays.length > 0 ? normalizedDays : fallbackDays(generated.descripcion || generated.nombre);

  return {
    rutina: {
      nombre: generated.nombre.trim() || 'Rutina generada con IA',
      categoria: generated.categoria.trim() || 'Personalizada',
      dificultad: generated.dificultad.trim() || 'Intermedio',
      duracion_min: clampNumber(Math.round(generated.duracion_min || 45), 5, 120),
      descripcion: generated.descripcion.trim() || 'Rutina generada automaticamente desde tu objetivo.',
      ejercicios,
    },
    dias_entrenamiento,
  };
};

export const sanitizeTrainingDays = (days: string[]): string[] => {
  const normalized = days
    .map(normalizeDay)
    .filter((day): day is string => Boolean(day))
    .filter((day, index, arr) => arr.indexOf(day) === index);

  if (normalized.length > 0) {
    return normalized;
  }
  return [...DIAS_SEMANA.slice(0, 4)];
};
