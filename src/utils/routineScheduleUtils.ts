import { DIAS_SEMANA } from '../components/userPlans/diasSemana';
import type {
  DiaRutina,
  EjercicioRutina,
  RoutineFormExercise,
  Rutina,
  SemanaRutina,
} from '../types';

export const MIN_RUTINA_SEMANAS = 1;
export const MAX_RUTINA_SEMANAS = 8;

const uid = (): string =>
  `ex_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export const createEmptyDias = (): DiaRutina[] =>
  DIAS_SEMANA.map((d) => ({
    dia: d.dia,
    nombre: d.nombre,
    ejercicios: [],
  }));

export const createEmptySemana = (semana: number): SemanaRutina => ({
  semana,
  dias: createEmptyDias(),
});

export const createProgramacionSemanas = (count: number): SemanaRutina[] =>
  Array.from({ length: count }, (_, i) => createEmptySemana(i + 1));

const stripFormKeys = (ej: RoutineFormExercise): EjercicioRutina => {
  const { _key: _, ...rest } = ej;
  void _;
  return rest;
};

const withFormKeys = (ejercicios: EjercicioRutina[] | RoutineFormExercise[]): RoutineFormExercise[] =>
  ejercicios.map((ej) => {
    if ('_key' in ej && ej._key) return ej as RoutineFormExercise;
    return { ...ej, _key: uid() };
  });

const cloneEjercicios = (ejercicios: RoutineFormExercise[]): RoutineFormExercise[] =>
  ejercicios.map((ej) => ({
    ...stripFormKeys(ej),
    _key: uid(),
    grupo_superset: ej.grupo_superset,
  }));

export const cloneSemanaForm = (semana: SemanaRutina, newNum: number): SemanaRutina => ({
  semana: newNum,
  dias: semana.dias.map((d) => ({
    dia: d.dia,
    nombre: d.nombre,
    ejercicios: cloneEjercicios(withFormKeys(d.ejercicios)),
  })),
});

export const flattenSemana = (semana: SemanaRutina | undefined): EjercicioRutina[] => {
  if (!semana) return [];
  const ordered = [...semana.dias].sort((a, b) => {
    const order = (d: number) => (d === 0 ? 7 : d);
    return order(a.dia) - order(b.dia);
  });
  return ordered.flatMap((d) => d.ejercicios.map(stripFormKeys));
};

export const countDiasEntreno = (semana: SemanaRutina | undefined): number =>
  semana?.dias.filter((d) => d.ejercicios.length > 0).length ?? 0;

export const countTotalEjercicios = (programacion: SemanaRutina[]): number =>
  programacion.reduce(
    (acc, s) => acc + s.dias.reduce((dAcc, d) => dAcc + d.ejercicios.length, 0),
    0,
  );

export const hasAnyExercise = (programacion: SemanaRutina[]): boolean =>
  countTotalEjercicios(programacion) > 0;

export const semanasAreEqual = (a: SemanaRutina, b: SemanaRutina): boolean => {
  if (a.dias.length !== b.dias.length) return false;
  return a.dias.every((diaA, i) => {
    const diaB = b.dias[i];
    if (diaA.ejercicios.length !== diaB.ejercicios.length) return false;
    return diaA.ejercicios.every((ejA, j) => {
      const ejB = diaB.ejercicios[j];
      return (
        ejA.nombre === ejB.nombre &&
        ejA.series === ejB.series &&
        ejA.valor === ejB.valor &&
        ejA.unidad_id === ejB.unidad_id
      );
    });
  });
};

export const programacionHasDistinctWeeks = (programacion: SemanaRutina[]): boolean => {
  if (programacion.length <= 1) return false;
  const first = programacion[0];
  return programacion.slice(1).some((s) => !semanasAreEqual(first, s));
};

export const rutinaProgramacionToForm = (
  rutina: Pick<Rutina, 'ejercicios' | 'programacion_semanal' | 'semanas'>,
): SemanaRutina[] => {
  if (rutina.programacion_semanal?.length) {
    const semanas = rutina.semanas ?? rutina.programacion_semanal.length;
    return rutina.programacion_semanal.slice(0, semanas).map((s) => ({
      semana: s.semana,
      dias: s.dias.map((d) => ({
        dia: d.dia,
        nombre: d.nombre,
        ejercicios: withFormKeys(d.ejercicios),
      })),
    }));
  }

  const semanas = rutina.semanas ?? 1;
  const programacion = createProgramacionSemanas(semanas);
  if (rutina.ejercicios.length > 0) {
    const lunes = programacion[0].dias.find((d) => d.dia === 1);
    if (lunes) lunes.ejercicios = withFormKeys(rutina.ejercicios);
    if (semanas > 1) {
      for (let i = 1; i < semanas; i += 1) {
        programacion[i] = cloneSemanaForm(programacion[0], i + 1);
      }
    }
  }
  return programacion;
};

export const expandProgramacionToSemanas = (
  programacion: SemanaRutina[],
  target: number,
  mode: 'clone_first' | 'empty' | 'clone_last',
): SemanaRutina[] => {
  const clamped = Math.min(MAX_RUTINA_SEMANAS, Math.max(MIN_RUTINA_SEMANAS, target));
  const next = [...programacion];

  while (next.length < clamped) {
    const newNum = next.length + 1;
    if (mode === 'empty') {
      next.push(createEmptySemana(newNum));
    } else if (mode === 'clone_last' && next.length > 0) {
      next.push(cloneSemanaForm(next[next.length - 1], newNum));
    } else if (next.length > 0) {
      next.push(cloneSemanaForm(next[0], newNum));
    } else {
      next.push(createEmptySemana(newNum));
    }
  }

  return next.slice(0, clamped).map((s, i) => ({ ...s, semana: i + 1 }));
};

export const applyTemplateToProgramacion = (
  source: Pick<Rutina, 'ejercicios' | 'programacion_semanal' | 'semanas'>,
  targetSemanas: number,
): SemanaRutina[] => {
  const base = rutinaProgramacionToForm(source);
  const hasMultiWeek = (source.semanas ?? 1) > 1 || base.length > 1;

  if (hasMultiWeek) {
    return expandProgramacionToSemanas(base, targetSemanas, 'clone_last');
  }

  return expandProgramacionToSemanas(base, targetSemanas, 'clone_first');
};

export const programacionToPayload = (
  programacion: SemanaRutina[],
): { programacion_semanal: SemanaRutina[]; ejercicios: EjercicioRutina[] } => ({
  programacion_semanal: programacion.map((s) => ({
    semana: s.semana,
    dias: s.dias.map((d) => ({
      dia: d.dia,
      nombre: d.nombre,
      ejercicios: d.ejercicios.map(stripFormKeys),
    })),
  })),
  ejercicios: flattenSemana(programacion[0]),
});

export const getDiaIndexByDia = (dias: DiaRutina[], dia: number): number =>
  dias.findIndex((d) => d.dia === dia);
