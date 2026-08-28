import { useAuth } from '../context/AuthContext';
import { useRoleOverrideStore } from '../store/useRoleOverrideStore';
import { resolveDashboardRole, type RolDashboard } from '../types/adminDashboard';

interface PlatformRole {
  /** Rol efectivo en toda la app: el override de `/perfil` si existe, si no el real. */
  rol: RolDashboard;
  isSuperadmin: boolean;
  /** Rol que devuelve el gateway (`AuthUser.role`), sin override. */
  rolReal: RolDashboard;
  rolOverride: RolDashboard | null;
  setRolOverride: (rol: RolDashboard | null) => void;
}

export function usePlatformRole(): PlatformRole {
  const { user } = useAuth();
  const rolOverride = useRoleOverrideStore((s) => s.rolOverride);
  const setRolOverride = useRoleOverrideStore((s) => s.setRolOverride);

  const rolReal = resolveDashboardRole(user?.role);
  const rol = rolOverride ?? rolReal;

  return { rol, isSuperadmin: rol === 'superadmin', rolReal, rolOverride, setRolOverride };
}
