import { create } from 'zustand';
import type { ClientLink } from '../lib/gateway/training.service';
import type { Ejercicio, Rutina, Usuario } from '../types';
import { applyRutinaToUser, type SesionRef } from '../utils/planMutations';
import { mapClientLinksToUsuarios } from '../lib/gateway/hooks';
import { createEmptyPlanUsuario } from '../utils/planGatewayAdapter';
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
  loadDemoSeed: () => void;
}

function buildValentinaUsuario(): Usuario {
  const seed = (usuariosData as unknown as Usuario[])[0];
  const planTemplate = seed?.plan
    ? (JSON.parse(JSON.stringify(seed.plan)) as Usuario['plan'])
    : createEmptyPlanUsuario(3);
  if (planTemplate) {
    planTemplate.id = 3;
    planTemplate.nombre = 'Plan Valentina — fuerza y tono';
    planTemplate.descripcion =
      'Prescrito por Laura Méndez. Alineado con la sesión que ejecuta en la PWA.';
  }
  return {
    id: 3,
    nombre: 'Valentina Ruiz',
    email: 'valentina.ruiz@demo.gymapp',
    objetivo: 'Tonificar y ganar fuerza',
    nivel: 'Intermedio',
    peso_kg: 62,
    dias_entrenar: planTemplate?.dias_entrenar_semana ?? 3,
    plan: planTemplate ?? createEmptyPlanUsuario(3),
  };
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
    const previous = get().usuarios;
    if (clients.length === 0) {
      set({
        usuarios: previous.some((u) => u.client_uuid) ? previous : [],
        gatewaySynced: true,
      });
      return;
    }
    const mapped = mapClientLinksToUsuarios(clients, previous);
    const byUuid = new Map(
      previous.filter((u) => u.client_uuid).map((u) => [u.client_uuid!, u] as const),
    );
    for (const client of mapped) {
      if (!client.client_uuid) continue;
      const existing = byUuid.get(client.client_uuid);
      const hasPlanFromGateway = client.plan.programacion_semanal.some(
        (week) => week.sesiones.length > 0,
      );
      byUuid.set(
        client.client_uuid,
        existing
          ? {
              ...existing,
              ...client,
              id: existing.id,
              plan: hasPlanFromGateway ? client.plan : existing.plan,
            }
          : client,
      );
    }
    const withoutUuid = previous.filter((u) => !u.client_uuid);
    set({ usuarios: [...withoutUuid, ...byUuid.values()], gatewaySynced: true });
  },

  loadDemoSeed: () => {
    const base = (usuariosData as unknown as Usuario[]).map((raw) => normalizeUsuario(raw));
    set({
      usuarios: [...base, normalizeUsuario(buildValentinaUsuario())],
      gatewaySynced: true,
    });
  },
}));
