import { z } from 'zod';

const authUserSchema = z.object({
  id: z.string(),
  email: z.string().nullable().optional(),
});

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

export type TokenSession = z.infer<typeof tokenSessionSchema>;
export type SignupResponse = z.infer<typeof signupResponseSchema>;
export type GatewayUser = z.infer<typeof gatewayUserSchema>;
