import { Outlet, useParams, Navigate } from 'react-router-dom';
import { AppShell } from '../../layout/AppShell';
import { CommunityHeader } from './CommunityHeader';
import { CommunityTabs } from './CommunityTabs';
import { CommunitySidebarLeft } from './CommunitySidebarLeft';
import { CommunitySidebarRight } from './CommunitySidebarRight';
import { EmptyState } from '../../common/EmptyState';
import { useIsLargeScreen } from '../../../hooks/useMediaQuery';
import { useCommunity } from '../../../store/useCommunitiesStore';
import { ROUTES } from '../../../routes/paths';
import { Users } from 'lucide-react';

/**
 * Shell de una comunidad: header + tabs sticky en móvil, layout de 3 columnas
 * en desktop (`lg+`). Igual patrón que `CalendarPage` con `useIsLargeScreen`.
 */
export function CommunityLayout() {
  const { id } = useParams<{ id: string }>();
  const isLargeScreen = useIsLargeScreen();
  const comunidad = useCommunity(id);

  if (!comunidad) {
    return (
      <AppShell width="wide">
        <EmptyState icon={Users} title="Comunidad no encontrada" description="Puede que ya no exista o el enlace sea incorrecto." />
      </AppShell>
    );
  }

  if (!isLargeScreen) {
    return (
      <AppShell width="wide">
        <div className="fp-com-page animate-slide-up">
          <CommunityHeader comunidad={comunidad} />
          <CommunityTabs comunidadId={comunidad.id} />
          <div className="fp-com-main mt-4">
            <Outlet />
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell width="wide">
      <div className="fp-com-page animate-slide-up">
        <CommunityHeader comunidad={comunidad} />
        <div className="fp-com-layout mt-4">
          <CommunitySidebarLeft comunidadId={comunidad.id} />
          <div className="fp-com-main">
            <Outlet />
          </div>
          <CommunitySidebarRight comunidad={comunidad} />
        </div>
      </div>
    </AppShell>
  );
}

/** `/communities/:id` → redirect a `/communities/:id/home`. */
export function CommunityDetailRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={ROUTES.communities.home(id ?? '')} replace />;
}
