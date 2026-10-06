import { create } from 'zustand';

export interface RoutineAssignmentRecord {
  id: string;
  usuarioId: number;
  rutinaId: number;
  rutinaNombre: string;
  fechaInicio: string;
  fechaFin: string;
  semanasCompletadas: number;
  modo: 'reiniciar' | 'retomar' | 'programado';
}

interface RoutineAssignmentHistoryStore {
  registros: RoutineAssignmentRecord[];
  registrarReemplazo: (input: Omit<RoutineAssignmentRecord, 'id'>) => void;
  getHistorialUsuario: (usuarioId: number) => RoutineAssignmentRecord[];
}

/** Historial de transiciones de rutina por usuario — mock local, no persiste entre sesiones. */
export const useRoutineAssignmentHistoryStore = create<RoutineAssignmentHistoryStore>((set, get) => ({
  registros: [],

  registrarReemplazo: (input) => {
    const record: RoutineAssignmentRecord = { ...input, id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` };
    set((state) => ({ registros: [record, ...state.registros] }));
  },

  getHistorialUsuario: (usuarioId) => get().registros.filter((r) => r.usuarioId === usuarioId),
}));
