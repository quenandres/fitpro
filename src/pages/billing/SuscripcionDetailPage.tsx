import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  Ban,
  CheckCircle2,
  CreditCard,
  PauseCircle,
  RefreshCw,
  Repeat,
  Shuffle,
} from 'lucide-react';
import { PageBackRow } from '../../components/common/PageBackButton';
import { ActionMenu } from '../../components/common/ActionMenu';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DemoBadge } from '../../components/common/DemoBadge';
import { EstadoBadge } from '../../components/billing/shared/EstadoBadge';
import { PagoRow } from '../../components/billing/cards/PagoRow';
import { SuscripcionTimeline } from '../../components/billing/SuscripcionTimeline';
import { CancelarSuscripcionSheet } from '../../components/billing/modals/CancelarSuscripcionSheet';
import { CambiarPlanSheet } from '../../components/billing/modals/CambiarPlanSheet';
import { useToastHook } from '../../components/common/Toast';
import {
  useAllPlanes,
  useBillingStore,
  useEventosDeSuscripcion,
  usePagosDeSuscripcion,
  usePlanById,
  useSuscripcion,
} from '../../store/useBillingStore';
import { ROUTES } from '../../routes/paths';
import { getSuscripcionBack } from '../../utils/billingBackUtils';
import {
  diasHastaVencimiento,
  formatCOP,
  formatFecha,
  labelPeriodicidad,
} from '../../utils/billingFormat';

export function SuscripcionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const suscripcion = useSuscripcion(id);
  const plan = usePlanById(suscripcion?.planId);
  const pagos = usePagosDeSuscripcion(id);
  const eventos = useEventosDeSuscripcion(id);
  const planes = useAllPlanes();
  const toast = useToastHook();

  const activarSuscripcion = useBillingStore((s) => s.activarSuscripcion);
  const suspenderSuscripcion = useBillingStore((s) => s.suspenderSuscripcion);
  const renovarSuscripcion = useBillingStore((s) => s.renovarSuscripcion);
  const cancelarSuscripcion = useBillingStore((s) => s.cancelarSuscripcion);
  const cambiarPlan = useBillingStore((s) => s.cambiarPlan);
  const registrarPagoWebhook = useBillingStore((s) => s.registrarPagoWebhook);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showCancelSheet, setShowCancelSheet] = useState(false);
  const [showCambiarPlan, setShowCambiarPlan] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'activar' | 'suspender' | 'renovar' | 'simular' | null>(null);

  if (!suscripcion) {
    return <Navigate to={ROUTES.library.suscripciones} replace />;
  }

  const back = getSuscripcionBack();
  const dias = diasHastaVencimiento(suscripcion.proximaRenovacion);

  const menuItems = [
    ...(suscripcion.estado !== 'activa'
      ? [{ key: 'activar', label: 'Activar', icon: CheckCircle2, onSelect: () => setConfirmAction('activar') }]
      : []),
    ...(suscripcion.estado !== 'suspendida' && suscripcion.estado !== 'cancelada'
      ? [{ key: 'suspender', label: 'Suspender', icon: PauseCircle, onSelect: () => setConfirmAction('suspender') }]
      : []),
    ...(suscripcion.estado !== 'cancelada'
      ? [{ key: 'renovar', label: 'Renovar', icon: RefreshCw, onSelect: () => setConfirmAction('renovar') }]
      : []),
    ...(suscripcion.estado !== 'cancelada'
      ? [{ key: 'cambiar', label: 'Cambiar plan', icon: Shuffle, onSelect: () => setShowCambiarPlan(true) }]
      : []),
    ...(suscripcion.estado !== 'cancelada'
      ? [{ key: 'cancelar', label: 'Cancelar', icon: Ban, onSelect: () => setShowCancelSheet(true), danger: true }]
      : []),
    ...(suscripcion.estado === 'pendiente' || suscripcion.estado === 'vencida'
      ? [{ key: 'simular', label: 'Simular pago recibido', icon: CreditCard, onSelect: () => setConfirmAction('simular') }]
      : []),
  ];

  const handleConfirm = () => {
    if (!confirmAction) return;

    switch (confirmAction) {
      case 'activar':
        activarSuscripcion(suscripcion.id);
        toast.success('Suscripción activada');
        break;
      case 'suspender':
        suspenderSuscripcion(suscripcion.id);
        toast.success('Suscripción suspendida');
        break;
      case 'renovar':
        renovarSuscripcion(suscripcion.id);
        toast.success('Suscripción renovada');
        break;
      case 'simular': {
        if (!plan) break;
        const pagoId = registrarPagoWebhook({
          suscripcionId: suscripcion.id,
          monto: plan.precio,
          metodo: 'tarjeta',
          proveedor: 'Wompi',
          transaccionId: `demo-tx-${Date.now()}`,
          referenciaExterna: `REF-DEMO-${Date.now()}`,
          estado: 'APPROVED',
        });
        toast.success(pagoId ? 'Pago simulado y suscripción activada' : 'No se pudo simular el pago');
        break;
      }
    }
    setConfirmAction(null);
  };

  const confirmLabels: Record<NonNullable<typeof confirmAction>, { title: string; message: string; confirm: string }> = {
    activar: {
      title: 'Activar suscripción',
      message: `¿Activar la suscripción de ${suscripcion.usuarioNombre}?`,
      confirm: 'Activar',
    },
    suspender: {
      title: 'Suspender suscripción',
      message: `¿Suspender el acceso de ${suscripcion.usuarioNombre}?`,
      confirm: 'Suspender',
    },
    renovar: {
      title: 'Renovar suscripción',
      message: `¿Renovar manualmente la suscripción de ${suscripcion.usuarioNombre}?`,
      confirm: 'Renovar',
    },
    simular: {
      title: 'Simular pago recibido',
      message: `Se registrará un pago aprobado de ${plan ? formatCOP(plan.precio) : '—'} y se activará la suscripción.`,
      confirm: 'Simular pago',
    },
  };

  return (
    <div className="flex flex-col gap-4">
      <PageBackRow to={back.to} label={back.label} />

      <article className="fp-card relative overflow-hidden">
        <div className="fp-accent-bar" style={{ background: 'var(--accent-blue)' }} aria-hidden />
        <div style={{ padding: '16px 16px 16px 19px' }}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              {suscripcion.usuarioAvatarUrl ? (
                <img src={suscripcion.usuarioAvatarUrl} alt="" className="fp-bill-avatar fp-bill-avatar-lg" />
              ) : (
                <span className="fp-bill-avatar fp-bill-avatar-lg fp-bill-avatar-fallback">
                  {suscripcion.usuarioNombre.charAt(0)}
                </span>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1
                    className="font-sora"
                    style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.02em', color: 'var(--text-primary)' }}
                  >
                    {suscripcion.usuarioNombre}
                  </h1>
                  <DemoBadge label="Demo · mock" />
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {plan?.nombre ?? 'Plan desconocido'}
                  {plan ? ` · ${formatCOP(plan.precio)}/${labelPeriodicidad(plan.periodicidad).toLowerCase()}` : ''}
                </p>
                <div className="mt-2">
                  <EstadoBadge estado={suscripcion.estado} />
                </div>
              </div>
            </div>
            {menuItems.length > 0 ? (
              <ActionMenu
                open={menuOpen}
                onOpenChange={setMenuOpen}
                items={menuItems}
                ariaLabel="Acciones de suscripción"
              />
            ) : null}
          </div>
        </div>
      </article>

      <article className="fp-card" style={{ padding: 16 }}>
        <div className="fp-bill-detail-grid">
          <div className="fp-bill-detail-field">
            <span className="fp-cal-label">Inicio</span>
            <span className="fp-bill-detail-value">{formatFecha(suscripcion.inicio)}</span>
          </div>
          <div className="fp-bill-detail-field">
            <span className="fp-cal-label">Próxima renovación</span>
            <span className="fp-bill-detail-value">{formatFecha(suscripcion.proximaRenovacion)}</span>
          </div>
          <div className="fp-bill-detail-field">
            <span className="fp-cal-label">Auto-renovación</span>
            <span className="fp-bill-detail-value">{suscripcion.autoRenovacion ? 'Sí' : 'No'}</span>
          </div>
          {suscripcion.estado === 'por_vencer' && dias >= 0 ? (
            <div className="fp-bill-detail-field">
              <span className="fp-cal-label">Días restantes</span>
              <span className="fp-bill-detail-value" style={{ color: 'var(--accent-orange)' }}>
                {dias} {dias === 1 ? 'día' : 'días'}
              </span>
            </div>
          ) : null}
        </div>
      </article>

      {suscripcion.cancelacion ? (
        <div className="fp-bill-cancel-block">
          <h2 className="font-sora" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            Cancelación
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {suscripcion.cancelacion.motivo}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
            Solicitada el {formatFecha(suscripcion.cancelacion.solicitadaEn)} · Efectiva el{' '}
            {formatFecha(suscripcion.cancelacion.efectivaEn)} · Por{' '}
            {suscripcion.cancelacion.solicitadaPor}
          </p>
        </div>
      ) : null}

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-sora" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
            Pagos ({pagos.length})
          </h2>
          <Link
            to={ROUTES.library.pagos}
            className="text-xs font-semibold inline-flex items-center gap-1"
            style={{ color: 'var(--brand)' }}
          >
            <Repeat size={12} />
            Ver todos
          </Link>
        </div>
        {pagos.length === 0 ? (
          <p className="fp-bill-timeline-empty">Sin pagos registrados para esta suscripción.</p>
        ) : (
          <div className="fp-bill-list">
            {pagos.slice(0, 5).map((pago) => (
              <PagoRow key={pago.id} pago={pago} plan={plan ?? undefined} />
            ))}
          </div>
        )}
      </section>

      <article className="fp-card" style={{ padding: 16 }}>
        <h2 className="font-sora" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
          Historial
        </h2>
        <SuscripcionTimeline eventos={eventos} />
      </article>

      <CancelarSuscripcionSheet
        open={showCancelSheet}
        onClose={() => setShowCancelSheet(false)}
        usuarioNombre={suscripcion.usuarioNombre}
        onConfirm={(motivo, mantieneAcceso) => {
          cancelarSuscripcion(suscripcion.id, { motivo, mantieneAcceso });
          setShowCancelSheet(false);
          toast.success('Suscripción cancelada');
        }}
      />

      <CambiarPlanSheet
        open={showCambiarPlan}
        onClose={() => setShowCambiarPlan(false)}
        planes={planes}
        planActualId={suscripcion.planId}
        onConfirm={(planId) => {
          cambiarPlan(suscripcion.id, planId);
          setShowCambiarPlan(false);
          toast.success('Plan actualizado');
        }}
      />

      {confirmAction ? (
        <ConfirmDialog
          open
          title={confirmLabels[confirmAction].title}
          description={confirmLabels[confirmAction].message}
          confirmLabel={confirmLabels[confirmAction].confirm}
          onConfirm={handleConfirm}
          onClose={() => setConfirmAction(null)}
          danger={confirmAction === 'suspender'}
        />
      ) : null}
    </div>
  );
}
