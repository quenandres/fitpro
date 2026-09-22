import type { EjercicioPersonalizado, Rutina, SesionPlan } from '../types';
import { normalizeEjercicioPersonalizado } from './planScheduleUtils';
import { toEjercicioPersonalizado } from './distributeExercises';

export type SyncStatus = 'sincronizado' | 'modificada' | 'desasignada' | 'sin_rutina';

export const compareRutinaSnapshot = (
  rutina: Rutina | undefined,
  sesion: SesionPlan,
): SyncStatus => {
  const rutinaId = sesion.rutina_id;
  if (rutinaId === null || rutinaId === 0 || rutinaId === -1) {
    return 'sin_rutina';
  }
  if (!rutina) return 'desasignada';

  const actual = rutina.ejercicios;
  const snapshot = sesion.ejercicios_personalizados;

  if (actual.length !== snapshot.length) return 'modificada';

  for (let i = 0; i < actual.length; i++) {
    const a = actual[i];
    const s = normalizeEjercicioPersonalizado(snapshot[i]);
    if (a.ejercicio_id !== s.ejercicio_id) return 'modificada';
    if (a.series !== s.series) return 'modificada';
    if (a.valor !== s.valor) return 'modificada';
    if (a.unidad_id !== s.unidad_id) return 'modificada';
    if ((a.rpe ?? 7) !== (s.rpe ?? 7)) return 'modificada';
    if ((s.notas ?? '').trim()) return 'modificada';
  }

  return 'sincronizado';
};

export const resincronizarSesion = (
  rutina: Rutina,
  sesionActual: SesionPlan,
): EjercicioPersonalizado[] => {
  const notasPorId = new Map<number, string>();
  sesionActual.ejercicios_personalizados.forEach((e) => {
    if (e.notas) notasPorId.set(e.ejercicio_id, e.notas);
  });

  return rutina.ejercicios.map((e) => {
    const base = toEjercicioPersonalizado(e);
    const notas = notasPorId.get(e.ejercicio_id);
    return notas ? { ...base, notas } : base;
  });
};
