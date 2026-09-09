import type {
  PlanModo,
  PlanProgresionModo,
  PlanUsuario,
  ReglaProgresion,
  Rutina,
  RutinaAsignada,
  SemanaPlan,
  SesionPlan,
  Usuario,
} from '../types';
import { proyectarEjercicioEnSemana } from './planProgresionUtils';
import { toEjercicioPersonalizado } from './distributeExercises';
import { recalcularSesionIncremental } from './planProgresionUtils';
import {
  clampFrecuencia,
  createSesionesPlan,
  expandPlanSemanas,
  normalizeEjercicioPersonalizado,
  sesionNombre,
} from './planScheduleUtils';
import { isSesionConfigured } from './sesionPlanUtils';
import { fechaLocalISO } from './trackingUtils';

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;

export interface GuidedPlanDraft {
  nombre: string;
  descripcion: string;
  objetivo: string;
  semanas: number;
  fecha_inicio: string;
  frecuencia: number;
  descanso_min_dias: number;
  modo: PlanModo;
  progresion: PlanProgresionModo;
  regla_progresion_global?: ReglaProgresion;
  sesiones: SesionPlan[];
}

export function maxSesionesPorDescanso(descansoMinDias: number): number {
  return Math.floor(7 / (Math.max(0, descansoMinDias) + 1));
}

export function validateCadencia(
  frecuencia: number,
  descansoMinDias: number,
): { valid: boolean; message?: string } {
  const max = maxSesionesPorDescanso(descansoMinDias);
  if (frecuencia > max) {
    return {
      valid: false,
      message: `Con ${descansoMinDias} día(s) mínimo entre sesiones caben como máximo ${max} entrenos por semana.`,
    };
  }
  return { valid: true };
}

/** Cadencia sugerida (orientativa, no persiste weekdays). */
export function suggestCadenceLabels(frecuencia: number, descansoMinDias: number): string[] {
  const step = descansoMinDias + 1;
  const labels: string[] = [];
  let dayIndex = 0;
  for (let i = 0; i < frecuencia && dayIndex < 7; i++) {
    labels.push(DAY_LABELS[dayIndex]);
    dayIndex += step;
  }
  return labels;
}

export function planHasConfiguredSessions(plan: PlanUsuario): boolean {
  const week1 = plan.programacion_semanal[0];
  if (!week1) return false;
  return week1.sesiones.some(isSesionConfigured);
}

export function createInitialGuidedDraft(user: Usuario): GuidedPlanDraft {
  const plan = user.plan;
  const frecuencia = clampFrecuencia(plan.dias_entrenar_semana);
  const modo = plan.modo;
  const sesiones =
    plan.programacion_semanal[0]?.sesiones.length
      ? plan.programacion_semanal[0].sesiones.map((s) => ({
          ...s,
          ejercicios_personalizados: s.ejercicios_personalizados.map((e) =>
            normalizeEjercicioPersonalizado({ ...e }),
          ),
        }))
      : createSesionesPlan(frecuencia, modo);

  return {
    nombre: plan.nombre || `Plan de ${user.nombre}`,
    descripcion: plan.descripcion || user.objetivo,
    objetivo: user.objetivo,
    semanas: plan.semanas || 4,
    fecha_inicio: plan.fecha_inicio ?? fechaLocalISO(new Date()),
    frecuencia,
    descanso_min_dias: plan.descanso_min_dias ?? 1,
    modo,
    progresion: plan.progresion ?? 'fijo',
    regla_progresion_global: plan.regla_progresion_global ?? {
      peso_incremento: 2.5,
      reps_incremento: 2,
      cada_semanas: 1,
    },
    sesiones,
  };
}

function cloneSesiones(sesiones: SesionPlan[]): SesionPlan[] {
  return sesiones.map((s) => ({
    ...s,
    ejercicios_personalizados: s.ejercicios_personalizados.map((e) =>
      normalizeEjercicioPersonalizado({ ...e }),
    ),
  }));
}

function applyGlobalProgressionToSesiones(
  sesiones: SesionPlan[],
  regla?: ReglaProgresion,
): SesionPlan[] {
  if (!regla) return sesiones;
  return sesiones.map((s) => ({
    ...s,
    ejercicios_personalizados: s.ejercicios_personalizados.map((e) => ({
      ...e,
      regla_progresion: e.regla_progresion ?? regla,
    })),
  }));
}

function collectRutinasAsignadas(sesiones: SesionPlan[], frecuencia: number): RutinaAsignada[] {
  const seen = new Map<number, RutinaAsignada>();
  for (const s of sesiones) {
    if (s.rutina_id != null && s.rutina_id > 0) {
      seen.set(s.rutina_id, {
        rutina_id: s.rutina_id,
        nombre_rutina: s.rutina_nombre,
        frecuencia: `${frecuencia} sesiones/semana`,
      });
    }
  }
  return [...seen.values()];
}

export function resizeGuidedDraftSesiones(
  draft: GuidedPlanDraft,
  frecuencia: number,
  modo: PlanModo,
): SesionPlan[] {
  if (modo === 'repetitiva') {
    const current = draft.sesiones[0] ?? createSesionesPlan(1, modo)[0];
    return [{ ...current, orden: 1, nombre: current.nombre || sesionNombre(1) }];
  }
  const n = clampFrecuencia(frecuencia);
  const next = cloneSesiones(draft.sesiones);
  while (next.length < n) {
    next.push({
      orden: next.length + 1,
      nombre: sesionNombre(next.length + 1),
      rutina_id: null,
      rutina_nombre: '',
      ejercicios_personalizados: [],
    });
  }
  return next.slice(0, n).map((s, i) => ({
    ...s,
    orden: i + 1,
    nombre: s.nombre || sesionNombre(i + 1),
  }));
}

export function assignRutinaToDraftSesion(sesion: SesionPlan, rutina: Rutina): SesionPlan {
  return {
    ...sesion,
    rutina_id: rutina.id,
    rutina_nombre: rutina.nombre,
    nombre: sesion.nombre || rutina.nombre,
    ejercicios_personalizados: rutina.ejercicios.map(toEjercicioPersonalizado),
  };
}

export function buildPlanFromGuidedDraft(
  userId: number,
  draft: GuidedPlanDraft,
): PlanUsuario {
  let sesionesWeek1 = cloneSesiones(draft.sesiones);

  if (draft.progresion === 'incremental') {
    sesionesWeek1 = applyGlobalProgressionToSesiones(
      sesionesWeek1,
      draft.regla_progresion_global,
    );
  }

  const week1: SemanaPlan = { semana: 1, sesiones: sesionesWeek1 };
  let programacion = expandPlanSemanas(
    [week1],
    draft.semanas,
    'clone_first',
    draft.frecuencia,
    draft.modo,
  );

  if (draft.progresion === 'incremental') {
    programacion = programacion.map((week) => {
      if (week.semana === 1) return week;
      return {
        ...week,
        sesiones: week.sesiones.map((s, idx) => {
          const base = sesionesWeek1[idx]?.ejercicios_personalizados ?? [];
          return {
            ...s,
            ejercicios_personalizados: recalcularSesionIncremental(base, week.semana, 1),
          };
        }),
      };
    });
  }

  return {
    id: userId,
    nombre: draft.nombre.trim(),
    descripcion: draft.descripcion.trim(),
    semanas: draft.semanas,
    dias_entrenar_semana: draft.frecuencia,
    modo: draft.modo,
    progresion: draft.progresion,
    fecha_inicio: draft.fecha_inicio,
    descanso_min_dias: draft.descanso_min_dias,
    regla_progresion_global:
      draft.progresion === 'incremental' ? draft.regla_progresion_global : undefined,
    rutinas_asignadas: collectRutinasAsignadas(sesionesWeek1, draft.frecuencia),
    ejercicios_personalizados: [],
    programacion_semanal: programacion,
  };
}

export function countEmptyGuidedSlots(sesiones: SesionPlan[]): number {
  return sesiones.filter((s) => !isSesionConfigured(s)).length;
}

export function isReglaProgresionValida(regla?: ReglaProgresion): boolean {
  if (!regla) return false;
  const peso = regla.peso_incremento ?? 0;
  const reps = regla.reps_incremento ?? 0;
  return peso > 0 || reps > 0;
}

export interface ProgressionPreviewPoint {
  semana: number;
  valor: number;
  peso_objetivo_kg?: number;
}

/** Semana 1, siguiente incremento y última semana del plan. */
export function buildProgressionPreview(
  semanas: number,
  regla: ReglaProgresion,
  base: { valor: number; peso_objetivo_kg?: number; unidad_id: number },
): ProgressionPreviewPoint[] {
  const cada = regla.cada_semanas ?? 1;
  const mid = Math.min(semanas, 1 + cada);
  const weeks = Array.from(new Set([1, mid, semanas])).sort((a, b) => a - b);

  const ejercicioBase = {
    ejercicio_id: 0,
    nombre: 'Ejemplo',
    series: 3,
    valor: base.valor,
    unidad_id: base.unidad_id,
    peso_objetivo_kg: base.peso_objetivo_kg,
    regla_progresion: regla,
  };

  return weeks.map((semana) => {
    const projected = proyectarEjercicioEnSemana(ejercicioBase, semana, 1);
    return {
      semana,
      valor: projected.valor,
      peso_objetivo_kg: projected.peso_objetivo_kg,
    };
  });
}
