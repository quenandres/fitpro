import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Rutina, Ejercicio, Unidad } from '../types';
import rutinasData from '../data/rutinas.json';
import ejerciciosData from '../data/ejercicios.json';
import unidadesData from '../data/unidades.json';

interface DataStore {
  rutinas: Rutina[];
  ejercicios: Ejercicio[];
  unidades: Unidad[];
  addRutina: (rutina: Omit<Rutina, 'id'>) => number;
  updateRutina: (id: number, rutina: Partial<Rutina>) => void;
  deleteRutina: (id: number) => void;
  addEjercicio: (ejercicio: Omit<Ejercicio, 'id'>) => void;
  updateEjercicio: (id: number, ejercicio: Partial<Ejercicio>) => void;
  deleteEjercicio: (id: number) => void;
  addUnidad: (unidad: Omit<Unidad, 'id'>) => void;
  updateUnidad: (id: number, unidad: Partial<Unidad>) => void;
  deleteUnidad: (id: number) => void;
  exportData: () => string;
  importData: (json: string) => boolean;
  resetToDefault: () => void;
}

const getMaxId = <T extends { id: number }>(arr: T[]): number => 
  arr.length > 0 ? Math.max(...arr.map(item => item.id)) : 0;

export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      rutinas: rutinasData as Rutina[],
      ejercicios: ejerciciosData as Ejercicio[],
      unidades: unidadesData as Unidad[],

      addRutina: (rutina) => {
        const id = getMaxId(get().rutinas) + 1;
        set((state) => ({ rutinas: [...state.rutinas, { ...rutina, id }] }));
        return id;
      },

      updateRutina: (id, rutina) => {
        set((state) => ({
          rutinas: state.rutinas.map(r => r.id === id ? { ...r, ...rutina } : r)
        }));
      },

      deleteRutina: (id) => {
        set((state) => ({ rutinas: state.rutinas.filter(r => r.id !== id) }));
      },

      addEjercicio: (ejercicio) => {
        const id = getMaxId(get().ejercicios) + 1;
        set((state) => ({ ejercicios: [...state.ejercicios, { ...ejercicio, id }] }));
      },

      updateEjercicio: (id, ejercicio) => {
        set((state) => ({
          ejercicios: state.ejercicios.map(e => e.id === id ? { ...e, ...ejercicio } : e)
        }));
      },

      deleteEjercicio: (id) => {
        set((state) => ({ ejercicios: state.ejercicios.filter(e => e.id !== id) }));
      },

      addUnidad: (unidad) => {
        const id = getMaxId(get().unidades) + 1;
        set((state) => ({ unidades: [...state.unidades, { ...unidad, id }] }));
      },

      updateUnidad: (id, unidad) => {
        set((state) => ({
          unidades: state.unidades.map(u => u.id === id ? { ...u, ...unidad } : u)
        }));
      },

      deleteUnidad: (id) => {
        set((state) => ({ unidades: state.unidades.filter(u => u.id !== id) }));
      },

      exportData: () => {
        const { rutinas, ejercicios, unidades } = get();
        return JSON.stringify({ rutinas, ejercicios, unidades }, null, 2);
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          if (data.rutinas && data.ejercicios && data.unidades) {
            set({
              rutinas: data.rutinas,
              ejercicios: data.ejercicios,
              unidades: data.unidades
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      resetToDefault: () => {
        set({
          rutinas: rutinasData as Rutina[],
          ejercicios: ejerciciosData as Ejercicio[],
          unidades: unidadesData as Unidad[]
        });
      }
    }),
    { name: 'fitpro-data' }
  )
);
