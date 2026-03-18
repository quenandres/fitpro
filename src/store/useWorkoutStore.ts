import { create } from 'zustand';
import type { Rutina, WorkoutState } from '../types';

interface WorkoutStore extends WorkoutState {
  iniciarWorkout: (rutina: Rutina) => void;
  completarSerie: () => void;
  siguienteEjercicio: () => void;
  ejercicioAnterior: () => void;
  togglePausa: () => void;
  reiniciar: () => void;
  terminarWorkout: () => void;
  getProgreso: () => number;
  getTotalSeries: () => number;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  rutinaActual: null,
  ejercicioActualIndex: 0,
  serieActual: 1,
  seriesCompletadas: 0,
  isPaused: false,
  isActive: false,
  startTime: null,

  iniciarWorkout: (rutina: Rutina) => {
    set({
      rutinaActual: rutina,
      ejercicioActualIndex: 0,
      serieActual: 1,
      seriesCompletadas: 0,
      isPaused: false,
      isActive: true,
      startTime: Date.now(),
    });
  },

  completarSerie: () => {
    const state = get();
    if (!state.rutinaActual) return;
    
    const ejercicio = state.rutinaActual.ejercicios[state.ejercicioActualIndex];
    const nuevaSerie = state.serieActual + 1;
    
    if (nuevaSerie > ejercicio.series) {
      if (state.ejercicioActualIndex < state.rutinaActual.ejercicios.length - 1) {
        set({
          ejercicioActualIndex: state.ejercicioActualIndex + 1,
          serieActual: 1,
          seriesCompletadas: state.seriesCompletadas + 1,
        });
      } else {
        set({
          seriesCompletadas: state.seriesCompletadas + 1,
          isActive: false,
        });
      }
    } else {
      set({
        serieActual: nuevaSerie,
        seriesCompletadas: state.seriesCompletadas + 1,
      });
    }
  },

  siguienteEjercicio: () => {
    const state = get();
    if (!state.rutinaActual) return;
    
    if (state.ejercicioActualIndex < state.rutinaActual.ejercicios.length - 1) {
      set({
        ejercicioActualIndex: state.ejercicioActualIndex + 1,
        serieActual: 1,
      });
    }
  },

  ejercicioAnterior: () => {
    const state = get();
    if (state.ejercicioActualIndex > 0) {
      set({
        ejercicioActualIndex: state.ejercicioActualIndex - 1,
        serieActual: 1,
      });
    }
  },

  togglePausa: () => {
    set({ isPaused: !get().isPaused });
  },

  reiniciar: () => {
    set({
      rutinaActual: null,
      ejercicioActualIndex: 0,
      serieActual: 1,
      seriesCompletadas: 0,
      isPaused: false,
      isActive: false,
      startTime: null,
    });
  },

  terminarWorkout: () => {
    set({
      isActive: false,
      isPaused: false,
    });
  },

  getProgreso: () => {
    const state = get();
    if (!state.rutinaActual) return 0;
    const total = state.getTotalSeries();
    if (total === 0) return 0;
    return Math.round((state.seriesCompletadas / total) * 100);
  },

  getTotalSeries: () => {
    const state = get();
    if (!state.rutinaActual) return 0;
    return state.rutinaActual.ejercicios.reduce((acc, ex) => acc + ex.series, 0);
  },
}));
