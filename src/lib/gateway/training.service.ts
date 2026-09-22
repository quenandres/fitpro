import { gatewayFetch } from './client';

export type GatewayPlanExercise = {
  ejercicio_id: string | number;
  nombre: string;
  series: number;
  repeticiones: number;
  peso_objetivo_kg?: number | null;
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
  plan?: GatewayPlanTree | null;
};

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

export async function listTrainerClients(): Promise<{ clients: ClientLink[] }> {
  return gatewayFetch('/api/trainers/clients');
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
  return gatewayFetch('/api/trainers/clients/invite', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function linkClient(clientId: string): Promise<ClientLink> {
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
  return gatewayFetch('/api/trainers/plans', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function fetchClientHistorial(clientId: string): Promise<unknown[]> {
  return gatewayFetch<unknown[]>(`/api/trainers/clients/${clientId}/historial`);
}
