import { getSesionesEnRango } from '../store/useSesionesStore';
import { getPeriodRange } from './trackingUtils';

export interface WeeklyCompliance {
  completadas: number;
  objetivo: number;
  porcentaje: number;
  fechas: string[];
}

export function getWeeklyCompliance(
  usuarioId: number,
  objetivo: number,
  anchorDate: Date = new Date(),
): WeeklyCompliance {
  const range = getPeriodRange('semana', anchorDate);
  const sesiones = getSesionesEnRango(usuarioId, range.desde, range.hasta);
  const fechas = [...new Set(sesiones.map((s) => s.fecha))].sort();
  const completadas = fechas.length;
  const porcentaje = objetivo > 0 ? Math.min(100, Math.round((completadas / objetivo) * 100)) : 0;

  return { completadas, objetivo, porcentaje, fechas };
}

export function complianceTone(porcentaje: number): 'complete' | 'partial' | 'empty' {
  if (porcentaje >= 100) return 'complete';
  if (porcentaje > 0) return 'partial';
  return 'empty';
}
