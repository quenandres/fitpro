import { getGatewayBaseUrl } from './config';
import { GatewayError } from './errors';
import { loadSession, saveSession, clearSession, sessionFromTokens } from './session';
import { refresh } from './auth.service';

type FetchOptions = RequestInit & { auth?: boolean; skipRefresh?: boolean };

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const session = loadSession();
  if (!session?.refreshToken) return null;
  try {
    const tokens = await refresh(session.refreshToken);
    const next = sessionFromTokens(tokens);
    saveSession(next);
    return next.accessToken;
  } catch {
    clearSession();
    return null;
  }
}

export async function gatewayFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { auth = true, skipRefresh = false, ...init } = options;
  const headers = new Headers(init.headers);

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const session = loadSession();
    if (session?.accessToken) {
      headers.set('Authorization', `Bearer ${session.accessToken}`);
    }
  }

  const url = `${getGatewayBaseUrl()}${path}`;
  let response = await fetch(url, { ...init, headers });

  if (response.status === 401 && auth && !skipRefresh) {
    refreshPromise ??= refreshAccessToken();
    const newToken = await refreshPromise;
    refreshPromise = null;
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(url, { ...init, headers });
    }
  }

  if (!response.ok) {
    const text = await response.text();
    throw new GatewayError(text || response.statusText, response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
