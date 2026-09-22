import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EjercicioEjecutado, SesionEntrenamiento } from '../types';
import sesionesSeed from '../data/sesiones.json';
import rutinasData from '../data/rutinas.json';
import ejerciciosData from '../data/ejercicios.json';
import { fechaLocalISO } from '../utils/trackingUtils';
import { migrateRutinasWithExerciseIds } from '../utils/migrateExerciseIds';
import type { Rutina } from '../types';
import {
  buildSesionEntrenamiento,
  contarSeriesCompletadas,
  generarSeriesMock,
} from '../utils/sessionSetUtils';

/** Mock local — sustituir por gateway/TanStack Query en Fase 4. */

interface SesionSeedRow {
  id: string;
  usuario_id: number;
  days_ago: number;
  rutina_id: number;
  rutina_nombre: string;
  modalidad: SesionEntrenamiento['modalidad'];
  duracion_min: number;
  series_completadas: number;
  sesion_orden?: number;
  ejercicios?: EjercicioEjecutado[];
}

const seedMigration = migrateRutinasWithExerciseIds(
  rutinasData as Rutina[],
  ejerciciosData as import('../types').Ejercicio[],
);

const rutinasById = new Map(seedMigration.rutinas.map((r) => [r.id, r]));

function buildMockEjerciciosFromRutina(
  rutinaId: number,
  seriesCompletadas: number,
): EjercicioEjecutado[] {
  const rutina = rutinasById.get(rutinaId);
  if (!rutina) return [];

  const plannedTotal = rutina.ejercicios.reduce((acc, e) => acc + e.series, 0);
  const ratio = plannedTotal > 0 ? Math.min(1, seriesCompletadas / plannedTotal) : 1;

  return rutina.ejercicios.map((e) => {
    const seriesCount = Math.max(1, Math.round(e.series * ratio));
    const pesoBase = e.unidad_id === 1 ? 40 + e.ejercicio_id * 2 : 0;
    return {
      ejercicio_id: e.ejercicio_id,
      nombre: e.nombre,
      unidad_id: e.unidad_id,
      series: generarSeriesMock(seriesCount, e.valor, e.unidad_id, pesoBase),
    };
  });
}

function normalizeSeed(rows: SesionSeedRow[]): SesionEntrenamiento[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return rows.map((row) => {
    const date = new Date(today);
    date.setDate(date.getDate() - row.days_ago);

    const ejercicios =
      row.ejercicios ??
      buildMockEjerciciosFromRutina(row.rutina_id, row.series_completadas);

    return buildSesionEntrenamiento({
      id: row.id,
      usuario_id: row.usuario_id,
      fecha: fechaLocalISO(date),
      rutina_id: row.rutina_id,
      rutina_nombre: row.rutina_nombre,
      modalidad: row.modalidad,
      duracion_min: row.duracion_min,
      sesion_orden: row.sesion_orden,
      ejercicios,
    });
  });
}

interface SesionesStore {
  sesiones: SesionEntrenamiento[];
  addSesion: (sesion: Omit<SesionEntrenamiento, 'series_completadas'>) => void;
  getSesionById: (id: string) => SesionEntrenamiento | undefined;
}

const initialSesiones = normalizeSeed(sesionesSeed as SesionSeedRow[]);

export const useSesionesStore = create<SesionesStore>()(
  persist(
    (set, get) => ({
      sesiones: initialSesiones,

      addSesion: (sesion) => {
        const complete = buildSesionEntrenamiento({
          ...sesion,
          ejercicios: sesion.ejercicios,
        });
        set((state) => ({
          sesiones: [complete, ...state.sesiones],
        }));
      },

      getSesionById: (id) => get().sesiones.find((s) => s.id === id),
    }),
    {
      name: 'fitpro-sesiones',
      merge: (persisted, current) => {
        const p = persisted as Partial<SesionesStore> | undefined;
        if (!p?.sesiones?.length) return current;
        const enriched = p.sesiones.map((s) => {
          if (s.ejercicios?.length) return s;
          return buildSesionEntrenamiento({
            ...s,
            ejercicios: buildMockEjerciciosFromRutina(s.rutina_id, s.series_completadas),
          });
        });
        return { ...current, sesiones: enriched };
      },
    },
  ),
);

export function getSesionesByUsuario(usuarioId: number): SesionEntrenamiento[] {
  return useSesionesStore
    .getState()
    .sesiones.filter((s) => s.usuario_id === usuarioId)
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
  return [...useSesionesStore.getState().sesiones];
}

export function getUltimaSesion(usuarioId: number): SesionEntrenamiento | null {
  const list = getSesionesByUsuario(usuarioId);
  return list[0] ?? null;
}

export function getSesionById(id: string): SesionEntrenamiento | undefined {
  return useSesionesStore.getState().getSesionById(id);
}

export { contarSeriesCompletadas };
