import type { SesionEntrenamiento, SesionModalidad } from '../types';

export const TRACKING_MODALIDAD_COLORS: Record<SesionModalidad, string> = {
  fuerza: '#f0883e',
  isometrico: '#58a6ff',
  otro: '#22c55e',
};

export const TRACKING_MODALIDAD_LABELS: Record<SesionModalidad, string> = {
  fuerza: 'Fuerza',
  isometrico: 'Isométrico',
  otro: 'Otro',
};

export interface HeatmapCell {
  date: string;
  modalidad: SesionModalidad | null;
  sesiones: SesionEntrenamiento[];
}

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function inferModalidad(categoria: string): SesionModalidad {
  const c = categoria.toLowerCase();
  if (c.includes('isometric')) return 'isometrico';
  if (c.includes('fuerza')) return 'fuerza';
  return 'otro';
}

export function fechaLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseFechaLocal(fecha: string): Date {
  return new Date(`${fecha}T12:00:00`);
}

export function groupByFecha(
  sesiones: SesionEntrenamiento[],
): Map<string, SesionEntrenamiento[]> {
  const map = new Map<string, SesionEntrenamiento[]>();
  for (const s of sesiones) {
    const list = map.get(s.fecha) ?? [];
    list.push(s);
    map.set(s.fecha, list);
  }
  return map;
}

export function dominantModalidad(daySessions: SesionEntrenamiento[]): SesionModalidad {
  const totals: Record<SesionModalidad, number> = {
    fuerza: 0,
    isometrico: 0,
    otro: 0,
  };
  for (const s of daySessions) {
    totals[s.modalidad] += s.series_completadas;
  }
  let best: SesionModalidad = daySessions[0]?.modalidad ?? 'otro';
  let bestVal = -1;
  for (const mod of ['fuerza', 'isometrico', 'otro'] as const) {
    if (totals[mod] > bestVal) {
      bestVal = totals[mod];
      best = mod;
    }
  }
  return best;
}

export function countByModalidad(
  sesiones: SesionEntrenamiento[],
): Record<SesionModalidad, number> {
  const counts: Record<SesionModalidad, number> = {
    fuerza: 0,
    isometrico: 0,
    otro: 0,
  };
  for (const s of sesiones) {
    counts[s.modalidad] += 1;
  }
  return counts;
}

export function calcStreak(sesiones: SesionEntrenamiento[], today = new Date()): number {
  const dates = new Set(sesiones.map((s) => s.fecha));
  if (dates.size === 0) return 0;

  let streak = 0;
  const cursor = new Date(today);
  cursor.setHours(12, 0, 0, 0);

  const hasSession = (d: Date) => dates.has(fechaLocalISO(d));

  if (!hasSession(cursor)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (hasSession(cursor)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/** Filas Lun–Dom, columnas semanas (más antigua → más reciente). */
export function buildHeatmapCells(
  sesiones: SesionEntrenamiento[],
  weeks: number,
  endDate = new Date(),
): HeatmapCell[][] {
  const byDate = groupByFecha(sesiones);
  const end = new Date(endDate);
  end.setHours(12, 0, 0, 0);

  const start = new Date(end);
  start.setDate(start.getDate() - weeks * 7 + 1);

  const grid: HeatmapCell[][] = Array.from({ length: 7 }, () => []);

  const cursor = new Date(start);
  while (cursor <= end) {
    const jsDay = cursor.getDay();
    const rowIndex = jsDay === 0 ? 6 : jsDay - 1;
    const fecha = fechaLocalISO(cursor);
    const daySessions = byDate.get(fecha) ?? [];
    grid[rowIndex].push({
      date: fecha,
      modalidad: daySessions.length > 0 ? dominantModalidad(daySessions) : null,
      sesiones: daySessions,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return grid;
}

export function getHeatmapDayLabels(): readonly string[] {
  return DAY_LABELS;
}

export function formatSessionTooltip(sesiones: SesionEntrenamiento[]): string {
  if (sesiones.length === 0) return '';
  const fecha = parseFechaLocal(sesiones[0].fecha);
  const dateLabel = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
  }).format(fecha);

  return sesiones
    .map((s) => {
      const mod = TRACKING_MODALIDAD_LABELS[s.modalidad];
      return `${dateLabel} · ${s.rutina_nombre} · ${s.duracion_min} min · ${mod}`;
    })
    .join('\n');
}

export function formatSessionDate(fecha: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parseFechaLocal(fecha));
}

export function filterSesionesEnRango(
  sesiones: SesionEntrenamiento[],
  desde: string,
  hasta: string,
): SesionEntrenamiento[] {
  return sesiones.filter((s) => s.fecha >= desde && s.fecha <= hasta);
}

export function getRangoUltimasSemanas(semanas: number, endDate = new Date()): {
  desde: string;
  hasta: string;
} {
  const end = new Date(endDate);
  end.setHours(12, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - semanas * 7);
  return { desde: fechaLocalISO(start), hasta: fechaLocalISO(end) };
}
