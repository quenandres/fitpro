import type { Rutina, RoutineFormData, RoutineFormLevel } from '../types';
import { ROUTES } from '../routes/paths';

const uid = (): string =>
  `ex_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export const rutinaToFormData = (rutina: Rutina): RoutineFormData => ({
  nombre: rutina.nombre,
  categoria: rutina.categoria || '',
  descripcion: rutina.descripcion || '',
  dificultad: rutina.dificultad,
  duracion_min: rutina.duracion_min,
  tipo: rutina.tipo ?? 'estandar',
  rest_between_sets: rutina.rest_between_sets ?? 60,
  notes: rutina.notes ?? '',
  ejercicios: rutina.ejercicios.map((ej) => ({
    ...ej,
    _key: uid(),
  })),
});

export const inferRoutineFormLevel = (rutina: Rutina): RoutineFormLevel => {
  const dif = rutina.dificultad.toLowerCase();
  if (dif.includes('avanzado')) return 'avanzada';
  if (dif.includes('intermedio')) return 'intermedia';
  if (dif.includes('principiante')) return 'basica';

  const hasAdvancedFields =
    (rutina.tipo && rutina.tipo !== 'estandar') ||
    rutina.ejercicios.some((e) => e.rpe != null || e.grupo_superset);

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
