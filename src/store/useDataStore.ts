/**
 * Shim de compatibilidad: unidades locales + delegación a hooks de gateway
 * para rutinas/ejercicios. No persiste rutinas/ejercicios en localStorage.
 */
import { create } from 'zustand';

import { UNIDADES } from './useUnitsStore';
import type { Unidad } from '../types';

interface UnitsStore {
  unidades: Unidad[];
  addUnidad: (unidad: Omit<Unidad, 'id'>) => void;
  updateUnidad: (id: number, unidad: Partial<Unidad>) => void;
  deleteUnidad: (id: number) => void;
}

const getMaxId = (arr: Unidad[]): number =>
  arr.length > 0 ? Math.max(...arr.map((item) => item.id)) : 0;

export const useDataStore = create<UnitsStore>()((set, get) => ({
  unidades: UNIDADES,

  addUnidad: (unidad) => {
    const id = getMaxId(get().unidades) + 1;
    set((state) => ({ unidades: [...state.unidades, { ...unidad, id }] }));
  },

  updateUnidad: (id, unidad) => {
    set((state) => ({
      unidades: state.unidades.map((u) => (u.id === id ? { ...u, ...unidad } : u)),
    }));
  },

  deleteUnidad: (id) => {
    set((state) => ({ unidades: state.unidades.filter((u) => u.id !== id) }));
  },
}));
