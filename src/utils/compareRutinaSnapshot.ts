import type { DiaSemana, EjercicioPersonalizado, Rutina } from '../types';

export type SyncStatus = 'sincronizado' | 'modificada' | 'desasignada' | 'sin_rutina';

export const compareRutinaSnapshot = (
  rutina: Rutina | undefined,
  dia: DiaSemana
): SyncStatus => {
  const rutinaId = dia.rutina_id;
  if (rutinaId === null || rutinaId === 0 || rutinaId === -1) {
    return 'sin_rutina';
  }
  if (!rutina) return 'desasignada';

  const actual = rutina.ejercicios;
  const snapshot = dia.ejercicios_personalizados;

  if (actual.length !== snapshot.length) return 'modificada';

  for (let i = 0; i < actual.length; i++) {
    const a = actual[i];
    const s = snapshot[i];
    if (a.nombre !== s.nombre) return 'modificada';
    if (a.series !== s.series) return 'modificada';
    if (a.valor !== s.reps) return 'modificada';
  }

  return 'sincronizado';
};

export const resincronizarDia = (
  rutina: Rutina,
  diaActual: DiaSemana
): EjercicioPersonalizado[] => {
  const notasPorNombre = new Map<string, string>();
  diaActual.ejercicios_personalizados.forEach((e) => {
    if (e.notas) notasPorNombre.set(e.nombre, e.notas);
  });

  return rutina.ejercicios.map((e) => ({
    nombre: e.nombre,
    series: e.series,
    reps: e.valor,
    notas: notasPorNombre.get(e.nombre) || '',
  }));
};
