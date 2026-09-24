import type { ClientLink } from '../lib/gateway/training.service';
import { linkClient, listTrainerClients } from '../lib/gateway/training.service';
import { mapClientLinksToUsuarios } from '../lib/gateway/hooks';
import { isMockMode } from '../lib/mock-mode';
import type { Usuario } from '../types';

/** En mock, el plan personal de prueba apunta al primer cliente seed. */
export const MOCK_SELF_USUARIO_ID = 1;

export function findSelfUsuario(
  usuarios: Usuario[],
  authUserId: string | undefined,
): Usuario | undefined {
  if (!authUserId) return undefined;
  return usuarios.find((u) => u.client_uuid === authUserId);
}

export function isSelfTrainingUser(
  user: Usuario,
  authUserId: string | undefined,
): boolean {
  if (!authUserId) return false;
  return user.client_uuid === authUserId;
}

interface SelfTrainingStore {
  getUsuarios: () => Usuario[];
  syncFromGateway: (clients: ClientLink[]) => void;
}

export async function resolveSelfTrainingUsuarioId(
  authUserId: string | undefined,
  store: SelfTrainingStore,
): Promise<number> {
  if (isMockMode()) {
    const self = findSelfUsuario(store.getUsuarios(), authUserId);
    return self?.id ?? MOCK_SELF_USUARIO_ID;
  }

  if (!authUserId) {
    throw new Error('Inicia sesión para configurar tu plan.');
  }

  let self = findSelfUsuario(store.getUsuarios(), authUserId);
  if (self) return self.id;

  await linkClient(authUserId);
  const { clients } = await listTrainerClients();
  store.syncFromGateway(clients);

  self = findSelfUsuario(store.getUsuarios(), authUserId);
  if (self) return self.id;

  const mapped = mapClientLinksToUsuarios(clients);
  const fromMapped = mapped.find((u) => u.client_uuid === authUserId);
  if (fromMapped) return fromMapped.id;

  throw new Error('No se pudo abrir tu plan de entrenamiento.');
}
