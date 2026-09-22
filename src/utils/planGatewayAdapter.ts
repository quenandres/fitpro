import type { PlanUsuario, Rutina } from '../types';
import { normalizePlanUsuario } from './planScheduleUtils';

export function createEmptyPlanUsuario(id: number): PlanUsuario {
  return {
    id,
    nombre: 'Plan activo',
    descripcion: '',
    semanas: 1,
    dias_entrenar_semana: 3,
    modo: 'sesiones_variables',
    progresion: 'fijo',
    rutinas_asignadas: [],
    ejercicios_personalizados: [],
    programacion_semanal: [{ semana: 1, sesiones: [] }],
  };
}

export function planUsuarioToCreatePlanBody(
  clientUuid: string,
  plan: PlanUsuario,
  nombre?: string,
) {
  const normalized = normalizePlanUsuario(plan);
  const semanas = normalized.programacion_semanal.map((week) => ({
    numero: week.semana,
    sesiones: week.sesiones.map((session, idx) => ({
      orden: session.orden || idx + 1,
      nombre: session.nombre || `Entrenamiento ${idx + 1}`,
      ejercicios: session.ejercicios_personalizados
        .filter((ej) => Number.isFinite(ej.ejercicio_id) && ej.ejercicio_id > 0)
        .map((ej, i) => ({
          exercise_id: ej.ejercicio_id,
          orden: i + 1,
          series: ej.series,
          repeticiones: ej.valor,
          peso_objetivo_kg: ej.peso_objetivo_kg ?? null,
        })),
    })),
  }));

  return {
    client_id: clientUuid,
    nombre: nombre ?? normalized.nombre ?? 'Plan activo',
    semana_actual: 1,
    semanas,
  };
}

export function rutinaToGatewayPayload(rutina: Omit<Rutina, 'id'>) {
  return {
    nombre: rutina.nombre,
    categoria: rutina.categoria,
    dificultad: rutina.dificultad,
    duracion_min: rutina.duracion_min,
    descripcion: rutina.descripcion,
    semanas: rutina.semanas ?? 1,
    tipo: rutina.tipo ?? 'estandar',
    rest_between_sets: rutina.rest_between_sets ?? 60,
    notes: rutina.notes ?? '',
    status: 'published',
  };
}
