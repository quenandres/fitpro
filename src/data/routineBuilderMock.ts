import type { RoutineFormLevel } from '../types';

export const PROMPT_MODIFIER_CHIPS = [
  { id: 'lesion', label: 'Lesión / restricción articular', text: 'Tener en cuenta lesión o restricción articular: ' },
  { id: 'home', label: 'Equipamiento limitado', text: 'Solo home gym con mancuernas y bandas. ' },
  { id: 'rpe', label: 'Enfoque RPE / RIR', text: 'Prescribir con RPE/RIR estricto en compuestos. ', levels: ['avanzada'] as RoutineFormLevel[] },
  { id: 'freq4', label: 'Frecuencia 4 días/sem', text: '4 días de entrenamiento por semana. ' },
  { id: 'concurrent', label: 'Resistencia concurrente', text: 'Atleta con entrenamiento de resistencia concurrente. ' },
] as const;

export const AI_SYNTHESIS_MODES = [
  {
    id: 'volume',
    title: 'Optimización de volumen',
    desc: 'Maximizar series efectivas dentro del volumen recuperable (MRV).',
    prefix: '[Enfoque hipertrofia / volumen MRV] ',
  },
  {
    id: 'dup',
    title: 'Periodización ondulatoria',
    desc: 'Alternar estímulo neural y metabólico por sesión.',
    prefix: '[DUP — alternancia neural/metabólica] ',
  },
  {
    id: 'strength',
    title: 'Fuerza neural máxima',
    desc: 'Intensidades altas y densidad controlada.',
    prefix: '[Fuerza — intensidad >82% 1RM donde aplique] ',
  },
] as const;

export const AI_PROMPT_TEMPLATES = [
  { id: 'ul4', label: 'Torso/Pierna 4 días', text: 'Torso/pierna 4 días, hipertrofia, 45–60 min por sesión.' },
  { id: 'recomp', label: 'Recomposición avanzada', text: 'Recomposición corporal, 4 días, déficit moderado, priorizar compuestos.' },
  { id: 'sport', label: 'Pretemporada deportiva', text: 'Pretemporada: fuerza + potencia, 3–4 días, sin fatiga excesiva de rodilla.' },
] as const;

export const MOCK_PROGRESSION_WEEKS = [
  { week: 1, label: 'S1', rpe: '7.5', note: 'Acumulación' },
  { week: 2, label: 'S2', rpe: '8.0', note: 'Acumulación' },
  { week: 3, label: 'S3', rpe: '8.0', note: 'Acumulación' },
  { week: 4, label: 'S4', rpe: '6.0', note: 'Descarga' },
  { week: 5, label: 'S5', rpe: '8.5', note: 'Intensificación' },
  { week: 6, label: 'S6', rpe: '9.0', note: 'Intensificación' },
  { week: 7, label: 'S7', rpe: '9.0', note: 'Intensificación' },
  { week: 8, label: 'S8', rpe: '—', note: 'Test' },
] as const;

export const PRESET_GOAL_CHIPS = [
  { id: 'all', label: 'Todas' },
  { id: 'hipertrofia', label: 'Hipertrofia', match: ['hipertrofia', 'hypertrophy', 'volumen'] },
  { id: 'fuerza', label: 'Fuerza máxima', match: ['fuerza', 'strength', 'power'] },
  { id: 'acond', label: 'Acondicionamiento', match: ['cardio', 'hiit', 'hyrox', 'resistencia'] },
  { id: 'calistenia', label: 'Calistenia', match: ['calistenia', 'funcional', 'movilidad'] },
] as const;

export type MockSetRowType = 'calentamiento' | 'efectiva' | 'top' | 'backoff';

export interface MockSetRow {
  index: number;
  tipo: MockSetRowType;
  cargaKg: number;
  reps: number;
  rpe?: number;
  rir?: number;
  tempo: string;
  descansoSec: number;
}

/** Filas de vista previa por serie — no se persisten; reflejan series/valor/rpe del ejercicio. */
export function buildMockSetRows(
  series: number,
  valor: number,
  rpe?: number,
  restSec = 120,
): MockSetRow[] {
  const rows: MockSetRow[] = [];
  const warmupReps = Math.min(12, Math.max(8, Math.round(valor * 1.2)));
  if (series >= 1) {
    rows.push({
      index: 1,
      tipo: 'calentamiento',
      cargaKg: Math.round(valor * 0.5 * 10) / 10,
      reps: warmupReps,
      rpe: 6,
      tempo: '3-0-1-0',
      descansoSec: 90,
    });
  }
  for (let i = 2; i <= series; i++) {
    const isTop = i === series && series >= 3;
    const isBackoff = i === series && series >= 4;
    rows.push({
      index: i,
      tipo: isBackoff ? 'backoff' : isTop ? 'top' : 'efectiva',
      cargaKg: Math.round(valor * (isBackoff ? 0.85 : isTop ? 1 : 0.92) * 10) / 10,
      reps: isTop ? Math.max(4, valor - 2) : valor,
      rpe: rpe ?? (isTop ? 8.5 : 8),
      rir: isTop ? 1 : 2,
      tempo: '3-0-1-0',
      descansoSec: isTop ? 180 : restSec,
    });
  }
  return rows;
}

export function rowsToExercisePatch(rows: MockSetRow[]): {
  series: number;
  valor: number;
  rpe?: number;
} {
  if (rows.length === 0) return { series: 1, valor: 8 };
  const working = rows.filter((r) => r.tipo !== 'calentamiento');
  const ref =
    working.find((r) => r.tipo === 'top') ??
    working[working.length - 1] ??
    rows[rows.length - 1];
  return {
    series: rows.length,
    valor: Math.max(1, Math.round(ref.reps)),
    rpe: ref.rpe,
  };
}

export function reindexMockRows(rows: MockSetRow[]): MockSetRow[] {
  return rows.map((r, i) => ({ ...r, index: i + 1 }));
}

export function appendMockSetRow(rows: MockSetRow[], restSec: number): MockSetRow[] {
  const last = rows[rows.length - 1];
  const next: MockSetRow = {
    index: rows.length + 1,
    tipo: 'efectiva',
    cargaKg: last ? Math.round(last.cargaKg * 0.95 * 10) / 10 : 40,
    reps: last?.reps ?? 8,
    rpe: last?.rpe ?? 8,
    rir: 2,
    tempo: last?.tempo ?? '3-0-1-0',
    descansoSec: restSec,
  };
  return reindexMockRows([...rows, next]);
}
