import type { Rutina, SemanaPlan, SesionPlan, Usuario } from '../types';
import { toEjercicioPersonalizado } from './distributeExercises';

export interface SesionRef {
  semana: number;
  sesionIndex: number;
}

export const mapSemana = (
  user: Usuario,
  semanaNum: number,
  transform: (s: SemanaPlan) => SemanaPlan,
): Usuario => ({
  ...user,
  plan: {
    ...user.plan,
    programacion_semanal: user.plan.programacion_semanal.map((s) =>
      s.semana === semanaNum ? transform(s) : s,
    ),
  },
});

export const mapSesion = (
  user: Usuario,
  ref: SesionRef,
  transform: (s: SesionPlan) => SesionPlan,
): Usuario =>
  mapSemana(user, ref.semana, (semana) => ({
    ...semana,
    sesiones: semana.sesiones.map((sesion, idx) =>
      idx === ref.sesionIndex ? transform(sesion) : sesion,
    ),
  }));

export function applyRutinaToUser(user: Usuario, ref: SesionRef, rutina: Rutina): Usuario {
  return mapSesion(user, ref, (s) => ({
    ...s,
    rutina_id: rutina.id,
    rutina_nombre: rutina.nombre,
    ejercicios_personalizados: rutina.ejercicios.map(toEjercicioPersonalizado),
  }));
}
