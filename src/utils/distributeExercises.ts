import type { EjercicioPersonalizado, EjercicioRutina } from '../types';

export const toEjercicioPersonalizado = (e: EjercicioRutina): EjercicioPersonalizado => ({
  nombre: e.nombre,
  series: e.series,
  reps: e.valor,
  notas: '',
});

export const distribuirEjercicios = (
  ejercicios: EjercicioRutina[],
  diasSeleccionados: number[]
): Map<number, EjercicioPersonalizado[]> => {
  const result = new Map<number, EjercicioPersonalizado[]>();
  const dias = [...diasSeleccionados];
  if (dias.length === 0) return result;

  dias.forEach((d) => result.set(d, []));

  if (ejercicios.length === 0) return result;

  const total = ejercicios.length;
  const n = dias.length;
  const base = Math.floor(total / n);
  const extra = total % n;

  let cursor = 0;
  dias.forEach((dia, idx) => {
    const size = base + (idx < extra ? 1 : 0);
    const slice = ejercicios.slice(cursor, cursor + size).map(toEjercicioPersonalizado);
    result.set(dia, slice);
    cursor += size;
  });

  return result;
};
