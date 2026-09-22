import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Pago, Plan } from '../../../types/billing';
import { ROUTES } from '../../../routes/paths';
import { formatCOP, formatFechaHora, labelMetodoPago } from '../../../utils/billingFormat';
import { EstadoBadge } from '../shared/EstadoBadge';
import { PAGO_ESTADO_META } from '../shared/billingMeta';

interface Props {
  pago: Pago;
  plan?: Plan;
}

export function PagoRow({ pago, plan }: Props) {
  const meta = PAGO_ESTADO_META[pago.estado];

  return (
    <Link
      to={ROUTES.library.pago(pago.id)}
      className="fp-bill-row-link"
    >
      <article className="fp-card fp-card-hover relative overflow-hidden">
        <div className="fp-accent-bar" style={{ background: meta.color }} aria-hidden />
        <div className="fp-bill-row-inner">
          <div className="fp-bill-row-top">
            <div className="min-w-0 flex-1">
              <p className="fp-bill-row-title">{pago.usuarioNombre}</p>
              <p className="fp-bill-row-sub">
                {plan?.nombre ?? 'Plan desconocido'} · {labelMetodoPago(pago.metodo)} · {pago.proveedor}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col items-end gap-1">
                <span className="fp-bill-monto">{formatCOP(pago.monto)}</span>
                <EstadoBadge estado={pago.estado} tipo="pago" />
              </div>
              <ChevronRight size={16} className="fp-bill-row-chevron" aria-hidden />
            </div>
          </div>
          <div className="fp-bill-row-meta">
            <span>{formatFechaHora(pago.fecha)}</span>
            <span className="truncate">{pago.transaccionId}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
