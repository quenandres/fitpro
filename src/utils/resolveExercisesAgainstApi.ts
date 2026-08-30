import { searchExercises, getExerciseById } from '../lib/exercisedb';
import type { ExerciseSearchItem } from '../lib/exercisedb';
import { musclesFromExerciseDb } from './muscleCanonicalMap';
import type {
  EjercicioRutina,
  GenerateRoutineApiResponse,
  ResolvedExercise,
  ResolvedRoutineDraft,
  Rutina,
} from '../types';
import { createProgramacionSemanas } from './routineScheduleUtils';

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const scoreMatch = (query: string, candidate: string): number => {
  const q = normalize(query);
  const c = normalize(candidate);
  if (!q || !c) return 0;
  if (q === c) return 100;
  if (c.includes(q) || q.includes(c)) return 80;

  const qTokens = new Set(q.split(/\s+/).filter(Boolean));
  const cTokens = c.split(/\s+/).filter(Boolean);
  if (qTokens.size === 0) return 0;
  const overlap = cTokens.filter((t) => qTokens.has(t)).length;
  return Math.round((overlap / qTokens.size) * 60);
};

const pickBestMatch = (
  query: string,
  results: ExerciseSearchItem[],
): ExerciseSearchItem | null => {
  if (results.length === 0) return null;

  let best: ExerciseSearchItem | null = null;
  let bestScore = 0;
  for (const item of results) {
    const score = scoreMatch(query, item.name);
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return bestScore >= 40 ? best : results[0] ?? null;
};

const searchTermFor = (nombre: string): string => {
  const trimmed = nombre.trim();
  if (trimmed.length >= 2) return trimmed.slice(0, 100);
  return `${trimmed} exercise`.slice(0, 100);
};

export const resolveOneExercise = async (
  nombre: string,
  series: number,
  valor: number,
  unidad_id = 1,
): Promise<ResolvedExercise> => {
  const safeSeries = clamp(Math.round(series || 3), 1, 10);
  const safeValor = clamp(Math.round(valor || 10), 1, 1000);

  try {
    const results = await searchExercises(searchTermFor(nombre));
    const match = pickBestMatch(nombre, results);
    if (!match) {
      return {
        nombre,
        series: safeSeries,
        valor: safeValor,
        unidad_id,
        matchStatus: 'unmatched',
        proposedName: nombre,
      };
    }

    const sameName = normalize(match.name) === normalize(nombre);
    let musculos_anatomia: string[] | undefined;
    try {
      const detail = await getExerciseById(match.exerciseId);
      musculos_anatomia = musclesFromExerciseDb(detail.targetMuscles, detail.secondaryMuscles);
    } catch {
      musculos_anatomia = undefined;
    }

    return {
      nombre: match.name,
      series: safeSeries,
      valor: safeValor,
      unidad_id,
      exerciseDbId: match.exerciseId,
      imageUrl: match.imageUrl,
      musculos_anatomia,
      matchStatus: 'matched',
      proposedName: sameName ? undefined : nombre,
    };
  } catch {
    return {
      nombre,
      series: safeSeries,
      valor: safeValor,
      unidad_id,
      matchStatus: 'unmatched',
      proposedName: nombre,
    };
  }
};

export const resolveExercisesAgainstApi = async (
  response: GenerateRoutineApiResponse,
): Promise<ResolvedRoutineDraft> => {
  const source = response.rutina.ejercicios;

  const exercises = await Promise.all(
    source.map((ex) =>
      resolveOneExercise(ex.nombre, ex.series, ex.valor, ex.unidad_id ?? 1),
    ),
  );

  const rutinaExercises: EjercicioRutina[] = exercises.map((ex) => ({
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

export const draftToRutinaPayload = (draft: ResolvedRoutineDraft): Omit<Rutina, 'id'> => {
  if (draft.rutina.programacion_semanal?.length) {
    return {
      ...draft.rutina,
      semanas: draft.rutina.semanas ?? draft.rutina.programacion_semanal.length,
    };
  }

  const programacion = createProgramacionSemanas(1);
  const lunes = programacion[0].dias.find((d) => d.dia === 1);
  if (lunes) lunes.ejercicios = draft.rutina.ejercicios;

  return {
    ...draft.rutina,
    semanas: 1,
    programacion_semanal: programacion,
  };
};
