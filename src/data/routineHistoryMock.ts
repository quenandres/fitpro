export type MesocicloEstado = 'completado' | 'archivado' | 'borrador';

export interface MesocicloMetricaImpacto {
  icon: 'trending' | 'scale' | 'check';
  label: string;
  value: string;
}

export interface MesocicloHistorial {
  id: string;
  nombreBloque: string;
  codigo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: MesocicloEstado;
  duracionSemanas: number;
  frecuenciaDiasSemana: number;
  volumenKg: number;
  rpePromedio: number;
  adherenciaPct: number;
  sesionesCompletadas: number;
  sesionesTotales: number;
  rutinaId: number | null;
  metricas: MesocicloMetricaImpacto[];
}

const BLOQUES_BASE: ReadonlyArray<{
  nombreBloque: string;
  duracionSemanas: number;
  frecuenciaDiasSemana: number;
  metricas: MesocicloMetricaImpacto[];
}> = [
  {
    nombreBloque: 'Hipertrofia Metabólica & Myo-reps',
    duracionSemanas: 8,
    frecuenciaDiasSemana: 4,
    metricas: [
      { icon: 'trending', label: 'Progreso de carga', value: '+6.2% en compuestos' },
      { icon: 'check', label: 'Adherencia final', value: '98% de sesiones' },
    ],
  },
  {
    nombreBloque: 'Reentrenamiento post-lesión (GZCLP)',
    duracionSemanas: 8,
    frecuenciaDiasSemana: 3,
    metricas: [
      { icon: 'scale', label: 'Control de carga', value: 'RIR ≥ 2 respetado' },
      { icon: 'check', label: 'Adherencia final', value: '92% de sesiones' },
    ],
  },
  {
    nombreBloque: 'Fundamentos de fuerza base y GPP',
    duracionSemanas: 8,
    frecuenciaDiasSemana: 4,
    metricas: [
      { icon: 'trending', label: 'Calibración basal', value: 'Línea base establecida' },
      { icon: 'check', label: 'Adherencia final', value: '95% de sesiones' },
    ],
  },
];

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Historial de mesociclos por cliente — dato de presentación (mock), no
 * persistido ni parte del modelo real de `PlanUsuario`/`Rutina`.
 * Determinista por `usuarioId` para que la UI no "salte" entre renders.
 */
export function buildMockMesociclos(usuarioId: number, rutinaIds: number[]): MesocicloHistorial[] {
  const seedFecha = '2024-03-01';
  let cursor = seedFecha;

  return BLOQUES_BASE.map((bloque, i) => {
    const fechaInicio = cursor;
    const fechaFin = addDays(fechaInicio, bloque.duracionSemanas * 7 - 7);
    cursor = addDays(fechaFin, 21);

    const sesionesTotales = bloque.duracionSemanas * bloque.frecuenciaDiasSemana;
    const adherenciaPct = 92 + ((usuarioId + i) % 7);
    const sesionesCompletadas = Math.round((sesionesTotales * adherenciaPct) / 100);

    return {
      id: `meso-${usuarioId}-${i + 1}`,
      nombreBloque: bloque.nombreBloque,
      codigo: `MESO-${usuarioId}-${String(i + 1).padStart(2, '0')}`,
      fechaInicio,
      fechaFin,
      estado: 'completado',
      duracionSemanas: bloque.duracionSemanas,
      frecuenciaDiasSemana: bloque.frecuenciaDiasSemana,
      volumenKg: 90000 + ((usuarioId * 37 + i * 4111) % 90000),
      rpePromedio: 7.2 + ((usuarioId + i) % 4) * 0.3,
      adherenciaPct,
      sesionesCompletadas,
      sesionesTotales,
      rutinaId: rutinaIds[i % Math.max(1, rutinaIds.length)] ?? null,
      metricas: bloque.metricas,
    };
  });
}
