import { isDiaEntreno } from '../components/userPlans/diasSemana';
import type {
  EjercicioPersonalizado,
  PlanModo,
  PlanUsuario,
  SemanaPlan,
  SesionPlan,
} from '../types';
import { MAX_RUTINA_SEMANAS, MIN_RUTINA_SEMANAS } from './routineScheduleUtils';
import { fechaLocalISO } from './trackingUtils';

export { MAX_RUTINA_SEMANAS, MIN_RUTINA_SEMANAS };

export const MIN_FRECUENCIA = 2;
export const MAX_FRECUENCIA = 7;
export const FRECUENCIA_IDEAL = 4;

/** JSON legacy con dias[] antes de la migración a sesiones[]. */
interface LegacyDiaSemana {
  dia: number;
  nombre: string;
  rutina_id: number | null;
  rutina_nombre: string;
  ejercicios_personalizados: EjercicioPersonalizado[];
}

interface LegacySemanaPlan {
  semana: number;
  dias?: LegacyDiaSemana[];
  sesiones?: SesionPlan[];
  notas?: string;
}

const cloneEjercicios = (ejercicios: SesionPlan['ejercicios_personalizados']) =>
  ejercicios.map((e) => normalizeEjercicioPersonalizado(e));

/** Normaliza ejercicio legacy (reps) → valor + unidad_id. */
export function normalizeEjercicioPersonalizado(
  e: EjercicioPersonalizado & { reps?: number },
): EjercicioPersonalizado {
  const valor = e.valor ?? e.reps ?? 1;
  const { reps: _reps, ...rest } = e;
  return {
    ...rest,
    valor,
    unidad_id: e.unidad_id ?? 1,
  };
}

export function sesionNombre(orden: number): string {
  return `Sesión ${orden}`;
}

export function clampFrecuencia(n: number): number {
  return Math.min(MAX_FRECUENCIA, Math.max(MIN_FRECUENCIA, Math.floor(n)));
}

export const createEmptySesionPlan = (orden: number): SesionPlan => ({
  orden,
  nombre: sesionNombre(orden),
  rutina_id: null,
  rutina_nombre: '',
  ejercicios_personalizados: [],
});

export function createSesionesPlan(count: number, modo: PlanModo): SesionPlan[] {
  if (modo === 'repetitiva') {
    return [createEmptySesionPlan(1)];
  }
  const n = clampFrecuencia(count);
  return Array.from({ length: n }, (_, i) => createEmptySesionPlan(i + 1));
}

export function migrateDiasToSesiones(dias: LegacyDiaSemana[], targetN: number): SesionPlan[] {
  const entrenos = dias
    .filter((d) => isDiaEntreno(d.rutina_id))
    .sort((a, b) => {
      const orderA = a.dia === 0 ? 7 : a.dia;
      const orderB = b.dia === 0 ? 7 : b.dia;
      return orderA - orderB;
    })
    .slice(0, targetN);

  if (entrenos.length === 0) {
    return createSesionesPlan(targetN, 'sesiones_variables');
  }

  return entrenos.map((d, i) => ({
    orden: i + 1,
    nombre: d.rutina_nombre || sesionNombre(i + 1),
    rutina_id: d.rutina_id,
    rutina_nombre: d.rutina_nombre,
    ejercicios_personalizados: cloneEjercicios(d.ejercicios_personalizados),
  }));
}

export function inferPlanModo(sesiones: SesionPlan[]): PlanModo {
  const withRutina = sesiones.filter((s) => s.rutina_id != null && s.rutina_id > 0);
  if (withRutina.length <= 1) return 'repetitiva';
  const ids = new Set(withRutina.map((s) => s.rutina_id));
  return ids.size === 1 ? 'repetitiva' : 'sesiones_variables';
}

export function normalizeSemanaPlan(semana: LegacySemanaPlan, targetN: number): SemanaPlan {
  if (semana.sesiones?.length) {
    return {
      semana: semana.semana,
      sesiones: semana.sesiones.map((s) => ({
        ...s,
        ejercicios_personalizados: cloneEjercicios(s.ejercicios_personalizados),
      })),
      notas: semana.notas,
    };
  }
  return {
    semana: semana.semana,
    sesiones: migrateDiasToSesiones(semana.dias ?? [], targetN),
    notas: semana.notas,
  };
}

export function normalizePlanUsuario(plan: PlanUsuario & { programacion_semanal: LegacySemanaPlan[] }): PlanUsuario {
  const dias_entrenar_semana = clampFrecuencia(plan.dias_entrenar_semana || FRECUENCIA_IDEAL);
  let programacion_semanal = plan.programacion_semanal.map((s) =>
    normalizeSemanaPlan(s, dias_entrenar_semana),
  );
  const week1 = programacion_semanal[0];
  const modo = plan.modo ?? (week1 ? inferPlanModo(week1.sesiones) : 'sesiones_variables');
  const progresion = plan.progresion ?? 'fijo';
  const fecha_inicio = plan.fecha_inicio ?? fechaLocalISO(new Date());

  const targetSemanas = Math.min(
    MAX_RUTINA_SEMANAS,
    Math.max(MIN_RUTINA_SEMANAS, plan.semanas || programacion_semanal.length || MIN_RUTINA_SEMANAS),
  );

  programacion_semanal = expandPlanSemanas(
    programacion_semanal,
    targetSemanas,
    'clone_last',
    dias_entrenar_semana,
    modo,
  );

  return {
    ...plan,
    modo,
    progresion,
    fecha_inicio,
    semanas: targetSemanas,
    dias_entrenar_semana,
    descanso_min_dias: plan.descanso_min_dias ?? 0,
    regla_progresion_global: plan.regla_progresion_global,
    programacion_semanal,
    ejercicios_personalizados: (plan.ejercicios_personalizados ?? []).map(normalizeEjercicioPersonalizado),
  };
}

export function resizeSesiones(
  sesiones: SesionPlan[],
  newCount: number,
  modo: PlanModo,
): SesionPlan[] {
  if (modo === 'repetitiva') {
    return sesiones.length > 0
      ? [{ ...sesiones[0], orden: 1, nombre: sesiones[0].nombre || sesionNombre(1) }]
      : [createEmptySesionPlan(1)];
  }
  const n = clampFrecuencia(newCount);
  const next = sesiones.map((s) => ({
    ...s,
    ejercicios_personalizados: cloneEjercicios(s.ejercicios_personalizados),
  }));
  while (next.length < n) {
    next.push(createEmptySesionPlan(next.length + 1));
  }
  return next.slice(0, n).map((s, i) => ({
    ...s,
    orden: i + 1,
    nombre: s.nombre || sesionNombre(i + 1),
  }));
}

export const createEmptySemanaPlan = (semana: number, frecuencia: number, modo: PlanModo): SemanaPlan => ({
  semana,
  sesiones: createSesionesPlan(frecuencia, modo),
});

export const cloneSemanaPlan = (source: SemanaPlan, newNum: number): SemanaPlan => ({
  semana: newNum,
  sesiones: source.sesiones.map((s) => ({
    ...s,
    ejercicios_personalizados: cloneEjercicios(s.ejercicios_personalizados),
  })),
  notas: source.notas,
});

export const expandPlanSemanas = (
  programacion: SemanaPlan[],
  target: number,
  mode: 'clone_first' | 'empty' | 'clone_last',
  frecuencia = FRECUENCIA_IDEAL,
  planModo: PlanModo = 'sesiones_variables',
): SemanaPlan[] => {
  const clamped = Math.min(MAX_RUTINA_SEMANAS, Math.max(MIN_RUTINA_SEMANAS, target));
  const next = [...programacion];

  while (next.length < clamped) {
    const newNum = next.length + 1;
    if (mode === 'empty') {
      next.push(createEmptySemanaPlan(newNum, frecuencia, planModo));
    } else if (mode === 'clone_last' && next.length > 0) {
      next.push(cloneSemanaPlan(next[next.length - 1], newNum));
    } else if (next.length > 0) {
      next.push(cloneSemanaPlan(next[0], newNum));
    } else {
      next.push(createEmptySemanaPlan(newNum, frecuencia, planModo));
    }
  }

  return next.slice(0, clamped).map((s, i) => ({ ...s, semana: i + 1 }));
};

/** Sesiones visibles según el modo del plan. */
export function sesionesForDisplay(semana: SemanaPlan, modo: PlanModo): SesionPlan[] {
  if (modo === 'repetitiva') {
    return semana.sesiones.length > 0 ? [semana.sesiones[0]] : [createEmptySesionPlan(1)];
  }
  return semana.sesiones;
}
