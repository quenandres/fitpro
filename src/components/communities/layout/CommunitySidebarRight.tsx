import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { Avatar } from '../../common/Avatar';
import { ROUTES } from '../../../routes/paths';
import type { Comunidad } from '../../../types/community';
import {
  useCommunityEvents,
  useCommunityMembers,
} from '../../../store/useCommunitiesStore';
import { useNow } from '../../../hooks/useNow';

interface CommunitySidebarRightProps {
  comunidad: Comunidad;
}

/** Sidebar derecho (desktop): reglas, líderes y próximo evento. */
export function CommunitySidebarRight({ comunidad }: CommunitySidebarRightProps) {
  const miembros = useCommunityMembers(comunidad.id);
  const eventos = useCommunityEvents(comunidad.id);
  const now = useNow();
  const lideres = miembros.filter((m) => comunidad.liderIds.includes(m.id));
  const proximoEvento = eventos
    .filter((e) => new Date(e.inicioEn).getTime() >= now)
    .sort((a, b) => new Date(a.inicioEn).getTime() - new Date(b.inicioEn).getTime())[0];

  return (
    <aside className="fp-com-sidebar">
      <div className="fp-com-sidebar-inner">
        <div className="fp-com-sidebar-section">
          <h3>Líderes</h3>
          <ul className="flex flex-col gap-2">
            {lideres.map((l) => (
              <li key={l.id} className="flex items-center gap-2">
                <Avatar src={l.avatarUrl} nombre={l.nombre} size={28} />
                <span className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {l.nombre}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {proximoEvento ? (
          <div className="fp-com-sidebar-section">
            <h3>Próximo evento</h3>
            <Link
              to={ROUTES.communities.event(comunidad.id, proximoEvento.id)}
              className="block rounded-xl p-3"
              style={{ background: 'var(--bg-overlay)' }}
            >
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {proximoEvento.titulo}
              </p>
              <p className="flex items-center gap-1.5 text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Calendar size={12} />
                {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
                  new Date(proximoEvento.inicioEn),
                )}
              </p>
              <p className="flex items-center gap-1.5 text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                <MapPin size={12} />
                {proximoEvento.lugar}
              </p>
            </Link>
          </div>
        ) : null}

        <div className="fp-com-sidebar-section">
          <h3>Miembros ({miembros.length})</h3>
          <div className="flex -space-x-2">
            {miembros.slice(0, 8).map((m) => (
              <Avatar key={m.id} src={m.avatarUrl} nombre={m.nombre} size={30} ringColor="var(--bg-base)" />
            ))}
          </div>
          <Link
            to={ROUTES.communities.members(comunidad.id)}
            className="block mt-3 text-xs font-semibold"
            style={{ color: 'var(--accent-pink)' }}
          >
            Ver todos
          </Link>
        </div>
      </div>
    </aside>
  );
}
