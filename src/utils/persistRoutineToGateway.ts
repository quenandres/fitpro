import type { Rutina } from '../types';
import { createRoutine } from '../lib/gateway/routines.service';
import { isMockMode } from '../lib/mock-mode';

export async function persistRoutineToGateway(
  rutina: Omit<Rutina, 'id'>,
  options?: { assignToSelf?: boolean },
): Promise<string> {
  if (isMockMode()) {
    return `demo-routine-${Date.now()}`;
  }
  const semanas = rutina.programacion_semanal?.length
    ? rutina.programacion_semanal
    : [{ semana: 1, dias: [{ dia: 1, nombre: rutina.nombre, ejercicios: rutina.ejercicios }] }];

  const created = await createRoutine({
    nombre: rutina.nombre,
    categoria: rutina.categoria,
    dificultad: rutina.dificultad,
    duracion_min: rutina.duracion_min,
    descripcion: rutina.descripcion,
    semanas: rutina.semanas ?? semanas.length,
    tipo: rutina.tipo ?? 'estandar',
    rest_between_sets: rutina.rest_between_sets ?? 60,
    notes: rutina.notes ?? '',
    assign_to_self: options?.assignToSelf ?? false,
    programacion: semanas.map((semana) => ({
      semana: semana.semana,
      dias: semana.dias.map((dia) => ({
        dia: dia.dia,
        nombre: dia.nombre,
        ejercicios: dia.ejercicios
          .filter((ej) => ej.ejercicio_id != null)
          .map((ej, index) => ({
            exercise_id: Number(ej.ejercicio_id),
            orden: index + 1,
            series: ej.series,
            repeticiones: ej.valor,
            peso_kg: ej.unidad_id === 1 ? undefined : ej.valor,
          })),
      })),
    })),
  });

  return created.template.id;
}
