import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';

// TODO: Descomentar cuando se integre Supabase
// import type { Session, User } from '@supabase/supabase-js';
// import { supabase } from '../lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('fitpro-auth') === 'true';
  });

  const login = () => {
    localStorage.setItem('fitpro-auth', 'true');
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('fitpro-auth');
    setIsAuthenticated(false);
  };

  // TODO: Reemplazar con lógica real de Supabase
  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setSession(session);
  //     setLoading(false);
  //   });
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setSession(session);
  //   });
  //   return () => subscription.unsubscribe();
  // }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading: false, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
