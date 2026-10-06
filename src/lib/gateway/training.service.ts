import { z } from 'zod';
import {
  demoCreatePlan,
  demoFetchClientHistorial,
  demoInviteClient,
  demoLinkClient,
  demoListTrainerClients,
} from '../../demo/training-demo';
import { isMockMode } from '../mock-mode';
import { gatewayFetch } from './client';
import {
  gatewayHistorialRowSchema,
  type GatewayHistorialRow,
} from './schemas/training';

export type GatewayPlanExercise = {
  ejercicio_id: string | number;
  nombre: string;
  series: number;
  repeticiones: number;
  peso_objetivo_kg?: number | null;
};

/** Listado de clientes: solo metadatos para cards. */
export type GatewayPlanSummary = {
  id: string;
  nombre: string;
  semana_actual: number;
  dias_entrenar_semana: number;
};

export type GatewayPlanTree = {
  id: string;
  nombre: string;
  semana_actual: number;
  semanas: Array<{
    numero: number;
    sesiones: Array<{
      id?: string;
      nombre: string;
      ejercicios: GatewayPlanExercise[];
    }>;
  }>;
};

export type ClientLink = {
  id: string;
  client_id: string;
  status: string;
  profile?: { id: string; full_name: string; role: string };
  plan?: GatewayPlanSummary | GatewayPlanTree | null;
};

export type TrainerClientsPagination = {
  page: number;
  size: number;
  total_records: number;
  total_pages: number;
};

export type TrainerClientsPageResult = {
  clients: ClientLink[];
  count: number;
  pagination: TrainerClientsPagination;
};

export const TRAINER_CLIENTS_PAGE_SIZE = 18;

export type InviteClientResult = {
  client_id: string;
  email: string;
  full_name: string;
  already_existed: boolean;
  link: ClientLink;
  plan: GatewayPlanTree;
  email_mode?: string;
  invite_url?: string;
};

export async function listTrainerClients(options?: {
  page?: number;
  limit?: number;
}): Promise<TrainerClientsPageResult> {
  if (isMockMode()) return demoListTrainerClients(options);
  const page = options?.page ?? 1;
  const limit = options?.limit ?? TRAINER_CLIENTS_PAGE_SIZE;
  const qs = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return gatewayFetch(`/api/trainers/clients?${qs.toString()}`);
}

export async function inviteClient(body: {
  email: string;
  full_name: string;
  plan_nombre: string;
  semanas: Array<{
    numero: number;
    sesiones: Array<{
      orden: number;
      nombre: string;
      ejercicios: Array<{
        exercise_id: number;
        orden: number;
        series: number;
        repeticiones: number;
        peso_objetivo_kg?: number | null;
      }>;
    }>;
  }>;
}): Promise<InviteClientResult> {
  if (isMockMode()) {
    return demoInviteClient({
      email: body.email,
      full_name: body.full_name,
      plan_nombre: body.plan_nombre,
    });
  }
  return gatewayFetch('/api/trainers/clients/invite', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function linkClient(clientId: string): Promise<ClientLink> {
  if (isMockMode()) return demoLinkClient(clientId);
  return gatewayFetch(`/api/trainers/clients/link?client_id=${encodeURIComponent(clientId)}`, {
    method: 'POST',
  });
}

export async function createPlan(body: {
  client_id: string;
  nombre: string;
  semana_actual?: number;
  template_id?: string | null;
  semanas: Array<{
    numero: number;
    sesiones: Array<{
      orden: number;
      nombre: string;
      ejercicios: Array<{
        exercise_id: number;
        orden: number;
        series: number;
        repeticiones: number;
        peso_objetivo_kg?: number | null;
      }>;
    }>;
  }>;
}): Promise<unknown> {
  if (isMockMode()) return demoCreatePlan(body);
  return gatewayFetch('/api/trainers/plans', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function fetchTrainerClientPlan(clientId: string): Promise<GatewayPlanTree> {
  if (isMockMode()) {
    return {
      id: 'demo-plan',
      nombre: 'Plan activo',
      semana_actual: 1,
      semanas: [],
    };
  }
  return gatewayFetch(`/api/trainers/clients/${encodeURIComponent(clientId)}/plan`);
}

const historialInflight = new Map<string, Promise<GatewayHistorialRow[]>>();

export async function fetchClientHistorial(
  clientId: string,
  limit = 200,
): Promise<GatewayHistorialRow[]> {
  if (isMockMode()) return demoFetchClientHistorial(clientId);

  const inflightKey = `${clientId}:${limit}`;
  const existing = historialInflight.get(inflightKey);
  if (existing) return existing;

  const request = (async () => {
    const data = await gatewayFetch<unknown>(
      `/api/trainers/clients/${encodeURIComponent(clientId)}/historial?limit=${limit}`,
    );
    return z.array(gatewayHistorialRowSchema).parse(data);
  })().finally(() => {
    historialInflight.delete(inflightKey);
  });

  historialInflight.set(inflightKey, request);
  return request;
}
