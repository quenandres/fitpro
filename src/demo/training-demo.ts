import type {
  ClientLink,
  GatewayPlanTree,
  InviteClientResult,
} from '../lib/gateway/training.service';
import type { GatewayHistorialRow } from '../lib/gateway/schemas/training';

export async function demoInviteClient(body: {
  email: string;
  full_name: string;
  plan_nombre: string;
}): Promise<InviteClientResult> {
  const client_id = `demo-invite-${Date.now()}`;
  const plan: GatewayPlanTree = {
    id: `plan-${client_id}`,
    nombre: body.plan_nombre,
    semana_actual: 1,
    semanas: [],
  };
  const link: ClientLink = {
    id: client_id,
    client_id,
    status: 'active',
    profile: {
      id: client_id,
      full_name: body.full_name,
      role: 'client',
    },
    plan,
  };
  return {
    client_id,
    email: body.email,
    full_name: body.full_name,
    already_existed: false,
    link,
    plan,
    email_mode: 'demo',
  };
}

export async function demoListTrainerClients(): Promise<{ clients: ClientLink[] }> {
  return { clients: [] };
}

export async function demoLinkClient(clientId: string): Promise<ClientLink> {
  return {
    id: clientId,
    client_id: clientId,
    status: 'active',
    profile: { id: clientId, full_name: 'Cliente demo', role: 'client' },
    plan: null,
  };
}

export async function demoCreatePlan(_body: unknown): Promise<{ ok: true }> {
  return { ok: true };
}

export async function demoFetchClientHistorial(
  _clientId: string,
): Promise<GatewayHistorialRow[]> {
  return [];
}
