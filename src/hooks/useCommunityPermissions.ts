import { useComunidad } from '../lib/gateway/hooks';
import type { RolComunidad } from '../types/community';

export interface CommunityPermissions {
  rol: RolComunidad | null;
  esMiembro: boolean;
  puedeParticipar: boolean;
  puedeModerar: boolean;
  puedeAdministrar: boolean;
}

const PARTICIPA: RolComunidad[] = ['member', 'moderator', 'leader'];
const MODERA: RolComunidad[] = ['moderator', 'leader'];

/** Permisos según rol del usuario autenticado en la comunidad (gateway). */
export function useCommunityPermissions(comunidadId: string): CommunityPermissions {
  const { data: comunidad } = useComunidad(comunidadId);
  const rol = comunidad?.miRol ?? null;
  const suspendido = comunidad?.suspendido ?? false;

  return {
    rol,
    esMiembro: comunidad?.esMiembro ?? false,
    puedeParticipar: rol !== null && PARTICIPA.includes(rol) && !suspendido,
    puedeModerar: rol !== null && MODERA.includes(rol) && !suspendido,
    puedeAdministrar: rol === 'leader' && !suspendido,
  };
}
