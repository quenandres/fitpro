import type {
  EjercicioEjecutado,
  EjercicioPersonalizado,
  EjercicioRutina,
  SerieEjecutada,
  SesionEntrenamiento,
} from '../types';

/** Unidades de carga donde tiene sentido pedir peso (kg). */
export const UNIDADES_CON_PESO = new Set([1, 6, 7]);

export function unidadAceptaPeso(unidad_id: number): boolean {
  return UNIDADES_CON_PESO.has(unidad_id);
}

export function crearSeriesPlantilla(
  series: number,
  valor: number,
  unidad_id: number,
): SerieEjecutada[] {
  const aceptaPeso = unidadAceptaPeso(unidad_id);
  return Array.from({ length: series }, (_, i) => ({
    n: i + 1,
    reps: valor,
    peso_kg: aceptaPeso ? null : null,
  }));
}

export function ejercicioRutinaToEjecutado(e: EjercicioRutina): EjercicioEjecutado {
  return {
    ejercicio_id: e.ejercicio_id,
    nombre: e.nombre,
    unidad_id: e.unidad_id,
    series: crearSeriesPlantilla(e.series, e.valor, e.unidad_id),
  };
}

export function ejercicioPersonalizadoToEjecutado(e: EjercicioPersonalizado): EjercicioEjecutado {
  return {
    ejercicio_id: e.ejercicio_id,
    nombre: e.nombre,
    unidad_id: e.unidad_id,
    series: crearSeriesPlantilla(e.series, e.valor, e.unidad_id),
  };
}

export function contarSeriesCompletadas(ejercicios: EjercicioEjecutado[]): number {
  return ejercicios.reduce((acc, e) => acc + e.series.length, 0);
}

export function buildSesionEntrenamiento(
  input: Omit<SesionEntrenamiento, 'series_completadas' | 'ejercicios'> & {
    ejercicios: EjercicioEjecutado[];
  },
): SesionEntrenamiento {
  return {
    ...input,
    series_completadas: contarSeriesCompletadas(input.ejercicios),
  };
}

/** Genera series mock con peso/reps para seeds de demostración. */
export function generarSeriesMock(
  series: number,
  valor: number,
  unidad_id: number,
  pesoBaseKg = 20,
): SerieEjecutada[] {
  const aceptaPeso = unidadAceptaPeso(unidad_id);
  return Array.from({ length: series }, (_, i) => ({
    n: i + 1,
    reps: valor,
    peso_kg: aceptaPeso ? pesoBaseKg + i * 2.5 : null,
  }));
}
