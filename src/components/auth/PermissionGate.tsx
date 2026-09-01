import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthorization } from '../../context/AuthorizationContext';
import type { Permission } from '../../types/platformRole';

interface PermissionGateProps {
  permission: Permission | Permission[];
  /** Si true, basta con tener uno de los permisos listados */
  any?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
  children: ReactNode;
}

export const PermissionGate = ({
  permission,
  any = false,
  fallback = null,
  redirectTo,
  children,
}: PermissionGateProps) => {
  const { loading, can, permissions } = useAuthorization();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '40vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="auth-spinner-lg" />
      </div>
    );
  }

  const list = Array.isArray(permission) ? permission : [permission];
  const allowed = any
    ? list.some((p) => permissions.includes(p))
    : can(list.length === 1 ? list[0] : list);

  if (!allowed) {
    if (redirectTo) return <Navigate to={redirectTo} replace />;
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
