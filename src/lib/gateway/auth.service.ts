import { getGatewayBaseUrl } from './config';
import { GatewayError, mapGatewayAuthError } from './errors';
import {
  gatewayUserSchema,
  signupResponseSchema,
  tokenSessionSchema,
  type GatewayUser,
  type SignupResponse,
  type TokenSession,
} from './schemas/auth';

const NETWORK_ERROR =
  'No se pudo conectar con el servidor. ¿Está corriendo el gateway?';

const parseJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const request = async (
  path: string,
  init: RequestInit,
): Promise<{ status: number; payload: unknown }> => {
  const url = `${getGatewayBaseUrl()}${path}`;
  let response: Response;

  try {
    response = await fetch(url, init);
  } catch (err) {
    const isNetwork =
      err instanceof TypeError &&
      (err.message.includes('fetch') || err.message.includes('Failed to fetch'));
    if (isNetwork) {
      throw new GatewayError(NETWORK_ERROR);
    }
    throw err instanceof Error ? err : new GatewayError('Error de red al llamar al gateway');
  }

  const payload = await parseJson(response);
  return { status: response.status, payload };
};

const throwIfFailed = (status: number, payload: unknown): void => {
  if (status >= 400) {
    throw new GatewayError(mapGatewayAuthError(payload, status), status);
  }
};

export const login = async (email: string, password: string): Promise<TokenSession> => {
  const { status, payload } = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  throwIfFailed(status, payload);

  const parsed = tokenSessionSchema.safeParse(payload);
  if (!parsed.success) {
    throw new GatewayError('La respuesta de login no tiene el formato esperado', status);
  }

  return parsed.data;
};

export const signup = async (email: string, password: string): Promise<SignupResponse> => {
  const { status, payload } = await request('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  throwIfFailed(status, payload);

  const parsed = signupResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new GatewayError('La respuesta de registro no tiene el formato esperado', status);
  }

  return parsed.data;
};

export const refresh = async (refreshToken: string): Promise<TokenSession> => {
  const { status, payload } = await request('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  throwIfFailed(status, payload);

  const parsed = tokenSessionSchema.safeParse(payload);
  if (!parsed.success) {
    throw new GatewayError('La respuesta de refresh no tiene el formato esperado', status);
  }

  return parsed.data;
};

export const logout = async (accessToken: string): Promise<void> => {
  try {
    await request('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    // best-effort: la sesión local se limpia igual
  }
};

export const getCurrentUser = async (accessToken: string): Promise<GatewayUser> => {
  const { status, payload } = await request('/api/auth/user', {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  throwIfFailed(status, payload);

  const parsed = gatewayUserSchema.safeParse(payload);
  if (!parsed.success) {
    throw new GatewayError('La respuesta de usuario no tiene el formato esperado', status);
  }

  return parsed.data;
};

export const extractSessionTokens = (
  payload: SignupResponse | TokenSession,
): TokenSession | null => {
  if ('access_token' in payload && payload.access_token && payload.refresh_token) {
    return {
      access_token: payload.access_token,
      refresh_token: payload.refresh_token,
      expires_in: payload.expires_in,
      token_type: payload.token_type,
      user: 'user' in payload && payload.user ? payload.user : undefined,
    };
  }

  if ('session' in payload && payload.session) {
    return payload.session;
  }

  return null;
};
