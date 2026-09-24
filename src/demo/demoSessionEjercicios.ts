import ejerciciosData from '../data/ejercicios.json';
import type { EjercicioEjecutado, SerieEjecutada } from '../types';

const catalog = ejerciciosData as Array<{
  id: number;
  nombre: string;
  unidad_id_default?: number;
}>;

function seriesTemplate(peso: number, reps: number, count: number): SerieEjecutada[] {
  return Array.from({ length: count }, (_, i) => ({
    n: i + 1,
    reps: reps - (i > 0 ? 1 : 0),
    peso_kg: peso + i * 2.5,
  }));
}

export function buildDemoEjerciciosForRutina(
  rutinaId: number,
  rutinaNombre: string,
): EjercicioEjecutado[] {
  if (catalog.length === 0) return [];
  const a = catalog[Math.abs(rutinaId) % catalog.length];
  const b = catalog[(Math.abs(rutinaId) + 3) % catalog.length];
  const picks = a.id === b.id ? [a] : [a, b];
  const pesoBase = rutinaNombre.toLowerCase().includes('pierna') ? 60 : 45;
  return picks.map((ej, index) => ({
    ejercicio_id: ej.id,
    nombre: ej.nombre,
    unidad_id: ej.unidad_id_default ?? 1,
    series: seriesTemplate(pesoBase + index * 10, 10, 3),
  }));
}
