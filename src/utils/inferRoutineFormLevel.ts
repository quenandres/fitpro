import type { Rutina, RoutineFormData, RoutineFormLevel } from '../types';
import { ROUTES } from '../routes/paths';
import {
  createProgramacionSemanas,
  programacionHasDistinctWeeks,
  rutinaProgramacionToForm,
} from './routineScheduleUtils';

const uid = (): string =>
  `ex_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export const rutinaToFormData = (rutina: Rutina): RoutineFormData => {
  const programacion = rutinaProgramacionToForm(rutina);
  const semanas = rutina.semanas ?? programacion.length;
  const firstDia = programacion[0]?.dias.find((d) => d.ejercicios.length > 0)
    ?? programacion[0]?.dias[0];

  return {
    nombre: rutina.nombre,
    categoria: rutina.categoria || '',
    descripcion: rutina.descripcion || '',
    dificultad: rutina.dificultad,
    duracion_min: rutina.duracion_min,
    tipo: rutina.tipo ?? 'estandar',
    rest_between_sets: rutina.rest_between_sets ?? 60,
    notes: rutina.notes ?? '',
    semanas,
    programacion_semanal: programacion,
    ejercicios: firstDia?.ejercicios ?? [],
  };
};

export const inferInitialCreateMode = (rutina: Rutina | null): 'semana_tipo' | 'semana_a_semana' => {
  if (!rutina?.programacion_semanal?.length) return 'semana_tipo';
  if (programacionHasDistinctWeeks(rutina.programacion_semanal)) return 'semana_a_semana';
  return 'semana_tipo';
};

export const createEmptyProgramacion = () => createProgramacionSemanas(1);

export const inferRoutineFormLevel = (rutina: Rutina): RoutineFormLevel => {
  const dif = rutina.dificultad.toLowerCase();
  if (dif.includes('avanzado')) return 'avanzada';
  if (dif.includes('intermedio')) return 'intermedia';
  if (dif.includes('principiante')) return 'basica';

  const allEjercicios = rutina.programacion_semanal?.length
    ? rutina.programacion_semanal.flatMap((s) => s.dias.flatMap((d) => d.ejercicios))
    : rutina.ejercicios;

  const hasAdvancedFields =
    (rutina.tipo && rutina.tipo !== 'estandar') ||
    allEjercicios.some((e) => e.rpe != null || e.grupo_superset);

  if (hasAdvancedFields) return 'avanzada';

  const hasIntermediateFields =
    Boolean(rutina.categoria?.trim()) ||
    Boolean(rutina.descripcion?.trim()) ||
    rutina.rest_between_sets != null ||
    Boolean(rutina.notes?.trim());

  if (hasIntermediateFields) return 'intermedia';

  return 'basica';
};

export const routineFormPath = (level: RoutineFormLevel, id?: number): string =>
  ROUTES.library.rutinaNueva(level, id);

export const routineEditPath = (rutina: Rutina): string =>
  routineFormPath(inferRoutineFormLevel(rutina), rutina.id);
