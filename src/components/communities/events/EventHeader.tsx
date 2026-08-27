import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import type { EventoComunidad } from '../../../types/community';

interface EventHeaderProps {
  evento: EventoComunidad;
  confirmados: number;
}

export function EventHeader({ evento, confirmados }: EventHeaderProps) {
  const inicio = new Date(evento.inicioEn);
  const fin = new Date(evento.finEn);

  return (
    <div className="fp-com-header">
      {evento.imagenUrl ? <img src={evento.imagenUrl} alt="" className="fp-com-header-cover" /> : null}
      <div className="fp-com-header-body">
        <h1 className="font-sora text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {evento.titulo}
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{evento.descripcion}</p>

        <div className="flex flex-col gap-2 mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <span className="flex items-center gap-2">
            <Calendar size={15} />
            {new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(inicio)}
          </span>
          <span className="flex items-center gap-2">
            <Clock size={15} />
            {new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(inicio)} –{' '}
            {new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(fin)}
          </span>
          <span className="flex items-center gap-2">
            <MapPin size={15} />
            {evento.lugar}
          </span>
          <span className="flex items-center gap-2">
            <Users size={15} />
            {confirmados}
            {evento.cupoMax != null ? ` / ${evento.cupoMax}` : ''} confirmados
          </span>
        </div>
      </div>
    </div>
  );
}
