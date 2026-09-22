import { Outlet, useParams, Navigate, useLocation } from 'react-router-dom';
import { AppShell } from '../../layout/AppShell';
import { CommunityHeader } from './CommunityHeader';
import { CommunityTabs } from './CommunityTabs';
import { CommunitySidebarLeft } from './CommunitySidebarLeft';
import { CommunitySidebarRight } from './CommunitySidebarRight';
import { EmptyState } from '../../common/EmptyState';
import { PageBackButton } from '../../common/PageBackButton';
import { useIsLargeScreen } from '../../../hooks/useMediaQuery';
import { Skeleton } from '../../common/Skeleton';
import { useComunidad } from '../../../lib/gateway/hooks';
import { ROUTES } from '../../../routes/paths';
import { resolveCommunityLayoutBack } from '../../../utils/communityBackUtils';
import { Users } from 'lucide-react';

/**
 * Shell de una comunidad: header + tabs sticky en móvil, layout de 3 columnas
 * en desktop (`lg+`). Igual patrón que `CalendarPage` con `useIsLargeScreen`.
 */
export function CommunityLayout() {
  const { id } = useParams<{ id: string }>();
  const { pathname } = useLocation();
  const isLargeScreen = useIsLargeScreen();
  const { data: comunidad, isLoading, isError } = useComunidad(id);

  const layoutBack =
    id != null && comunidad != null ? resolveCommunityLayoutBack(pathname, id) : null;

  if (isLoading) {
    return (
      <AppShell width="wide">
        <Skeleton height={200} className="rounded-2xl" />
      </AppShell>
    );
  }

  if (isError || !comunidad) {
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
          {layoutBack ? (
            <PageBackButton to={layoutBack.to} label={layoutBack.label} className="mb-2" />
          ) : null}
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
        {layoutBack ? (
          <PageBackButton to={layoutBack.to} label={layoutBack.label} className="mb-2" />
        ) : null}
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
