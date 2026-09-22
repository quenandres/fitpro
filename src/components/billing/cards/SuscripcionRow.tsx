import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Plan, Suscripcion } from '../../../types/billing';
import { ROUTES } from '../../../routes/paths';
import { formatCOP, formatFecha, diasHastaVencimiento, labelPeriodicidad } from '../../../utils/billingFormat';
import { EstadoBadge } from '../shared/EstadoBadge';
import { SUSCRIPCION_ESTADO_META } from '../shared/billingMeta';

interface Props {
  suscripcion: Suscripcion;
  plan?: Plan;
}

export function SuscripcionRow({ suscripcion, plan }: Props) {
  const meta = SUSCRIPCION_ESTADO_META[suscripcion.estado];
  const dias = diasHastaVencimiento(suscripcion.proximaRenovacion);

  return (
    <Link
      to={ROUTES.library.suscripcion(suscripcion.id)}
      className="fp-bill-row-link"
    >
      <article className="fp-card fp-card-hover relative overflow-hidden">
        <div className="fp-accent-bar" style={{ background: meta.color }} aria-hidden />
        <div className="fp-bill-row-inner">
          <div className="fp-bill-row-top">
            <div className="fp-bill-row-identity">
              {suscripcion.usuarioAvatarUrl ? (
                <img
                  src={suscripcion.usuarioAvatarUrl}
                  alt=""
                  className="fp-bill-avatar"
                />
              ) : (
                <span className="fp-bill-avatar fp-bill-avatar-fallback">
                  {suscripcion.usuarioNombre.charAt(0)}
                </span>
              )}
              <div className="min-w-0">
                <p className="fp-bill-row-title">{suscripcion.usuarioNombre}</p>
                <p className="fp-bill-row-sub">
                  {plan?.nombre ?? 'Plan desconocido'}
                  {plan ? ` · ${formatCOP(plan.precio)}/${labelPeriodicidad(plan.periodicidad).toLowerCase()}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <EstadoBadge estado={suscripcion.estado} />
              <ChevronRight size={16} className="fp-bill-row-chevron" aria-hidden />
            </div>
          </div>
          <div className="fp-bill-row-meta">
            <span>Inicio: {formatFecha(suscripcion.inicio)}</span>
            <span>Renovación: {formatFecha(suscripcion.proximaRenovacion)}</span>
            {suscripcion.estado === 'por_vencer' && dias >= 0 ? (
              <span style={{ color: 'var(--accent-orange)' }}>
                Vence en {dias} {dias === 1 ? 'día' : 'días'}
              </span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}
