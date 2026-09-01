import type { RolDashboard } from './adminDashboard';

/** Rol canónico en Supabase / gym-gateway */
export type GatewayRole = 'superadmin' | 'admin' | 'trainer';

/** Rol de plataforma en la UI (trainer → entrenador) */
export type PlatformRole = 'superadmin' | 'admin' | 'entrenador';

export const GATEWAY_ROLES: readonly GatewayRole[] = ['superadmin', 'admin', 'trainer'];

export const PLATFORM_ROLES: readonly PlatformRole[] = ['superadmin', 'admin', 'entrenador'];

export const PERMISSIONS = {
  PROFILE_READ: 'profile.read',
  PROFILE_UPDATE: 'profile.update',
  USERS_VIEW: 'users.view',
  USERS_MANAGE: 'users.manage',
  ROLES_MANAGE: 'roles.manage',
  EXERCISES_VIEW: 'exercises.view',
  TEMPLATES_VIEW: 'templates.view',
  TEMPLATES_CREATE: 'templates.create',
  TEMPLATES_UPDATE: 'templates.update',
  TEMPLATES_DELETE: 'templates.delete',
  TEMPLATES_MANAGE_GLOBAL: 'templates.manage_global',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: readonly Permission[] = Object.values(PERMISSIONS);

/** Espejo de users.role_permissions en Supabase (002_platform_roles.sql) */
export const PERMISSIONS_BY_ROLE: Record<GatewayRole, readonly Permission[]> = {
  superadmin: ALL_PERMISSIONS,
  admin: [
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.EXERCISES_VIEW,
    PERMISSIONS.TEMPLATES_VIEW,
    PERMISSIONS.TEMPLATES_CREATE,
    PERMISSIONS.TEMPLATES_UPDATE,
    PERMISSIONS.TEMPLATES_DELETE,
    PERMISSIONS.TEMPLATES_MANAGE_GLOBAL,
  ],
  trainer: [
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.EXERCISES_VIEW,
    PERMISSIONS.TEMPLATES_VIEW,
    PERMISSIONS.TEMPLATES_CREATE,
    PERMISSIONS.TEMPLATES_UPDATE,
    PERMISSIONS.TEMPLATES_DELETE,
  ],
};

export function isGatewayRole(value: string | null | undefined): value is GatewayRole {
  return value === 'superadmin' || value === 'admin' || value === 'trainer';
}

export function mapRoleFromGateway(role: string | null | undefined): PlatformRole {
  if (role === 'superadmin') return 'superadmin';
  if (role === 'admin') return 'admin';
  return 'entrenador';
}

export function mapRoleToGateway(role: PlatformRole): GatewayRole {
  if (role === 'superadmin') return 'superadmin';
  if (role === 'admin') return 'admin';
  return 'trainer';
}

/** Dashboard mock usa superadmin | admin | entrenador */
export function mapRoleToDashboard(role: PlatformRole): RolDashboard {
  return role;
}

export function permissionsForRole(role: GatewayRole): readonly Permission[] {
  return PERMISSIONS_BY_ROLE[role];
}

export function resolveGatewayRole(role: string | null | undefined): GatewayRole {
  return isGatewayRole(role) ? role : 'trainer';
}
