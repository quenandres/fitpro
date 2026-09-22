import { Link, Navigate, useParams } from 'react-router-dom';
import { PageBackRow } from '../../components/common/PageBackButton';
import { DemoBadge } from '../../components/common/DemoBadge';
import { EstadoBadge } from '../../components/billing/shared/EstadoBadge';
import { useBillingStore, usePlanById, useSuscripcion } from '../../store/useBillingStore';
import { ROUTES } from '../../routes/paths';
import { getPagoBack } from '../../utils/billingBackUtils';
import {
  formatCOP,
  formatFechaHora,
  labelMetodoPago,
  labelPeriodicidad,
} from '../../utils/billingFormat';

export function PagoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const pago = useBillingStore((s) => s.pagos.find((p) => p.id === id));
  const suscripcion = useSuscripcion(pago?.suscripcionId);
  const plan = usePlanById(pago?.planId);

  if (!pago) {
    return <Navigate to={ROUTES.library.pagos} replace />;
  }

  const back = getPagoBack();

  return (
    <div className="flex flex-col gap-4">
      <PageBackRow to={back.to} label={back.label} />

      <article className="fp-card relative overflow-hidden">
        <div className="fp-accent-bar" style={{ background: 'var(--accent-blue)' }} aria-hidden />
        <div style={{ padding: '16px 16px 16px 19px' }}>
          <div className="flex flex-wrap items-center gap-2">
            <h1
              className="font-sora"
              style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--text-primary)' }}
            >
              {formatCOP(pago.monto)}
            </h1>
            <DemoBadge label="Demo · mock" />
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {pago.usuarioNombre} · {labelMetodoPago(pago.metodo)} · {pago.proveedor}
          </p>
          <div className="mt-2">
            <EstadoBadge estado={pago.estado} tipo="pago" />
          </div>
        </div>
      </article>

      <article className="fp-card" style={{ padding: 16 }}>
        <div className="fp-bill-detail-grid">
          <div className="fp-bill-detail-field">
            <span className="fp-cal-label">Cliente</span>
            <span className="fp-bill-detail-value">{pago.usuarioNombre}</span>
          </div>
          <div className="fp-bill-detail-field">
            <span className="fp-cal-label">Suscripción</span>
            <span className="fp-bill-detail-value">
              {suscripcion ? (
                <Link
                  to={ROUTES.library.suscripcion(suscripcion.id)}
                  style={{ color: 'var(--brand)' }}
                >
                  {suscripcion.id}
                </Link>
              ) : (
                pago.suscripcionId
              )}
            </span>
          </div>
          <div className="fp-bill-detail-field">
            <span className="fp-cal-label">Plan</span>
            <span className="fp-bill-detail-value">
              {plan ? `${plan.nombre} (${labelPeriodicidad(plan.periodicidad)})` : pago.planId}
            </span>
          </div>
          <div className="fp-bill-detail-field">
            <span className="fp-cal-label">Monto</span>
            <span className="fp-bill-detail-value">{formatCOP(pago.monto)} {pago.moneda}</span>
          </div>
          <div className="fp-bill-detail-field">
            <span className="fp-cal-label">Fecha</span>
            <span className="fp-bill-detail-value">{formatFechaHora(pago.fecha)}</span>
          </div>
          <div className="fp-bill-detail-field">
            <span className="fp-cal-label">Método</span>
            <span className="fp-bill-detail-value">{labelMetodoPago(pago.metodo)}</span>
          </div>
          <div className="fp-bill-detail-field">
            <span className="fp-cal-label">Proveedor</span>
            <span className="fp-bill-detail-value">{pago.proveedor}</span>
          </div>
          <div className="fp-bill-detail-field">
            <span className="fp-cal-label">ID transacción</span>
            <span className="fp-bill-detail-value fp-bill-mono">{pago.transaccionId}</span>
          </div>
          <div className="fp-bill-detail-field">
            <span className="fp-cal-label">Referencia externa</span>
            <span className="fp-bill-detail-value fp-bill-mono">{pago.referenciaExterna}</span>
          </div>
          <div className="fp-bill-detail-field">
            <span className="fp-cal-label">Estado</span>
            <span className="fp-bill-detail-value">
              <EstadoBadge estado={pago.estado} tipo="pago" />
            </span>
          </div>
          {pago.motivoRechazo ? (
            <div className="fp-bill-detail-field fp-bill-detail-field-full">
              <span className="fp-cal-label">Motivo de rechazo</span>
              <span className="fp-bill-detail-value" style={{ color: 'var(--accent-red)' }}>
                {pago.motivoRechazo}
              </span>
            </div>
          ) : null}
          {pago.confirmadoEn ? (
            <div className="fp-bill-detail-field">
              <span className="fp-cal-label">Confirmado en</span>
              <span className="fp-bill-detail-value">{formatFechaHora(pago.confirmadoEn)}</span>
            </div>
          ) : null}
          <div className="fp-bill-detail-field">
            <span className="fp-cal-label">Origen</span>
            <span className="fp-bill-detail-value">{pago.origenApp}</span>
          </div>
        </div>
      </article>
    </div>
  );
}
