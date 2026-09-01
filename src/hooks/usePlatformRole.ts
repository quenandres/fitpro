import { useAuthorization } from '../context/AuthorizationContext';
import { useRoleOverrideStore } from '../store/useRoleOverrideStore';
import type { RolDashboard } from '../types/adminDashboard';
import type { PlatformRole } from '../types/platformRole';

interface PlatformRoleState {
  /** Rol efectivo en toda la app: override de `/perfil` o rol del gateway. */
  rol: RolDashboard;
  isSuperadmin: boolean;
  isAdmin: boolean;
  /** Rol real del gateway (sin override). */
  rolReal: RolDashboard;
  rolOverride: RolDashboard | null;
  setRolOverride: (rol: RolDashboard | null) => void;
  can: (permission: string | string[]) => boolean;
}

export function usePlatformRole(): PlatformRoleState {
  const { dashboardRole, can, isAdmin } = useAuthorization();
  const rolOverride = useRoleOverrideStore((s) => s.rolOverride);
  const setRolOverride = useRoleOverrideStore((s) => s.setRolOverride);

  const rol = rolOverride ?? dashboardRole;
  const rolReal = dashboardRole;

  return {
    rol,
    isSuperadmin: rol === 'superadmin',
    isAdmin: rol === 'admin' || isAdmin,
    rolReal,
    rolOverride,
    setRolOverride: setRolOverride as (rol: RolDashboard | null) => void,
    can: can as (permission: string | string[]) => boolean,
  };
}

export type { PlatformRole };
