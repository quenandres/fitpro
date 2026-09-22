import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import { Avatar } from '../../components/common/Avatar';
import { ROUTES } from '../../routes/paths';
import {
  useComunidad,
  useComunidadEventos,
  useComunidadMiembros,
} from '../../lib/gateway/hooks';
import { useIsLargeScreen } from '../../hooks/useMediaQuery';

/** Inicio de la comunidad: resumen para móvil (los sidebars ya cubren esto en desktop). */
export function CommunityHomePage() {
  const { id } = useParams<{ id: string }>();
  const { data: comunidad } = useComunidad(id);
  const isLargeScreen = useIsLargeScreen();
  const { data: miembros = [] } = useComunidadMiembros(id);
  const { data: eventos = [] } = useComunidadEventos(id, 'proximos');

  if (!comunidad) return null;

  const lideres = miembros.filter((m) => comunidad.liderIds.includes(m.id));
  const proximoEvento = eventos[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="fp-com-card">
        <h2 className="font-sora font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
          Sobre esta comunidad
        </h2>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          {comunidad.descripcion}
        </p>
        <Link
          to={ROUTES.communities.about(comunidad.id)}
          className="inline-block mt-3 text-xs font-semibold"
          style={{ color: 'var(--accent-pink)' }}
        >
          Ver reglas e información completa →
        </Link>
      </div>

      {!isLargeScreen && proximoEvento ? (
        <Link to={ROUTES.communities.event(comunidad.id, proximoEvento.id)} className="fp-com-card">
          <h2 className="font-sora font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
            Próximo evento
          </h2>
          <p className="text-sm font-semibold mt-2" style={{ color: 'var(--text-primary)' }}>
            {proximoEvento.titulo}
          </p>
          <p className="flex items-center gap-1.5 text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>
            <Calendar size={12} />
            {new Intl.DateTimeFormat('es-ES', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(proximoEvento.inicioEn))}
          </p>
          <p className="flex items-center gap-1.5 text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            <MapPin size={12} />
            {proximoEvento.lugar}
          </p>
        </Link>
      ) : null}

      {!isLargeScreen && lideres.length > 0 ? (
        <div className="fp-com-card">
          <h2 className="font-sora font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
            Líderes
          </h2>
          <div className="flex flex-wrap gap-3">
            {lideres.map((lider) => (
              <div key={lider.id} className="flex items-center gap-2">
                <Avatar src={lider.avatarUrl} nombre={lider.nombre} size={32} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {lider.nombre}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
