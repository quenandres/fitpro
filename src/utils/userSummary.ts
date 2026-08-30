import type { SesionEntrenamiento } from '../types';
import { parseFechaLocal } from './trackingUtils';

export function isNivelAvanzado(nivel: string): boolean {
  return nivel.trim().toLowerCase() === 'avanzado';
}

export function formatPesoKg(peso?: number): string {
  if (peso == null || Number.isNaN(peso)) return '—';
  return `${peso} kg`;
}

/** Fecha relativa en español para la UI de tarjetas. */
export function formatFechaRelativa(fechaISO: string): string {
  const date = parseFechaLocal(fechaISO);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diffMs = today.getTime() - date.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 14) return 'Hace 1 semana';
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 60) return 'Hace 1 mes';
  return `Hace ${Math.floor(diffDays / 30)} meses`;
}

export function formatUltimoEntrenamiento(sesion: SesionEntrenamiento | null): {
  label: string;
  detalle: string;
} {
  if (!sesion) {
    return { label: 'Sin entrenamientos', detalle: 'Aún no hay sesiones registradas' };
  }
  return {
    label: formatFechaRelativa(sesion.fecha),
    detalle: sesion.rutina_nombre,
  };
}

/** Recencia para el rail de la ficha: lo primero que escanea un entrenador. */
export type RecencyTone = 'fresh' | 'warm' | 'cold' | 'none';

export function recencyToneFromSesion(sesion: SesionEntrenamiento | null): RecencyTone {
  if (!sesion) return 'none';
  const date = parseFechaLocal(sesion.fecha);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 2) return 'fresh';
  if (diffDays <= 7) return 'warm';
  return 'cold';
}

export function recencyCopy(tone: RecencyTone): string {
  if (tone === 'fresh') return 'Al día';
  if (tone === 'warm') return 'Esta semana';
  if (tone === 'cold') return 'Se enfría';
  return 'Sin rastro';
}

export const initialsOf = (nombre: string): string =>
  nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';
