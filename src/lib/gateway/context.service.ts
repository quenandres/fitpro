import { gatewayFetch, gatewayList, gatewayRequest } from './httpClient';
import {
  authContextSchema,
  gatewayUserSchema,
  parseAuthContextPayload,
  profileListSchema,
  type AuthContext,
  toAuthContext,
} from './schemas/auth';
import { permissionsForRole, resolveGatewayRole } from '../../types/platformRole';

async function composeAuthContextFromProfile(): Promise<AuthContext> {
  const user = await gatewayRequest('/api/auth/user', { method: 'GET' }, gatewayUserSchema);
  const profiles = await gatewayList(
    `/api/users/profiles?id=eq.${encodeURIComponent(user.id)}&select=id,role,full_name`,
    profileListSchema,
  );
  const profileRole = profiles[0]?.role;
  const gatewayRole = resolveGatewayRole(profileRole ?? user.role);
  return toAuthContext(
    user.id,
    user.email ?? '',
    gatewayRole,
    permissionsForRole(gatewayRole),
  );
}

/**
 * Obtiene rol + permisos del usuario autenticado.
 * Intenta `/api/auth/context`; si no existe (404), compone perfil + permisos por rol.
 */
export async function getAuthContext(): Promise<AuthContext> {
  const contextAttempt = await gatewayFetch('/api/auth/context', {
    method: 'GET',
  });

  if (contextAttempt.status === 200) {
    return parseAuthContextPayload(contextAttempt.payload);
  }

  if (contextAttempt.status === 404) {
    return composeAuthContextFromProfile();
  }

  const parsed = authContextSchema.safeParse(contextAttempt.payload);
  if (parsed.success) {
    return parseAuthContextPayload(parsed.data);
  }

  return composeAuthContextFromProfile();
}
