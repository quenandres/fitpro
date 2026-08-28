import type { SesionEntrenamiento } from '../types';
import { fechaLocalISO } from '../utils/trackingUtils';
import sesionesSeed from '../data/sesiones.json';

interface SesionSeedRow {
  id: string;
  usuario_id: number;
  days_ago: number;
  rutina_id: number;
  rutina_nombre: string;
  modalidad: SesionEntrenamiento['modalidad'];
  duracion_min: number;
  series_completadas: number;
}

function normalizeSeed(rows: SesionSeedRow[]): SesionEntrenamiento[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return rows.map((row) => {
    const date = new Date(today);
    date.setDate(date.getDate() - row.days_ago);
    return {
      id: row.id,
      usuario_id: row.usuario_id,
      fecha: fechaLocalISO(date),
      rutina_id: row.rutina_id,
      rutina_nombre: row.rutina_nombre,
      modalidad: row.modalidad,
      duracion_min: row.duracion_min,
      series_completadas: row.series_completadas,
    };
  });
}

const sesiones = normalizeSeed(sesionesSeed as SesionSeedRow[]);

export function getSesionesByUsuario(usuarioId: number): SesionEntrenamiento[] {
  return sesiones
    .filter((s) => s.usuario_id === usuarioId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

export function getSesionesEnRango(
  usuarioId: number,
  desde: string,
  hasta: string,
): SesionEntrenamiento[] {
  return getSesionesByUsuario(usuarioId).filter(
    (s) => s.fecha >= desde && s.fecha <= hasta,
  );
}

export function getAllSesiones(): SesionEntrenamiento[] {
  return [...sesiones];
}
