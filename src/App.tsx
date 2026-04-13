import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { WorkoutDetail } from './pages/WorkoutDetail';
import { ExerciseLibrary } from './pages/ExerciseLibrary';
import { WorkoutPlayer } from './pages/WorkoutPlayer';
import { Admin } from './pages/Admin';
import { RoutinePage } from './pages/RoutinePage';
import { UnitPage } from './pages/UnitPage';
import { UserPlansPage } from './pages/UserPlansPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import type { ReactNode } from 'react';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)',
      }}>
        <div className="auth-spinner-lg" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected routes */}
      <Route path="/"               element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/workout/:id"    element={<ProtectedRoute><WorkoutDetail /></ProtectedRoute>} />
      <Route path="/library"        element={<ProtectedRoute><ExerciseLibrary /></ProtectedRoute>} />
      <Route path="/player"         element={<ProtectedRoute><WorkoutPlayer /></ProtectedRoute>} />
      <Route path="/admin"          element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      <Route path="/admin/rutina"   element={<ProtectedRoute><RoutinePage /></ProtectedRoute>} />
      <Route path="/admin/unidades" element={<ProtectedRoute><UnitPage /></ProtectedRoute>} />
      <Route path="/admin/planes"   element={<ProtectedRoute><UserPlansPage /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
