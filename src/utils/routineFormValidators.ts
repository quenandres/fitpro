import type { RoutineFormData, RoutineFormLevel } from '../types';
import type { ValidationError } from './validators';
import {
  countDiasEntreno,
  countTotalEjercicios,
  hasAnyExercise,
  MAX_RUTINA_SEMANAS,
  MIN_RUTINA_SEMANAS,
} from './routineScheduleUtils';

const validateNombre = (nombre: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  if (!nombre.trim()) {
    errors.push({ field: 'nombre', message: 'El nombre es obligatorio' });
  } else if (nombre.length < 3) {
    errors.push({ field: 'nombre', message: 'El nombre debe tener al menos 3 caracteres' });
  } else if (nombre.length > 50) {
    errors.push({ field: 'nombre', message: 'El nombre no puede exceder 50 caracteres' });
  }
  return errors;
};

const validateSemanas = (semanas: number): ValidationError[] => {
  if (semanas < MIN_RUTINA_SEMANAS || semanas > MAX_RUTINA_SEMANAS) {
    return [{
      field: 'semanas',
      message: `El programa debe durar entre ${MIN_RUTINA_SEMANAS} y ${MAX_RUTINA_SEMANAS} semanas`,
    }];
  }
  return [];
};

const validateProgramacion = (data: RoutineFormData): ValidationError[] => {
  if (!hasAnyExercise(data.programacion_semanal)) {
    return [{ field: 'ejercicios', message: 'Agrega al menos un ejercicio en algún día' }];
  }

  const errors: ValidationError[] = [];
  data.programacion_semanal.forEach((semana, sIdx) => {
    semana.dias.forEach((dia, dIdx) => {
      dia.ejercicios.forEach((ej, i) => {
        if (ej.series < 1 || ej.series > 20) {
          errors.push({
            field: `programacion.${sIdx}.dias.${dIdx}.ejercicios.${i}.series`,
            message: 'Series inválidas',
          });
        }
        if (ej.valor < 1 || ej.valor > 1000) {
          errors.push({
            field: `programacion.${sIdx}.dias.${dIdx}.ejercicios.${i}.valor`,
            message: 'Repeticiones/valor inválido',
          });
        }
        if (ej.rpe !== undefined && (ej.rpe < 1 || ej.rpe > 10)) {
          errors.push({
            field: `programacion.${sIdx}.dias.${dIdx}.ejercicios.${i}.rpe`,
            message: 'RPE debe estar entre 1 y 10',
          });
        }
      });
    });
  });
  return errors;
};

export const validateBasicRoutine = (data: RoutineFormData): ValidationError[] => [
  ...validateNombre(data.nombre),
  ...validateSemanas(data.semanas),
  ...validateProgramacion(data),
];

export const validateIntermediateRoutine = (data: RoutineFormData): ValidationError[] => {
  const errors: ValidationError[] = [...validateBasicRoutine(data)];
  if (!data.categoria) {
    errors.push({ field: 'categoria', message: 'Selecciona una categoría' });
  }
  if (countTotalEjercicios(data.programacion_semanal) > 0 &&
    (data.duracion_min < 1 || data.duracion_min > 120)) {
    errors.push({ field: 'duracion_min', message: 'La duración calculada debe estar entre 1 y 120 minutos' });
  }
  if (data.descripcion.length > 500) {
    errors.push({ field: 'descripcion', message: 'La descripción no puede exceder 500 caracteres' });
  }
  if (data.rest_between_sets < 0) {
    errors.push({ field: 'rest_between_sets', message: 'Ingresa un tiempo de descanso válido' });
  }
  if (data.notes.length > 500) {
    errors.push({ field: 'notes', message: 'Las notas no pueden exceder 500 caracteres' });
  }
  return errors;
};

export const validateAdvancedRoutine = (data: RoutineFormData): ValidationError[] => {
  const errors: ValidationError[] = [...validateIntermediateRoutine(data)];
  if (!data.tipo) {
    errors.push({ field: 'tipo', message: 'Selecciona el tipo de rutina' });
  }
  return errors;
};

export const validateRoutineByLevel = (
  level: RoutineFormLevel,
  data: RoutineFormData,
): ValidationError[] => {
  switch (level) {
    case 'basica':
      return validateBasicRoutine(data);
    case 'intermedia':
      return validateIntermediateRoutine(data);
    case 'avanzada':
      return validateAdvancedRoutine(data);
  }
};

export const getFieldError = (
  errors: ValidationError[],
  field: string,
): string | undefined => errors.find((e) => e.field === field)?.message;

export const countFormDiasEntreno = (data: RoutineFormData): number =>
  data.programacion_semanal.reduce(
    (acc, s) => acc + countDiasEntreno(s),
    0,
  );
