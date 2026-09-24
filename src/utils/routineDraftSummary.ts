import type { Rutina, RoutineFormLevel } from '../types';
import { inferRoutineFormLevel, routineEditPath } from './inferRoutineFormLevel';
import { countTotalEjercicios } from './routineScheduleUtils';

export type RoutineCreationMethodLabel = 'Plantilla base' | 'Paso a paso' | 'Sintetizado IA' | 'Biblioteca';

export interface RoutineDraftRow {
  id: number;
  nombre: string;
  codigo: string;
  tipo: RoutineCreationMethodLabel;
  atleta: string;
  volumenLabel: string;
  modificadoLabel: string;
  editPath: string;
  level: RoutineFormLevel;
}

function countSeries(rutina: Rutina): number {
  const ejercicios = rutina.programacion_semanal?.length
    ? rutina.programacion_semanal[0]?.dias.flatMap((d) => d.ejercicios) ?? []
    : rutina.ejercicios;
  return ejercicios.reduce((acc, e) => acc + e.series, 0);
}

function inferCreationMethod(rutina: Rutina): RoutineCreationMethodLabel {
  const notes = (rutina.notes ?? '').toLowerCase();
  const desc = (rutina.descripcion ?? '').toLowerCase();
  if (notes.includes('ia') || desc.includes('generad')) return 'Sintetizado IA';
  if (rutina.categoria === 'Funcional' && rutina.tipo === 'circuit') return 'Plantilla base';
  return 'Paso a paso';
}

export function rutinaToDraftRow(rutina: Rutina): RoutineDraftRow {
  const series = countSeries(rutina);
  const ejCount = countTotalEjercicios(
    rutina.programacion_semanal ?? [{ semana: 1, dias: [{ dia: 1, nombre: 'Día 1', ejercicios: rutina.ejercicios }] }],
  );
  const avgSeries = ejCount > 0 ? Math.round(series / Math.max(1, rutina.semanas ?? 1)) : series;

  return {
    id: rutina.id,
    nombre: rutina.nombre,
    codigo: `RT-${String(rutina.id).padStart(4, '0')}`,
    tipo: inferCreationMethod(rutina),
    atleta: 'Sin asignar',
    volumenLabel: `${avgSeries} series/ses.`,
    modificadoLabel: 'En biblioteca',
    editPath: routineEditPath(rutina),
    level: inferRoutineFormLevel(rutina),
  };
}
