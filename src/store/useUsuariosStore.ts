import { create } from 'zustand';
import { DIAS_SEMANA } from '../components/userPlans/diasSemana';
import type { Rutina, Usuario } from '../types';
import { applyRutinaToUser, type DiaRef } from '../utils/planMutations';
import usuariosData from '../data/usuarios.json';

interface UsuariosStore {
  usuarios: Usuario[];
  updateUsuario: (id: number, updater: (user: Usuario) => Usuario) => void;
  addUsuario: (user: Usuario) => void;
  assignRutinaToUsers: (userIds: number[], ref: DiaRef, rutina: Rutina) => void;
}

export function dateToPlanRef(date: Date, semana = 1): DiaRef {
  const jsDay = date.getDay();
  const diaIndex = DIAS_SEMANA.findIndex((d) => d.dia === jsDay);
  return { semana, diaIndex: diaIndex >= 0 ? diaIndex : 0 };
}

export const useUsuariosStore = create<UsuariosStore>((set) => ({
  usuarios: usuariosData as Usuario[],

  updateUsuario: (id, updater) => {
    set((state) => ({
      usuarios: state.usuarios.map((u) => (u.id === id ? updater(u) : u)),
    }));
  },

  addUsuario: (user) => {
    set((state) => ({ usuarios: [...state.usuarios, user] }));
  },

  assignRutinaToUsers: (userIds, ref, rutina) => {
    set((state) => ({
      usuarios: state.usuarios.map((u) =>
        userIds.includes(u.id) ? applyRutinaToUser(u, ref, rutina) : u,
      ),
    }));
  },
}));
