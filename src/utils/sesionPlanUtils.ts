import type { PlanModo, Rutina, SesionPlan } from '../types';

export function isSesionConfigured(sesion: SesionPlan): boolean {
  return (
    sesion.ejercicios_personalizados.length > 0
    || (sesion.rutina_id != null && sesion.rutina_id > 0)
  );
}

export function entrenamientoLabel(
  sesion: SesionPlan,
  sesionIndex: number,
  modo: PlanModo,
): string {
  if (modo === 'repetitiva') return sesion.nombre || 'Rutina semanal';
  return sesion.nombre || `Entrenamiento ${sesionIndex + 1}`;
}

export function estimateSesionMinutos(sesion: SesionPlan, rutinas: readonly Rutina[]): number {
  if (sesion.ejercicios_personalizados.length > 0) {
    const series = sesion.ejercicios_personalizados.reduce((acc, e) => acc + e.series, 0);
    return Math.max(20, Math.round(series * 0.5));
  }
  if (sesion.rutina_id != null && sesion.rutina_id > 0) {
    return rutinas.find((r) => r.id === sesion.rutina_id)?.duracion_min ?? 45;
  }
  return 0;
}

export interface SesionPersonalizadaPayload {
  nombre: string;
  ejercicios: SesionPlan['ejercicios_personalizados'];
}
