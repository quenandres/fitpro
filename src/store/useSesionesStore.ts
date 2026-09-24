import { create } from 'zustand';
import type { SesionEntrenamiento } from '../types';

interface SesionesStore {
  sesiones: SesionEntrenamiento[];
  hydrated: boolean;
  replaceSesiones: (sesiones: SesionEntrenamiento[]) => void;
  getSesionById: (id: string) => SesionEntrenamiento | undefined;
}

export const useSesionesStore = create<SesionesStore>((set, get) => ({
  sesiones: [],
  hydrated: false,

  replaceSesiones: (sesiones) => {
    set({ sesiones, hydrated: true });
  },

  getSesionById: (id) => get().sesiones.find((s) => s.id === id),
}));

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
