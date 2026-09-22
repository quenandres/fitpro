import type { EventoSuscripcion } from '../../types/billing';
import { formatFechaHora, formatCOP } from '../../utils/billingFormat';
import { EVENTO_TIPO_ICON } from './shared/billingMeta';

interface Props {
  eventos: EventoSuscripcion[];
}

export function SuscripcionTimeline({ eventos }: Props) {
  if (eventos.length === 0) {
    return (
      <p className="fp-bill-timeline-empty">Sin eventos registrados.</p>
    );
  }

  return (
    <ol className="fp-bill-timeline">
      {eventos.map((evento, index) => {
        const Icon = EVENTO_TIPO_ICON[evento.tipo] ?? EVENTO_TIPO_ICON.creada;
        const isLast = index === eventos.length - 1;

        return (
          <li key={evento.id} className="fp-bill-timeline-item">
            <div className="fp-bill-timeline-marker" aria-hidden>
              <span className="fp-bill-timeline-dot">
                <Icon size={12} />
              </span>
              {!isLast ? <span className="fp-bill-timeline-line" /> : null}
            </div>
            <div className="fp-bill-timeline-content">
              <p className="fp-bill-timeline-desc">{evento.descripcion}</p>
              <p className="fp-bill-timeline-meta">
                {formatFechaHora(evento.fecha)}
                {evento.monto != null ? ` · ${formatCOP(evento.monto)}` : ''}
                {evento.transaccionId ? ` · ${evento.transaccionId}` : ''}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
