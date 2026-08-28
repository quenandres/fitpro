import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearSession,
  extractSessionTokens,
  getCurrentUser,
  isExpired,
  loadSession,
  login as loginRequest,
  logout as logoutRequest,
  refresh as refreshRequest,
  saveSession,
  sessionFromTokens,
  signup as signupRequest,
  type GatewayUser,
  type StoredSession,
} from '../lib/gateway';
import { GatewayError } from '../lib/gateway/errors';
import { clearRoleOverride } from '../store/useRoleOverrideStore';

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toAuthUser = (user: GatewayUser, fallbackEmail?: string): AuthUser => ({
  id: user.id,
  email: user.email ?? fallbackEmail ?? '',
  role: user.role ?? undefined,
});

const persistAndResolveUser = async (
  session: StoredSession,
  fallbackEmail?: string,
): Promise<AuthUser> => {
  saveSession(session);
  const user = await getCurrentUser(session.accessToken);
  return toAuthUser(user, fallbackEmail);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback(async (session: StoredSession, fallbackEmail?: string) => {
    const nextUser = await persistAndResolveUser(session, fallbackEmail);
    setUser(nextUser);
    return nextUser;
  }, []);

  const resetAuth = useCallback(() => {
    clearSession();
    clearRoleOverride();
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const stored = loadSession();
      if (!stored) {
        clearSession();
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        let session = stored;
        if (isExpired(session)) {
          const tokens = await refreshRequest(session.refreshToken);
          session = sessionFromTokens(tokens);
        }

        const nextUser = await persistAndResolveUser(session);
        if (!cancelled) setUser(nextUser);
      } catch (error) {
        const status = error instanceof GatewayError ? error.status : undefined;
        if (status === 401) {
          try {
            const storedAgain = loadSession();
            if (storedAgain) {
              const tokens = await refreshRequest(storedAgain.refreshToken);
              const session = sessionFromTokens(tokens);
              const nextUser = await persistAndResolveUser(session);
              if (!cancelled) setUser(nextUser);
              return;
            }
          } catch {
            // fall through to reset
          }
        }
        clearSession();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await loginRequest(email, password);
      await applySession(sessionFromTokens(tokens), email);
    },
    [applySession],
  );

  const signup = useCallback(
    async (email: string, password: string) => {
      const payload = await signupRequest(email, password);
      const tokens = extractSessionTokens(payload);

      if (!tokens) {
        return { needsEmailConfirmation: true };
      }

      await applySession(sessionFromTokens(tokens), email);
      return { needsEmailConfirmation: false };
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    const stored = loadSession();
    if (stored) {
      await logoutRequest(stored.accessToken);
    }
    resetAuth();
  }, [resetAuth]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: user !== null,
      loading,
      login,
      signup,
      logout,
    }),
    [user, loading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
