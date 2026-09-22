import { generateRoutineWithAI } from '../lib/ai/deepseek';
import type {
  GenerateRoutineRequest,
  ResolvedRoutineDraft,
  SemanaPlan,
  SesionPlan,
} from '../types';
import { sanitizeTrainingDays } from './aiRoutineAdapter';
import { distribuirEjercicios, toEjercicioPersonalizado } from './distributeExercises';
import { createEmptySemanaPlan } from './planScheduleUtils';
import { resolveCatalogRoutine } from './resolveCatalogRoutine';
import { validateGenerateRoutineInput } from './validators';

const MODO_INICIAL = 'sesiones_variables';

export function composeClienteObjetivo(corto: string, detalle: string): string {
  return [corto.trim(), detalle.trim()].filter(Boolean).join('. ').slice(0, 500);
}

export function buildClientGenerateRequest(input: {
  objetivo: string;
  nivel: string;
  pesoKg?: number;
  diasEntrenar: number;
}): GenerateRoutineRequest {
  return {
    objetivo: input.objetivo,
    nivel: input.nivel || undefined,
    cliente: {
      nivel: input.nivel || undefined,
      objetivo: input.objetivo,
      peso_kg: input.pesoKg,
      dias_entrenar: input.diasEntrenar,
    },
    duracion_min: 45,
  };
}

export function programacionFromGeneratedRoutine(
  draft: ResolvedRoutineDraft,
  semanas: number,
  frecuencia: number,
): SemanaPlan[] {
  const ejercicios = draft.rutina.ejercicios.filter((ej) => ej.ejercicio_id > 0);
  if (ejercicios.length === 0) {
    throw new Error('La IA no devolvió ejercicios del catálogo. Prueba otra descripción.');
  }

  const plantilla = createEmptySemanaPlan(1, frecuencia, MODO_INICIAL);
  const dayNames = sanitizeTrainingDays(draft.dias_entrenamiento);
  const slots = plantilla.sesiones.map((_, index) => index);
  const grouped = distribuirEjercicios(ejercicios, slots);

  const sesiones: SesionPlan[] = plantilla.sesiones.map((sesion, index) => {
    const assigned = grouped.get(index) ?? ejercicios.map(toEjercicioPersonalizado);
    return {
      ...sesion,
      nombre: dayNames[index] ?? sesion.nombre,
      rutina_id: assigned.length > 0 ? 0 : null,
      rutina_nombre: assigned.length > 0 ? draft.rutina.nombre : '',
      ejercicios_personalizados: assigned,
    };
  });

  return Array.from({ length: semanas }, (_, weekIndex) => ({
    semana: weekIndex + 1,
    sesiones: sesiones.map((sesion) => ({
      ...sesion,
      ejercicios_personalizados: sesion.ejercicios_personalizados.map((ej) => ({ ...ej })),
    })),
  }));
}

export function programacionToInviteSemanas(programacion: SemanaPlan[]) {
  return programacion.map((semana) => ({
    numero: semana.semana,
    sesiones: semana.sesiones.map((sesion) => ({
      orden: sesion.orden,
      nombre: sesion.nombre,
      ejercicios: sesion.ejercicios_personalizados
        .filter((ej) => Number.isFinite(ej.ejercicio_id) && ej.ejercicio_id > 0)
        .map((ej, index) => ({
          exercise_id: ej.ejercicio_id,
          orden: index + 1,
          series: ej.series,
          repeticiones: ej.valor,
          peso_objetivo_kg: ej.peso_objetivo_kg ?? null,
        })),
    })),
  }));
}

export async function generateClientPlanFromObjetivo(input: {
  objetivo: string;
  nivel: string;
  pesoKg?: number;
  diasEntrenar: number;
  semanas: number;
}): Promise<{ programacion: SemanaPlan[]; draft: ResolvedRoutineDraft }> {
  const payload = buildClientGenerateRequest(input);
  const errors = validateGenerateRoutineInput(payload);
  if (errors.length > 0) {
    throw new Error(errors[0]?.message ?? 'Describe qué quiere el cliente para generar la rutina');
  }

  const generated = await generateRoutineWithAI(payload);
  const withDays = {
    ...generated,
    dias_entrenamiento: sanitizeTrainingDays(generated.dias_entrenamiento),
  };
  const draft = await resolveCatalogRoutine(withDays);
  return {
    draft,
    programacion: programacionFromGeneratedRoutine(draft, input.semanas, input.diasEntrenar),
  };
}
