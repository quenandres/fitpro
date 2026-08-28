import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { WorkoutDetail } from './pages/WorkoutDetail';
import { ExerciseLibrary } from './pages/ExerciseLibrary';
import { LibraryLayout } from './components/library/LibraryLayout';
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
import { UsuariosPage } from './pages/UsuariosPage';
import { UserPlansPage } from './pages/UserPlansPage';
import { CalendarPage } from './pages/CalendarPage';
import { TrackingPage } from './pages/TrackingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import AnatomyRecoveryTracker from './pages/AnatomyRecoveryTracker';
import { CommunitiesLayout } from './components/communities/layout/CommunitiesLayout';
import { CommunityLayout, CommunityDetailRedirect } from './components/communities/layout/CommunityLayout';
import { CommunitiesExplorePage } from './pages/communities/CommunitiesExplorePage';
import { CommunityInvitationsPage } from './pages/communities/CommunityInvitationsPage';
import { CommunityCreatePage } from './pages/communities/CommunityCreatePage';
import { CommunityHomePage } from './pages/communities/CommunityHomePage';
import { CommunityPostsPage } from './pages/communities/CommunityPostsPage';
import { CommunityPostCreatePage } from './pages/communities/CommunityPostCreatePage';
import { CommunityPostDetailPage } from './pages/communities/CommunityPostDetailPage';
import { CommunityEventsPage } from './pages/communities/CommunityEventsPage';
import { CommunityEventCreatePage } from './pages/communities/CommunityEventCreatePage';
import { CommunityEventDetailPage } from './pages/communities/CommunityEventDetailPage';
import { CommunityEventParticipantsPage } from './pages/communities/CommunityEventParticipantsPage';
import { CommunityDiscussionsPage } from './pages/communities/CommunityDiscussionsPage';
import { CommunityDiscussionDetailPage } from './pages/communities/CommunityDiscussionDetailPage';
import { CommunityMembersPage } from './pages/communities/CommunityMembersPage';
import { CommunityAboutPage } from './pages/communities/CommunityAboutPage';
import { CommunityAdminPage } from './pages/communities/CommunityAdminPage';
import { CommunityAdminMembersPage } from './pages/communities/CommunityAdminMembersPage';
import { CommunityAdminModerationPage } from './pages/communities/CommunityAdminModerationPage';
import { NotificationsPage } from './pages/communities/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
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

      {/* App principal — Inicio = dashboard de métricas (por rol) */}
      <Route path={ROUTES.home} element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
      <Route path={ROUTES.admin.dashboard} element={<Navigate to={ROUTES.home} replace />} />
      <Route path={ROUTES.calendar} element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
      <Route path={ROUTES.tracking} element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
      <Route path={ROUTES.usuarios} element={<ProtectedRoute><UsuariosPage /></ProtectedRoute>} />
      <Route path="/usuarios/:userId" element={<ProtectedRoute><UsuariosPage /></ProtectedRoute>} />
      <Route path="/workout/:id" element={<ProtectedRoute><WorkoutDetail /></ProtectedRoute>} />
      <Route path={ROUTES.player} element={<ProtectedRoute><WorkoutPlayer /></ProtectedRoute>} />
      <Route path={ROUTES.anatomy} element={<ProtectedRoute><AnatomyRecoveryTracker /></ProtectedRoute>} />

      {/*
        Biblioteca — recursos del usuario + catálogo de referencia.
        Todo bajo auth; los datos vendrán del gateway (TanStack Query en Fase 3).
      */}
      <Route path={lib.root} element={<ProtectedRoute><LibraryLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to={lib.rutinas} replace />} />

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

      {/*
        Comunidades — módulo UI pura sobre datos mock (`useCommunitiesStore`).
        Sin backend: ver el plan de implementación del módulo / CONTEXT.md.
      */}
      <Route path={ROUTES.communities.root} element={<ProtectedRoute><CommunitiesLayout /></ProtectedRoute>}>
        <Route index element={<CommunitiesExplorePage />} />
        <Route path="create" element={<CommunityCreatePage />} />
        <Route path="invitations" element={<CommunityInvitationsPage />} />
      </Route>

      <Route path="/communities/:id" element={<ProtectedRoute><CommunityLayout /></ProtectedRoute>}>
        <Route index element={<CommunityDetailRedirect />} />
        <Route path="home" element={<CommunityHomePage />} />
        <Route path="posts" element={<CommunityPostsPage />} />
        <Route path="posts/create" element={<CommunityPostCreatePage />} />
        <Route path="posts/:postId" element={<CommunityPostDetailPage />} />
        <Route path="events" element={<CommunityEventsPage />} />
        <Route path="events/create" element={<CommunityEventCreatePage />} />
        <Route path="events/:eventId" element={<CommunityEventDetailPage />} />
        <Route path="events/:eventId/participants" element={<CommunityEventParticipantsPage />} />
        <Route path="discussions" element={<CommunityDiscussionsPage />} />
        <Route path="discussions/:discussionId" element={<CommunityDiscussionDetailPage />} />
        <Route path="members" element={<CommunityMembersPage />} />
        <Route path="about" element={<CommunityAboutPage />} />
        <Route path="admin" element={<CommunityAdminPage />} />
        <Route path="admin/members" element={<CommunityAdminMembersPage />} />
        <Route path="admin/moderation" element={<CommunityAdminModerationPage />} />
      </Route>

      <Route path={ROUTES.notifications} element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path={ROUTES.perfil} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

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
