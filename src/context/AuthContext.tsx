import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { authUserQueryKey, comunidadesKeys, trainerKeys } from '../lib/gateway/hooks';
import { clearRoleOverride } from '../store/useRoleOverrideStore';
import { DEMO_TRAINER_USER, isMockMode } from '../lib/mock-mode';

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

async function resolveSessionUser(session: StoredSession, fallbackEmail?: string): Promise<AuthUser> {
  saveSession(session);
  const user = await getCurrentUser(session.accessToken);
  return toAuthUser(user, fallbackEmail);
}

async function restoreAuthUser(): Promise<AuthUser | null> {
  if (isMockMode()) {
    return {
      id: DEMO_TRAINER_USER.id,
      email: DEMO_TRAINER_USER.email,
      role: DEMO_TRAINER_USER.role,
    };
  }

  const stored = loadSession();
  if (!stored) {
    clearSession();
    return null;
  }

  try {
    let session = stored;
    if (isExpired(session)) {
      const tokens = await refreshRequest(session.refreshToken);
      session = sessionFromTokens(tokens);
    }
    return await resolveSessionUser(session);
  } catch (error) {
    const status = error instanceof GatewayError ? error.status : undefined;
    if (status === 401) {
      try {
        const storedAgain = loadSession();
        if (storedAgain) {
          const tokens = await refreshRequest(storedAgain.refreshToken);
          const session = sessionFromTokens(tokens);
          return await resolveSessionUser(session);
        }
      } catch {
        // fall through
      }
    }
    clearSession();
    return null;
  }
}

function clearAuthQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.removeQueries({ queryKey: authUserQueryKey });
  queryClient.removeQueries({ queryKey: trainerKeys.all });
  queryClient.removeQueries({ queryKey: comunidadesKeys.all });
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: authUserQueryKey,
    queryFn: restoreAuthUser,
    staleTime: 60_000,
    retry: false,
  });

  const user = userQuery.data ?? null;
  const loading = userQuery.isPending && !userQuery.isFetched;

  const applySession = useCallback(
    async (session: StoredSession, fallbackEmail?: string) => {
      const nextUser = await resolveSessionUser(session, fallbackEmail);
      queryClient.setQueryData(authUserQueryKey, nextUser);
      return nextUser;
    },
    [queryClient],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      if (isMockMode()) {
        queryClient.setQueryData(authUserQueryKey, {
          id: DEMO_TRAINER_USER.id,
          email: DEMO_TRAINER_USER.email,
          role: DEMO_TRAINER_USER.role,
        });
        return;
      }
      const tokens = await loginRequest(email, password);
      await applySession(sessionFromTokens(tokens), email);
    },
    [applySession, queryClient],
  );

  const signup = useCallback(
    async (email: string, password: string) => {
      if (isMockMode()) {
        queryClient.setQueryData(authUserQueryKey, {
          id: DEMO_TRAINER_USER.id,
          email: DEMO_TRAINER_USER.email,
          role: DEMO_TRAINER_USER.role,
        });
        return { needsEmailConfirmation: false };
      }
      const payload = await signupRequest(email, password);
      const tokens = extractSessionTokens(payload);

      if (!tokens) {
        return { needsEmailConfirmation: true };
      }

      await applySession(sessionFromTokens(tokens), email);
      return { needsEmailConfirmation: false };
    },
    [applySession, queryClient],
  );

  const logout = useCallback(async () => {
    if (isMockMode()) {
      clearSession();
      clearRoleOverride();
      queryClient.setQueryData(authUserQueryKey, {
        id: DEMO_TRAINER_USER.id,
        email: DEMO_TRAINER_USER.email,
        role: DEMO_TRAINER_USER.role,
      });
      return;
    }
    const stored = loadSession();
    if (stored) {
      await logoutRequest(stored.accessToken);
    }
    clearSession();
    clearRoleOverride();
    clearAuthQueries(queryClient);
  }, [queryClient]);

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
