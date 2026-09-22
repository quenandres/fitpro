import { NavLink, Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { ROUTES } from '../../../routes/paths';
import { useComunidadesList } from '../../../lib/gateway/hooks';
import { useCommunityPermissions } from '../../../hooks/useCommunityPermissions';

interface CommunitySidebarLeftProps {
  comunidadId: string;
}

/** Sidebar izquierdo (desktop): secciones de la comunidad actual + mis comunidades. */
export function CommunitySidebarLeft({ comunidadId }: CommunitySidebarLeftProps) {
  const { data: misComunidades = [] } = useComunidadesList('mis-comunidades', '');
  const { puedeAdministrar } = useCommunityPermissions(comunidadId);

  const sections = [
    { to: ROUTES.communities.home(comunidadId), label: 'Inicio' },
    { to: ROUTES.communities.posts(comunidadId), label: 'Publicaciones' },
    { to: ROUTES.communities.events(comunidadId), label: 'Eventos' },
    { to: ROUTES.communities.members(comunidadId), label: 'Miembros' },
    { to: ROUTES.communities.about(comunidadId), label: 'Información' },
    ...(puedeAdministrar ? [{ to: ROUTES.communities.admin(comunidadId), label: 'Administración' }] : []),
  ];

  return (
    <aside className="fp-com-sidebar">
      <div className="fp-com-sidebar-inner">
        <div className="fp-com-sidebar-section">
          <h3>Secciones</h3>
          <ul className="flex flex-col gap-1">
            {sections.map((s) => (
              <li key={s.to}>
                <NavLink
                  to={s.to}
                  end={s.to === ROUTES.communities.home(comunidadId)}
                  className={({ isActive }) =>
                    `block px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? '' : 'hover:bg-[var(--bg-overlay)]'
                    }`
                  }
                  style={({ isActive }) =>
                    isActive
                      ? { background: 'var(--accent-pink-dim)', color: 'var(--accent-pink)' }
                      : { color: 'var(--text-secondary)' }
                  }
                >
                  {s.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="fp-com-sidebar-section">
          <h3>Mis comunidades</h3>
          <ul className="flex flex-col gap-1">
            {misComunidades.map((c) => (
              <li key={c.id}>
                <Link
                  to={ROUTES.communities.home(c.id)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--bg-overlay)]"
                  style={{ color: c.id === comunidadId ? 'var(--accent-pink)' : 'var(--text-secondary)' }}
                >
                  {c.avatarUrl ? (
                    <img src={c.avatarUrl} alt="" className="w-5 h-5 rounded-full" />
                  ) : (
                    <span
                      className="flex w-5 h-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
                      style={{ background: 'var(--accent-pink)' }}
                    >
                      {c.nombre.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span className="truncate">{c.nombre}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to={ROUTES.communities.root}
            className="flex items-center gap-1.5 mt-3 text-xs font-semibold"
            style={{ color: 'var(--accent-pink)' }}
          >
            <Compass size={13} />
            Explorar más comunidades
          </Link>
        </div>
      </div>
    </aside>
  );
}
