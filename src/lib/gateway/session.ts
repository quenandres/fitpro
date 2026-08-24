export const SESSION_STORAGE_KEY = 'fitpro-session';
export const LEGACY_AUTH_KEY = 'fitpro-auth';

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const isStoredSession = (value: unknown): value is StoredSession => {
  if (typeof value !== 'object' || value === null) return false;
  const session = value as Record<string, unknown>;
  return (
    typeof session.accessToken === 'string' &&
    typeof session.refreshToken === 'string' &&
    typeof session.expiresAt === 'number'
  );
};

export const loadSession = (): StoredSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isStoredSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const saveSession = (session: StoredSession): void => {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  localStorage.removeItem(LEGACY_AUTH_KEY);
};

export const clearSession = (): void => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(LEGACY_AUTH_KEY);
};

export const isExpired = (session: StoredSession, skewMs = 30_000): boolean => {
  return Date.now() >= session.expiresAt - skewMs;
};

export const sessionFromTokens = (tokens: {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
}): StoredSession => ({
  accessToken: tokens.access_token,
  refreshToken: tokens.refresh_token,
  expiresAt: Date.now() + (tokens.expires_in ?? 3600) * 1000,
});
