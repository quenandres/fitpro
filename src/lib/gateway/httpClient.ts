import { z } from 'zod';

import { getGatewayBaseUrl } from './config';
import { GatewayError, mapGatewayAuthError } from './errors';
import {
  isExpired,
  loadSession,
  saveSession,
  sessionFromTokens,
} from './session';
import { refresh as refreshRequest } from './auth.service';

const NETWORK_ERROR =
  'No se pudo conectar con el servidor. ¿Está corriendo el gateway?';

export interface GatewayRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Si true, no adjunta Authorization (login/signup) */
  skipAuth?: boolean;
  /** Si true, no intenta refresh en 401 */
  skipRefresh?: boolean;
}

const parseJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const buildUrl = (path: string): string => {
  const base = getGatewayBaseUrl();
  return path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
};

const getAccessToken = async (skipRefresh: boolean): Promise<string | null> => {
  const stored = loadSession();
  if (!stored) return null;

  if (!isExpired(stored)) {
    return stored.accessToken;
  }

  if (skipRefresh) {
    return stored.accessToken;
  }

  const tokens = await refreshRequest(stored.refreshToken);
  const next = sessionFromTokens(tokens);
  saveSession(next);
  return next.accessToken;
};

export const gatewayFetch = async (
  path: string,
  options: GatewayRequestOptions = {},
): Promise<{ status: number; payload: unknown }> => {
  const { body, skipAuth = false, skipRefresh = false, headers: initHeaders, ...rest } = options;

  const headers = new Headers(initHeaders);
  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = await getAccessToken(skipRefresh);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      ...rest,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    const isNetwork =
      err instanceof TypeError &&
      (err.message.includes('fetch') || err.message.includes('Failed to fetch'));
    if (isNetwork) {
      throw new GatewayError(NETWORK_ERROR);
    }
    throw err instanceof Error ? err : new GatewayError('Error de red al llamar al gateway');
  }

  let payload = await parseJson(response);

  if (response.status === 401 && !skipAuth && !skipRefresh) {
    const stored = loadSession();
    if (stored) {
      try {
        const tokens = await refreshRequest(stored.refreshToken);
        const next = sessionFromTokens(tokens);
        saveSession(next);
        headers.set('Authorization', `Bearer ${next.accessToken}`);
        response = await fetch(buildUrl(path), {
          ...rest,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        payload = await parseJson(response);
      } catch {
        // devolver el 401 original
      }
    }
  }

  return { status: response.status, payload };
};

export const gatewayRequest = async <T>(
  path: string,
  options: GatewayRequestOptions,
  schema: z.ZodType<T>,
  errorMapper: (payload: unknown, status: number) => string = mapGatewayAuthError,
): Promise<T> => {
  const { status, payload } = await gatewayFetch(path, options);

  if (status >= 400) {
    throw new GatewayError(errorMapper(payload, status), status);
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new GatewayError('La respuesta del gateway no tiene el formato esperado', status);
  }

  return parsed.data;
};

export const gatewayRequestVoid = async (
  path: string,
  options: GatewayRequestOptions,
): Promise<void> => {
  const { status, payload } = await gatewayFetch(path, options);
  if (status >= 400) {
    throw new GatewayError(mapGatewayAuthError(payload, status), status);
  }
};

/** PostgREST devuelve arrays en GET de tablas */
export const gatewayList = async <T>(
  path: string,
  schema: z.ZodType<T>,
): Promise<T> => gatewayRequest(path, { method: 'GET' }, schema);
