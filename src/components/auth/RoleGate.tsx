import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuthorization } from '../../context/AuthorizationContext';
import { ROUTES } from '../../routes/paths';
import type { PlatformRole } from '../../types/platformRole';

interface RoleGateProps {
  roles: PlatformRole | PlatformRole[];
  fallback?: ReactNode;
  redirectTo?: string;
  children: ReactNode;
}

export const RoleGate = ({
  roles,
  fallback = null,
  redirectTo,
  children,
}: RoleGateProps) => {
  const { loading, hasRole } = useAuthorization();
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

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

  if (!hasRole(...allowedRoles)) {
    if (redirectTo) return <Navigate to={redirectTo} replace />;
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export const AdminOnlyGate = ({ children }: { children: ReactNode }) => (
  <RoleGate roles={['superadmin', 'admin']} redirectTo={ROUTES.home}>
    {children}
  </RoleGate>
);
