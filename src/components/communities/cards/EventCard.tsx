import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';
import { ROUTES } from '../../../routes/paths';
import type { EventoComunidad } from '../../../types/community';

interface EventCardProps {
  evento: EventoComunidad;
}

export function EventCard({ evento }: EventCardProps) {
  const confirmados = evento.participantes.filter((p) => p.estado === 'confirmado').length;
  const lleno = evento.cupoMax != null && confirmados >= evento.cupoMax;

  return (
    <Link to={ROUTES.communities.event(evento.comunidadId, evento.id)} className="fp-com-card fp-com-card-hover block">
      {evento.imagenUrl ? (
        <img src={evento.imagenUrl} alt="" className="w-full h-32 object-cover rounded-lg -mt-1 mb-3" />
      ) : null}

      <h3 className="font-sora font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
        {evento.titulo}
      </h3>

      <p className="flex items-center gap-1.5 text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
        <Calendar size={13} />
        {new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
          new Date(evento.inicioEn),
        )}
      </p>
      <p className="flex items-center gap-1.5 text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
        <MapPin size={13} />
        {evento.lugar}
      </p>
      <p className="flex items-center gap-1.5 text-xs mt-1" style={{ color: lleno ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
        <Users size={13} />
        {confirmados}
        {evento.cupoMax != null ? ` / ${evento.cupoMax}` : ''} confirmados
        {lleno ? ' · Cupo lleno' : ''}
      </p>
    </Link>
  );
}
