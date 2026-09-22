import { create } from 'zustand';
import type { ClientLink } from '../lib/gateway/training.service';
import type { Ejercicio, Rutina, Usuario } from '../types';
import { applyRutinaToUser, type SesionRef } from '../utils/planMutations';
import { mapClientLinksToUsuarios } from '../lib/gateway/hooks';
import { normalizePlanUsuario } from '../utils/planScheduleUtils';
import { migratePlanUsuarioEjercicios } from '../utils/migrateExerciseIds';
import usuariosData from '../data/usuarios.json';
import ejerciciosData from '../data/ejercicios.json';
import { useDataStore } from './useDataStore';

interface UsuariosStore {
  usuarios: Usuario[];
  gatewaySynced: boolean;
  updateUsuario: (id: number, updater: (user: Usuario) => Usuario) => void;
  addUsuario: (user: Usuario) => void;
  assignRutinaToUsers: (userIds: number[], ref: SesionRef, rutina: Rutina) => void;
  syncFromGateway: (clients: ClientLink[]) => void;
}

function normalizeUsuario(raw: Usuario, ejerciciosSeed: Ejercicio[] = ejerciciosData as Ejercicio[]): Usuario {
  const planNormalized = normalizePlanUsuario(raw.plan as Parameters<typeof normalizePlanUsuario>[0]);
  const migrated = migratePlanUsuarioEjercicios(planNormalized, ejerciciosSeed);
  const catalog = useDataStore.getState().ejercicios;
  if (migrated.ejercicios.length > catalog.length) {
    useDataStore.setState({ ejercicios: migrated.ejercicios });
  }
  return {
    ...raw,
    dias_entrenar: migrated.plan.dias_entrenar_semana,
    plan: migrated.plan,
  };
}

export const useUsuariosStore = create<UsuariosStore>((set, get) => ({
  usuarios: (usuariosData as unknown as Usuario[]).map((raw) => normalizeUsuario(raw)),
  gatewaySynced: false,

  updateUsuario: (id, updater) => {
    set((state) => ({
      usuarios: state.usuarios.map((u) => (u.id === id ? updater(u) : u)),
    }));
  },

  addUsuario: (user) => {
    set((state) => ({ usuarios: [...state.usuarios, normalizeUsuario(user)] }));
  },

  assignRutinaToUsers: (userIds, ref, rutina) => {
    set((state) => ({
      usuarios: state.usuarios.map((u) =>
        userIds.includes(u.id) ? applyRutinaToUser(u, ref, rutina) : u,
      ),
    }));
  },

  syncFromGateway: (clients) => {
    if (clients.length === 0) return;
    const mapped = mapClientLinksToUsuarios(clients);
    const previous = get().usuarios;
    const merged = mapped.map((client) => {
      const existing = previous.find((u) => u.client_uuid === client.client_uuid);
      return existing ? { ...existing, nombre: client.nombre, client_uuid: client.client_uuid } : client;
    });
    set({ usuarios: merged, gatewaySynced: true });
  },
}));
