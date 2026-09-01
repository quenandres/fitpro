import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import { useAuth } from './AuthContext';
import { useAuthContext } from '../lib/gateway/hooks/useAuthContext';
import type { Permission, PlatformRole } from '../types/platformRole';
import { mapRoleToDashboard } from '../types/platformRole';
import type { RolDashboard } from '../types/adminDashboard';
import { useRoleOverrideStore } from '../store/useRoleOverrideStore';

interface AuthorizationContextValue {
  loading: boolean;
  role: PlatformRole;
  dashboardRole: RolDashboard;
  permissions: readonly string[];
  can: (permission: Permission | Permission[]) => boolean;
  hasRole: (...roles: PlatformRole[]) => boolean;
  isSuperadmin: boolean;
  isAdmin: boolean;
  isEntrenador: boolean;
}

const AuthorizationContext = createContext<AuthorizationContextValue | undefined>(undefined);

export const AuthorizationProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: authContext, isLoading: contextLoading } = useAuthContext(isAuthenticated);
  const rolOverrideRaw = useRoleOverrideStore((s) => s.rolOverride);
  const rolOverride = import.meta.env.DEV ? rolOverrideRaw : null;

  const gatewayRole = authContext?.role ?? 'entrenador';
  const role = rolOverride ?? gatewayRole;
  const permissions = authContext?.permissions ?? [];

  const can = useCallback(
    (permission: Permission | Permission[]) => {
      const needed = Array.isArray(permission) ? permission : [permission];
      return needed.every((p) => permissions.includes(p));
    },
    [permissions],
  );

  const hasRole = useCallback(
    (...roles: PlatformRole[]) => roles.includes(role),
    [role],
  );

  const value = useMemo<AuthorizationContextValue>(
    () => ({
      loading: authLoading || (isAuthenticated && contextLoading),
      role,
      dashboardRole: mapRoleToDashboard(role),
      permissions,
      can,
      hasRole,
      isSuperadmin: role === 'superadmin',
      isAdmin: role === 'admin',
      isEntrenador: role === 'entrenador',
    }),
    [authLoading, isAuthenticated, contextLoading, role, permissions, can, hasRole],
  );

  return (
    <AuthorizationContext.Provider value={value}>{children}</AuthorizationContext.Provider>
  );
};

export const useAuthorization = (): AuthorizationContextValue => {
  const ctx = useContext(AuthorizationContext);
  if (!ctx) {
    throw new Error('useAuthorization must be used within AuthorizationProvider');
  }
  return ctx;
};
