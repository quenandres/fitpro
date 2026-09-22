import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Rutina, Ejercicio, Unidad } from '../types';
import rutinasData from '../data/rutinas.json';
import ejerciciosData from '../data/ejercicios.json';
import unidadesData from '../data/unidades.json';
import { migrateRutinasWithExerciseIds } from '../utils/migrateExerciseIds';

interface DataStore {
  rutinas: Rutina[];
  ejercicios: Ejercicio[];
  unidades: Unidad[];
  addRutina: (rutina: Omit<Rutina, 'id'>) => number;
  updateRutina: (id: number, rutina: Partial<Rutina>) => void;
  deleteRutina: (id: number) => void;
  addEjercicio: (ejercicio: Omit<Ejercicio, 'id'>) => number;
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

const seedMigration = migrateRutinasWithExerciseIds(
  rutinasData as Rutina[],
  ejerciciosData as Ejercicio[],
);

export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      rutinas: seedMigration.rutinas,
      ejercicios: seedMigration.ejercicios,
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
        return id;
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
            const migrated = migrateRutinasWithExerciseIds(
              data.rutinas as Rutina[],
              data.ejercicios as Ejercicio[],
            );
            set({
              rutinas: migrated.rutinas,
              ejercicios: migrated.ejercicios,
              unidades: data.unidades,
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      resetToDefault: () => {
        const migrated = migrateRutinasWithExerciseIds(
          rutinasData as Rutina[],
          ejerciciosData as Ejercicio[],
        );
        set({
          rutinas: migrated.rutinas,
          ejercicios: migrated.ejercicios,
          unidades: unidadesData as Unidad[],
        });
      },
    }),
    {
      name: 'fitpro-data',
      merge: (persisted, current) => {
        const p = persisted as Partial<DataStore> | undefined;
        if (!p?.rutinas || !p?.ejercicios) return current;
        const migrated = migrateRutinasWithExerciseIds(p.rutinas, p.ejercicios);
        return {
          ...current,
          ...p,
          rutinas: migrated.rutinas,
          ejercicios: migrated.ejercicios,
          unidades: p.unidades ?? current.unidades,
        };
      },
    },
  ),
);
