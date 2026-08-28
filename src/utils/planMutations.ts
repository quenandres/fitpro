import type { DiaSemana, Rutina, SemanaPlan, Usuario } from '../types';
import { toEjercicioPersonalizado } from './distributeExercises';

export interface DiaRef {
  semana: number;
  diaIndex: number;
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

export const mapDia = (
  user: Usuario,
  ref: DiaRef,
  transform: (d: DiaSemana) => DiaSemana,
): Usuario =>
  mapSemana(user, ref.semana, (semana) => ({
    ...semana,
    dias: semana.dias.map((dia, idx) => (idx === ref.diaIndex ? transform(dia) : dia)),
  }));

export function applyRutinaToUser(user: Usuario, ref: DiaRef, rutina: Rutina): Usuario {
  return mapDia(user, ref, (d) => ({
    ...d,
    rutina_id: rutina.id,
    rutina_nombre: rutina.nombre,
    ejercicios_personalizados: rutina.ejercicios.map(toEjercicioPersonalizado),
  }));
}
