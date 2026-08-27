import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../../routes/paths';
import { useCommunityPermissions } from '../../../hooks/useCommunityPermissions';

interface CommunityTabsProps {
  comunidadId: string;
}

export function CommunityTabs({ comunidadId }: CommunityTabsProps) {
  const { puedeAdministrar } = useCommunityPermissions(comunidadId);

  const tabs = [
    { to: ROUTES.communities.home(comunidadId), label: 'Inicio' },
    { to: ROUTES.communities.posts(comunidadId), label: 'Publicaciones' },
    { to: ROUTES.communities.events(comunidadId), label: 'Eventos' },
    { to: ROUTES.communities.discussions(comunidadId), label: 'Discusiones' },
    { to: ROUTES.communities.members(comunidadId), label: 'Miembros' },
    { to: ROUTES.communities.about(comunidadId), label: 'Información' },
    ...(puedeAdministrar ? [{ to: ROUTES.communities.admin(comunidadId), label: 'Administración' }] : []),
  ];

  return (
    <nav className="fp-com-tabs" aria-label="Secciones de la comunidad">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === ROUTES.communities.home(comunidadId)}
          className={({ isActive }) => `fp-com-tab ${isActive ? 'is-active' : ''}`}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
