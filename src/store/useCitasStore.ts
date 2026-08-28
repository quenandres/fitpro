import { create } from 'zustand';
import type { Cita } from '../types';

interface CitasStore {
  citas: Cita[];
  addCita: (cita: Omit<Cita, 'id'>) => void;
  addCitas: (citas: Omit<Cita, 'id'>[]) => void;
  deleteCita: (id: number) => void;
}

let nextId = 1;

export const useCitasStore = create<CitasStore>((set) => ({
  citas: [],

  addCita: (cita) => {
    const id = nextId++;
    set((state) => ({ citas: [...state.citas, { ...cita, id }] }));
  },

  addCitas: (citas) => {
    set((state) => {
      const created = citas.map((cita) => ({ ...cita, id: nextId++ }));
      return { citas: [...state.citas, ...created] };
    });
  },

  deleteCita: (id) => {
    set((state) => ({ citas: state.citas.filter((c) => c.id !== id) }));
  },
}));
