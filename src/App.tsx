import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { WorkoutDetail } from './pages/WorkoutDetail';
import { ExerciseLibrary } from './pages/ExerciseLibrary';
import { LibraryLayout } from './components/library/LibraryLayout';
import { LibraryHub } from './pages/library/LibraryHub';
import { LibraryRutinasPage } from './pages/library/LibraryRutinasPage';
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
import { UserPlansPage } from './pages/UserPlansPage';
import { CalendarPage } from './pages/CalendarPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import AnatomyRecoveryTracker from './pages/AnatomyRecoveryTracker';
import { LEGACY_LIBRARY_REDIRECTS, LEGACY_ROUTINE_FORM_LEVELS, ROUTES } from './routes/paths';
import { LegacyRoutineFormRedirect } from './routes/LegacyRoutineFormRedirect';
import type { ReactNode } from 'react';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-app)',
        }}
      >
        <div className="auth-spinner-lg" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.login} replace />;
};

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to={ROUTES.home} replace /> : <>{children}</>;
};

function AppRoutes() {
  const { library: lib } = ROUTES;

  return (
    <Routes>
      {/* Auth */}
      <Route path={ROUTES.login} element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path={ROUTES.register} element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* App principal */}
      <Route path={ROUTES.home} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path={ROUTES.calendar} element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
      <Route path="/workout/:id" element={<ProtectedRoute><WorkoutDetail /></ProtectedRoute>} />
      <Route path={ROUTES.player} element={<ProtectedRoute><WorkoutPlayer /></ProtectedRoute>} />
      <Route path={ROUTES.anatomy} element={<ProtectedRoute><AnatomyRecoveryTracker /></ProtectedRoute>} />

      {/*
        Biblioteca — recursos del usuario + catálogo de referencia.
        Todo bajo auth; los datos vendrán del gateway (TanStack Query en Fase 3).
      */}
      <Route path={lib.root} element={<ProtectedRoute><LibraryLayout /></ProtectedRoute>}>
        <Route index element={<LibraryHub />} />

        {/* Dominio: rutinas (CRUD vía API) */}
        <Route path="rutinas" element={<LibraryRutinasPage />} />
        <Route path="rutinas/nueva" element={<RoutineChooserPage />} />
        <Route path="rutinas/plantillas" element={<RoutinePresetGalleryPage />} />
        <Route path="rutinas/nueva/basica" element={<BasicRoutineForm />} />
        <Route path="rutinas/nueva/intermedia" element={<IntermediateRoutineForm />} />
        <Route path="rutinas/nueva/avanzada" element={<AdvancedRoutineForm />} />

        {/* Dominio: catálogo ExerciseDB (referencia externa) */}
        <Route path="catalogo" element={<Navigate to={lib.catalogo.ejercicios} replace />} />
        <Route path="catalogo/ejercicios" element={<ExerciseLibrary />} />
        <Route path="catalogo/partes" element={<BodyPartsCatalogPage />} />
        <Route path="catalogo/equipo" element={<EquipmentsCatalogPage />} />
        <Route path="catalogo/tipos" element={<ExerciseTypesCatalogPage />} />
        <Route path="catalogo/musculos" element={<MusclesCatalogPage />} />

        {/* Dominio: IA (backend FastAPI) */}
        <Route path="ia" element={<AIRoutineChatPage />} />

        {/* Gestión del entrenador */}
        <Route path="planes" element={<UserPlansPage />} />
      </Route>

      {/* Redirects legacy */}
      {LEGACY_LIBRARY_REDIRECTS.map(({ from, to }) => (
        <Route key={from} path={from} element={<Navigate to={to} replace />} />
      ))}
      {LEGACY_ROUTINE_FORM_LEVELS.map((level) => (
        <Route
          key={`legacy-rutina-${level}`}
          path={`/library/rutina/${level}`}
          element={<LegacyRoutineFormRedirect level={level} />}
        />
      ))}
      <Route path="/admin/rutina" element={<ProtectedRoute><RoutinePageRedirect /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
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
