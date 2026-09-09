import { getSesionesEnRango } from '../store/useSesionesStore';
import type { PlanUsuario } from '../types';

export interface SemanaPlanRange {
  desde: string;
  hasta: string;
}

/** Rango de fechas ISO (inclusive) de la semana N del plan (1-indexed). */
export function getSemanaPlanRange(fechaInicio: string, semana: number): SemanaPlanRange {
  const start = new Date(`${fechaInicio}T12:00:00`);
  start.setDate(start.getDate() + (semana - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return { desde: fmt(start), hasta: fmt(end) };
}

/** Semana bloqueada = tiene ≥1 sesión completada del usuario en ese rango. */
export function isSemanaBloqueada(
  userId: number,
  plan: PlanUsuario,
  semana: number,
): boolean {
  const fechaInicio = plan.fecha_inicio;
  if (!fechaInicio) return false;
  const { desde, hasta } = getSemanaPlanRange(fechaInicio, semana);
  return getSesionesEnRango(userId, desde, hasta).length > 0;
}

/** Semanas del plan que pueden editarse (no completadas). */
export function getSemanasEditables(userId: number, plan: PlanUsuario): number[] {
  return Array.from({ length: plan.semanas }, (_, i) => i + 1).filter(
    (semana) => !isSemanaBloqueada(userId, plan, semana),
  );
}

export function countSemanasEditables(userId: number, plan: PlanUsuario): number {
  return getSemanasEditables(userId, plan).length;
}
