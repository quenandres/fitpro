import type {
  EjercicioPersonalizado,
  PlanUsuario,
  ReglaProgresion,
  SemanaPlan,
  SesionPlan,
} from '../types';
import type { SesionPersonalizadaPayload } from './sesionPlanUtils';
import type { SesionRef } from './planMutations';
import { getSemanasEditables, isSemanaBloqueada } from './planWeekUtils';
import { normalizeEjercicioPersonalizado } from './planScheduleUtils';

/** unidades.json — kilogramos */
export const UNIDAD_KG = 6;
/** unidades.json — repeticiones */
export const UNIDAD_REPS = 1;

const cloneEjercicios = (ejercicios: EjercicioPersonalizado[]) =>
  ejercicios.map((e) => normalizeEjercicioPersonalizado({ ...e }));

function applySesionPatch(
  sesion: SesionPlan,
  draft: SesionPersonalizadaPayload,
): SesionPlan {
  const nombre = draft.nombre.trim();
  const fromLibrary = sesion.rutina_id != null && sesion.rutina_id > 0;
  return {
    ...sesion,
    nombre: nombre || sesion.nombre,
    rutina_id: fromLibrary ? sesion.rutina_id : 0,
    rutina_nombre: nombre || sesion.rutina_nombre || 'Rutina personalizada',
    ejercicios_personalizados: cloneEjercicios(draft.ejercicios),
  };
}

export function calcularValorProgresivo(
  valorBase: number,
  unidadId: number,
  regla: ReglaProgresion | undefined,
  semanaNum: number,
  semanaBase: number,
): number {
  if (!regla || semanaNum <= semanaBase) return valorBase;
  const cada = regla.cada_semanas ?? 1;
  const steps = Math.floor((semanaNum - semanaBase) / cada);
  if (steps <= 0) return valorBase;

  let incremento = 0;
  if (unidadId === UNIDAD_KG && regla.peso_incremento != null) {
    incremento = regla.peso_incremento;
  } else if (unidadId === UNIDAD_REPS && regla.reps_incremento != null) {
    incremento = regla.reps_incremento;
  } else if (regla.peso_incremento != null) {
    incremento = regla.peso_incremento;
  } else if (regla.reps_incremento != null) {
    incremento = regla.reps_incremento;
  }

  if (incremento === 0) return valorBase;
  const raw = valorBase + steps * incremento;
  return unidadId === UNIDAD_KG
    ? Math.round(raw * 10) / 10
    : Math.round(raw);
}

function calcularPesoProgresivo(
  pesoBase: number,
  regla: ReglaProgresion | undefined,
  semanaNum: number,
  semanaBase: number,
): number {
  if (!regla?.peso_incremento || semanaNum <= semanaBase) return pesoBase;
  const cada = regla.cada_semanas ?? 1;
  const steps = Math.floor((semanaNum - semanaBase) / cada);
  if (steps <= 0) return pesoBase;
  return Math.round((pesoBase + steps * regla.peso_incremento) * 10) / 10;
}

export function proyectarEjercicioEnSemana(
  base: EjercicioPersonalizado,
  semanaNum: number,
  semanaBase: number,
): EjercicioPersonalizado {
  const regla = base.regla_progresion;
  const valor =
    base.unidad_id === UNIDAD_REPS
      ? calcularValorProgresivo(base.valor, UNIDAD_REPS, regla, semanaNum, semanaBase)
      : calcularValorProgresivo(base.valor, base.unidad_id, regla, semanaNum, semanaBase);

  const peso_objetivo_kg =
    base.peso_objetivo_kg != null
      ? calcularPesoProgresivo(base.peso_objetivo_kg, regla, semanaNum, semanaBase)
      : base.peso_objetivo_kg;

  return normalizeEjercicioPersonalizado({ ...base, valor, peso_objetivo_kg });
}

export function recalcularSesionIncremental(
  baseEjercicios: EjercicioPersonalizado[],
  semanaNum: number,
  semanaBase: number,
): EjercicioPersonalizado[] {
  if (semanaNum === semanaBase) return cloneEjercicios(baseEjercicios);
  return baseEjercicios.map((e) => proyectarEjercicioEnSemana(e, semanaNum, semanaBase));
}

export function recalcularPlanIncremental(
  programacion: SemanaPlan[],
  ref: SesionRef,
  draft: SesionPersonalizadaPayload,
): SemanaPlan[] {
  const semanaBase = ref.semana;
  const baseEjercicios = cloneEjercicios(draft.ejercicios);

  return programacion.map((semanaPlan) => {
    if (semanaPlan.semana < semanaBase) return semanaPlan;
    if (semanaPlan.semana === semanaBase) {
      return {
        ...semanaPlan,
        sesiones: semanaPlan.sesiones.map((s, idx) =>
          idx === ref.sesionIndex ? applySesionPatch(s, draft) : s,
        ),
      };
    }
    return {
      ...semanaPlan,
      sesiones: semanaPlan.sesiones.map((s, idx) => {
        if (idx !== ref.sesionIndex) return s;
        const ejercicios = recalcularSesionIncremental(
          baseEjercicios,
          semanaPlan.semana,
          semanaBase,
        );
        const nombre = draft.nombre.trim();
        const fromLibrary = s.rutina_id != null && s.rutina_id > 0;
        return {
          ...s,
          nombre: nombre || s.nombre,
          rutina_id: fromLibrary ? s.rutina_id : 0,
          rutina_nombre: nombre || s.rutina_nombre || 'Rutina personalizada',
          ejercicios_personalizados: ejercicios,
        };
      }),
    };
  });
}

export function propagarSesionFija(
  programacion: SemanaPlan[],
  ref: SesionRef,
  draft: SesionPersonalizadaPayload,
  semanasEditables: number[],
): SemanaPlan[] {
  const editableSet = new Set(semanasEditables);
  return programacion.map((semanaPlan) => {
    if (!editableSet.has(semanaPlan.semana)) return semanaPlan;
    return {
      ...semanaPlan,
      sesiones: semanaPlan.sesiones.map((s, idx) =>
        idx === ref.sesionIndex ? applySesionPatch(s, draft) : s,
      ),
    };
  });
}

export function aplicarRutinaEnSemanasEditables(
  programacion: SemanaPlan[],
  ref: SesionRef,
  patchSesion: (sesion: SesionPlan) => SesionPlan,
  semanasEditables: number[],
  desdeSemana = ref.semana,
): SemanaPlan[] {
  const editableSet = new Set(semanasEditables);
  return programacion.map((semanaPlan) => {
    if (semanaPlan.semana < desdeSemana) return semanaPlan;
    if (!editableSet.has(semanaPlan.semana)) return semanaPlan;
    return {
      ...semanaPlan,
      sesiones: semanaPlan.sesiones.map((s, idx) =>
        idx === ref.sesionIndex ? patchSesion(s) : s,
      ),
    };
  });
}

export function applySaveSesionPersonalizada(
  userId: number,
  plan: PlanUsuario,
  ref: SesionRef,
  draft: SesionPersonalizadaPayload,
): PlanUsuario {
  const blocked = new Set(
    Array.from({ length: plan.semanas }, (_, i) => i + 1).filter((s) =>
      isSemanaBloqueada(userId, plan, s),
    ),
  );

  let programacion =
    plan.progresion === 'incremental'
      ? recalcularPlanIncremental(plan.programacion_semanal, ref, draft)
      : propagarSesionFija(
          plan.programacion_semanal,
          ref,
          draft,
          getSemanasEditables(userId, plan),
        );

  programacion = programacion.map((s) =>
    blocked.has(s.semana)
      ? (plan.programacion_semanal.find((orig) => orig.semana === s.semana) ?? s)
      : s,
  );

  return { ...plan, programacion_semanal: programacion };
}

/** Al cambiar a incremental: recalcular desde semana 1 editable. */
export function recalcularPlanCompletoIncremental(
  userId: number,
  plan: PlanUsuario,
): PlanUsuario {
  const editables = getSemanasEditables(userId, plan);
  if (editables.length === 0) return plan;

  const semanaBase = Math.min(...editables);
  const weekPlan = plan.programacion_semanal.find((s) => s.semana === semanaBase);
  if (!weekPlan) return plan;

  let programacion = [...plan.programacion_semanal];
  for (let slotIndex = 0; slotIndex < weekPlan.sesiones.length; slotIndex++) {
    const sesion = weekPlan.sesiones[slotIndex];
    if (sesion.ejercicios_personalizados.length === 0) continue;
    const ref: SesionRef = { semana: semanaBase, sesionIndex: slotIndex };
    const draft: SesionPersonalizadaPayload = {
      nombre: sesion.nombre || sesion.rutina_nombre,
      ejercicios: sesion.ejercicios_personalizados,
    };
    programacion = recalcularPlanIncremental(programacion, ref, draft).map((s) =>
      editables.includes(s.semana)
        ? s
        : plan.programacion_semanal.find((orig) => orig.semana === s.semana) ?? s,
    );
  }

  return { ...plan, programacion_semanal: programacion };
}

/** Al cambiar a fijo: copiar semana 1 a semanas editables restantes. */
export function unificarPlanFijo(userId: number, plan: PlanUsuario): PlanUsuario {
  const week1 = plan.programacion_semanal.find((s) => s.semana === 1);
  if (!week1) return plan;
  const editables = getSemanasEditables(userId, plan).filter((s) => s !== 1);
  if (editables.length === 0) return plan;

  let programacion = [...plan.programacion_semanal];
  week1.sesiones.forEach((sesionBase, slotIndex) => {
    if (sesionBase.ejercicios_personalizados.length === 0) return;
    const draft: SesionPersonalizadaPayload = {
      nombre: sesionBase.nombre || sesionBase.rutina_nombre,
      ejercicios: sesionBase.ejercicios_personalizados,
    };
    programacion = propagarSesionFija(
      programacion,
      { semana: 1, sesionIndex: slotIndex },
      draft,
      editables,
    );
  });

  return { ...plan, programacion_semanal: programacion };
}
