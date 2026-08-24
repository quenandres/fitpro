import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { WorkoutDetail } from './pages/WorkoutDetail';
import { ExerciseLibrary } from './pages/ExerciseLibrary';
import { LibraryLayout } from './components/library/LibraryLayout';
import { LibraryHub } from './pages/library/LibraryHub';
import { LibraryRutinasPage } from './pages/library/LibraryRutinasPage';
import { LibraryMisEjerciciosPage } from './pages/library/LibraryMisEjerciciosPage';
import { LibraryDatosPage } from './pages/library/LibraryDatosPage';
import { BodyPartsCatalogPage } from './pages/library/BodyPartsCatalogPage';
import { EquipmentsCatalogPage } from './pages/library/EquipmentsCatalogPage';
import { ExerciseTypesCatalogPage } from './pages/library/ExerciseTypesCatalogPage';
import { MusclesCatalogPage } from './pages/library/MusclesCatalogPage';
import { AIRoutineChatPage } from './pages/library/AIRoutineChatPage';
import { RoutineChooserPage } from './pages/library/RoutineChooserPage';
import { BasicRoutineForm } from './pages/library/routines/BasicRoutineForm';
import { IntermediateRoutineForm } from './pages/library/routines/IntermediateRoutineForm';
import { AdvancedRoutineForm } from './pages/library/routines/AdvancedRoutineForm';
import { RoutinePresetGalleryPage } from './pages/library/RoutinePresetGalleryPage';
import { WorkoutPlayer } from './pages/WorkoutPlayer';
import { RoutinePageRedirect } from './pages/RoutinePage';
import { UnitPage } from './pages/UnitPage';
import { UserPlansPage } from './pages/UserPlansPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import AnatomyRecoveryTracker from './pages/AnatomyRecoveryTracker';
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
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route path="/"               element={<PublicRoute><Dashboard /></PublicRoute>} />
      <Route path="/workout/:id"    element={<PublicRoute><WorkoutDetail /></PublicRoute>} />
      <Route path="/library" element={<PublicRoute><LibraryLayout /></PublicRoute>}>
        <Route index element={<LibraryHub />} />
        <Route path="rutinas" element={<LibraryRutinasPage />} />
        <Route path="mis-ejercicios" element={<LibraryMisEjerciciosPage />} />
        <Route path="ejercicios" element={<ExerciseLibrary />} />
        <Route path="partes" element={<BodyPartsCatalogPage />} />
        <Route path="equipo" element={<EquipmentsCatalogPage />} />
        <Route path="tipos" element={<ExerciseTypesCatalogPage />} />
        <Route path="musculos" element={<MusclesCatalogPage />} />
        <Route path="ia" element={<AIRoutineChatPage />} />
        <Route path="rutina" element={<RoutineChooserPage />} />
        <Route path="rutina/plantillas" element={<RoutinePresetGalleryPage />} />
        <Route path="rutina/basica" element={<BasicRoutineForm />} />
        <Route path="rutina/intermedia" element={<IntermediateRoutineForm />} />
        <Route path="rutina/avanzada" element={<AdvancedRoutineForm />} />
        <Route path="datos" element={<LibraryDatosPage />} />
      </Route>
      <Route path="/library/planes" element={<PublicRoute><UserPlansPage /></PublicRoute>} />
      <Route path="/library/unidades" element={<PublicRoute><UnitPage /></PublicRoute>} />
      <Route path="/player" element={<PublicRoute><WorkoutPlayer /></PublicRoute>} />

      {/* Redirects legacy /admin → library */}
      <Route path="/admin" element={<Navigate to="/library/rutinas" replace />} />
      <Route path="/admin/ejercicios" element={<Navigate to="/library/mis-ejercicios" replace />} />
      <Route path="/admin/catalogo" element={<Navigate to="/library" replace />} />
      <Route path="/admin/planes" element={<Navigate to="/library/planes" replace />} />
      <Route path="/admin/planes/full" element={<Navigate to="/library/planes" replace />} />
      <Route path="/admin/unidades" element={<Navigate to="/library/unidades" replace />} />
      <Route path="/admin/unidades/full" element={<Navigate to="/library/unidades" replace />} />
      <Route path="/admin/datos" element={<Navigate to="/library/datos" replace />} />
      <Route path="/admin/rutina" element={<PublicRoute><RoutinePageRedirect /></PublicRoute>} />
      <Route path="/admin/rutina-ia" element={<Navigate to="/library/ia" replace />} />

      <Route path="/anatomytracker" element={<PublicRoute><AnatomyRecoveryTracker /></PublicRoute>} />
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
