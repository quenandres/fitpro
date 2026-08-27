import { useCurrentMemberRole } from '../store/useCommunitiesStore';
import type { RolComunidad } from '../types/community';

export interface CommunityPermissions {
  rol: RolComunidad | null;
  esMiembro: boolean;
  /** member, moderator o leader: puede publicar, comentar, reaccionar, hacer RSVP. */
  puedeParticipar: boolean;
  /** moderator o leader: fijar/eliminar posts y discusiones ajenas, resolver reportes. */
  puedeModerar: boolean;
  /** solo leader: gestionar roles, suspender/eliminar miembros, editar reglas y configuración. */
  puedeAdministrar: boolean;
}

const PARTICIPA: RolComunidad[] = ['member', 'moderator', 'leader'];
const MODERA: RolComunidad[] = ['moderator', 'leader'];

/** Permisos simulados según el rol mock del usuario actual en `comunidadId`. */
export function useCommunityPermissions(comunidadId: string): CommunityPermissions {
  const rol = useCurrentMemberRole(comunidadId);

  return {
    rol,
    esMiembro: rol !== null,
    puedeParticipar: rol !== null && PARTICIPA.includes(rol),
    puedeModerar: rol !== null && MODERA.includes(rol),
    puedeAdministrar: rol === 'leader',
  };
}
