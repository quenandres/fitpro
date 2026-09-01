import { z } from 'zod';

import {
  ALL_PERMISSIONS,
  type GatewayRole,
  type PlatformRole,
  isGatewayRole,
  mapRoleFromGateway,
  permissionsForRole,
  resolveGatewayRole,
} from '../../../types/platformRole';

const authUserSchema = z.object({
  id: z.string(),
  email: z.string().nullable().optional(),
});

export const gatewayRoleSchema = z.enum(['superadmin', 'admin', 'trainer']);

export const permissionSchema = z.enum(
  ALL_PERMISSIONS as [string, ...string[]],
);

export const tokenSessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number().optional(),
  token_type: z.string().optional(),
  user: authUserSchema.optional(),
});

export const signupResponseSchema = z
  .object({
    access_token: z.string().optional(),
    refresh_token: z.string().optional(),
    expires_in: z.number().optional(),
    token_type: z.string().optional(),
    user: authUserSchema.nullable().optional(),
    session: tokenSessionSchema.nullable().optional(),
  })
  .passthrough();

export const gatewayUserSchema = z.object({
  id: z.string(),
  email: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  aud: z.string().nullable().optional(),
  exp: z.number().nullable().optional(),
});

export const profileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  role: gatewayRoleSchema.or(z.string()).optional(),
  updated_at: z.string().nullable().optional(),
});

export const profileListSchema = z.array(profileSchema);

export const authContextSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().nullable().optional(),
  }),
  role: gatewayRoleSchema,
  permissions: z.array(permissionSchema),
});

export type TokenSession = z.infer<typeof tokenSessionSchema>;
export type SignupResponse = z.infer<typeof signupResponseSchema>;
export type GatewayUser = z.infer<typeof gatewayUserSchema>;
export type ProfileDto = z.infer<typeof profileSchema>;
export type AuthContextDto = z.infer<typeof authContextSchema>;

export interface AuthContext {
  userId: string;
  email: string;
  gatewayRole: GatewayRole;
  role: PlatformRole;
  permissions: readonly string[];
}

export function toAuthContext(
  userId: string,
  email: string,
  gatewayRole: string | null | undefined,
  permissions?: readonly string[],
): AuthContext {
  const resolved = resolveGatewayRole(gatewayRole);
  return {
    userId,
    email,
    gatewayRole: resolved,
    role: mapRoleFromGateway(resolved),
    permissions: permissions ?? permissionsForRole(resolved),
  };
}

export function parseAuthContextPayload(payload: unknown): AuthContext {
  const parsed = authContextSchema.safeParse(payload);
  if (parsed.success) {
    return toAuthContext(
      parsed.data.user.id,
      parsed.data.user.email ?? '',
      parsed.data.role,
      parsed.data.permissions,
    );
  }

  const userParsed = gatewayUserSchema.safeParse(payload);
  if (userParsed.success) {
    const role = isGatewayRole(userParsed.data.role ?? undefined)
      ? userParsed.data.role
      : 'trainer';
    return toAuthContext(
      userParsed.data.id,
      userParsed.data.email ?? '',
      role,
    );
  }

  throw new Error('Formato de contexto de auth inválido');
}
