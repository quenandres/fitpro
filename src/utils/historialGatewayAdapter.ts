import type { GatewayHistorialRow } from '../lib/gateway/schemas/training';
import type { EjercicioEjecutado, SesionEntrenamiento } from '../types';

export function mapGatewayHistorial(
  rows: GatewayHistorialRow[],
  usuarioId: number,
): SesionEntrenamiento[] {
  return rows.map((row) => {
    const byExercise = new Map<number, EjercicioEjecutado>();

    for (const serie of row.series ?? []) {
      const ejercicioId = Number(serie.ejercicio_id);
      if (Number.isNaN(ejercicioId)) continue;
      const existing = byExercise.get(ejercicioId);
      const entry: EjercicioEjecutado = existing ?? {
        ejercicio_id: ejercicioId,
        nombre: serie.nombre?.trim() || `Ejercicio ${ejercicioId}`,
        unidad_id: 1,
        series: [],
      };
      entry.series.push({
        n: serie.numero_serie,
        reps: serie.repeticiones,
        peso_kg: serie.peso_kg,
      });
      byExercise.set(ejercicioId, entry);
    }

    const ejercicios = [...byExercise.values()].map((ej) => ({
      ...ej,
      series: ej.series.sort((a, b) => a.n - b.n),
    }));

    const seriesCompletadas = ejercicios.reduce((acc, ej) => acc + ej.series.length, 0);

    return {
      id: row.id,
      usuario_id: usuarioId,
      fecha: row.fecha,
      rutina_id: 0,
      rutina_nombre: row.nombre,
      modalidad: 'fuerza' as const,
      duracion_min: Math.max(20, seriesCompletadas * 2),
      series_completadas: seriesCompletadas,
      ejercicios,
    };
  });
}
