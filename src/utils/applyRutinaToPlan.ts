import type { DiaRutina, Rutina, SemanaPlan, SesionPlan } from '../types';
import { toEjercicioPersonalizado } from './distributeExercises';

/** Días de una semana de rutina que sí tienen ejercicios asignados (sesiones reales). */
function diasConEjercicios(semanaRutina: { dias: DiaRutina[] } | undefined, fallback: Rutina): DiaRutina[] {
  if (semanaRutina) {
    const dias = semanaRutina.dias.filter((d) => d.ejercicios.length > 0);
    if (dias.length > 0) return dias;
  }
  return fallback.ejercicios.length > 0
    ? [{ dia: 1, nombre: fallback.nombre, ejercicios: fallback.ejercicios }]
    : [];
}

/** Número de sesiones/semana que impone la rutina — usado como `dias_entrenar_semana` del plan. */
export function rutinaFrecuenciaSemanal(rutina: Rutina): number {
  const semanas = rutina.programacion_semanal;
  if (!semanas || semanas.length === 0) {
    return rutina.ejercicios.length > 0 ? 1 : 0;
  }
  return Math.max(...semanas.map((s) => s.dias.filter((d) => d.ejercicios.length > 0).length), 1);
}

function sesionesDesdeRutina(rutina: Rutina, semanaPlanAbsoluta: number, startWeek: number): SesionPlan[] {
  const totalSemanasRutina = rutina.semanas ?? rutina.programacion_semanal?.length ?? 1;
  const offset = Math.max(0, semanaPlanAbsoluta - startWeek);
  const idx = totalSemanasRutina > 0 ? (offset % totalSemanasRutina) : 0;
  const semanaRutina = rutina.programacion_semanal?.[idx];
  const dias = diasConEjercicios(semanaRutina, rutina);

  if (dias.length === 0) {
    return [
      {
        orden: 1,
        nombre: rutina.nombre,
        rutina_id: rutina.id,
        rutina_nombre: rutina.nombre,
        ejercicios_personalizados: [],
      },
    ];
  }

  return dias.map((dia, i) => ({
    orden: i + 1,
    nombre: dia.nombre || `Sesión ${i + 1}`,
    rutina_id: rutina.id,
    rutina_nombre: rutina.nombre,
    ejercicios_personalizados: dia.ejercicios.map(toEjercicioPersonalizado),
  }));
}

/**
 * Reconstruye la programación semanal de un plan a partir de una rutina, solo en las
 * semanas indicadas en `weeksToApply` (1-indexed). Las demás semanas del plan quedan
 * intactas — así una semana ya ejecutada nunca se sobrescribe.
 */
export function buildProgramacionFromRutina(
  rutina: Rutina,
  programacion: SemanaPlan[],
  weeksToApply: number[],
): SemanaPlan[] {
  const applySet = new Set(weeksToApply);
  const startWeek = weeksToApply.length > 0 ? Math.min(...weeksToApply) : 1;
  return programacion.map((semana) => {
    if (!applySet.has(semana.semana)) return semana;
    return { ...semana, sesiones: sesionesDesdeRutina(rutina, semana.semana, startWeek) };
  });
}
