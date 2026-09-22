import { useMemo } from 'react';
import { create } from 'zustand';
import type {
  CancelarSuscripcionInput,
  EstadoPago,
  EstadoSuscripcion,
  EventoSuscripcion,
  Pago,
  Plan,
  Suscripcion,
  TipoEventoSuscripcion,
  WebhookEstadoPago,
  WebhookPagoPayload,
} from '../types/billing';
import planesData from '../data/billing/planes.json';
import suscripcionesData from '../data/billing/suscripciones.json';
import pagosData from '../data/billing/pagos.json';
import eventosData from '../data/billing/eventos-suscripcion.json';
import { calcularProximaRenovacion } from '../utils/billingFormat';

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

function mapWebhookEstado(estado: WebhookEstadoPago): EstadoPago {
  const map: Record<WebhookEstadoPago, EstadoPago> = {
    APPROVED: 'aprobado',
    REJECTED: 'rechazado',
    PENDING: 'pendiente',
    CANCELLED: 'cancelado',
    REFUNDED: 'reembolsado',
  };
  return map[estado];
}

interface BillingStore {
  planes: Plan[];
  suscripciones: Suscripcion[];
  pagos: Pago[];
  eventos: EventoSuscripcion[];

  activarSuscripcion: (id: string) => void;
  suspenderSuscripcion: (id: string) => void;
  renovarSuscripcion: (id: string) => void;
  cancelarSuscripcion: (id: string, input: CancelarSuscripcionInput) => void;
  cambiarPlan: (id: string, planId: string) => void;
  registrarPagoWebhook: (payload: WebhookPagoPayload) => string;
}

function appendEvento(
  eventos: EventoSuscripcion[],
  suscripcionId: string,
  tipo: TipoEventoSuscripcion,
  descripcion: string,
  extra?: Pick<EventoSuscripcion, 'monto' | 'transaccionId'>,
): EventoSuscripcion[] {
  const evento: EventoSuscripcion = {
    id: uid('evt'),
    suscripcionId,
    tipo,
    fecha: new Date().toISOString(),
    descripcion,
    ...extra,
  };
  return [...eventos, evento];
}

export const useBillingStore = create<BillingStore>((set, get) => ({
  planes: planesData as Plan[],
  suscripciones: suscripcionesData as Suscripcion[],
  pagos: pagosData as Pago[],
  eventos: eventosData as EventoSuscripcion[],

  activarSuscripcion: (id) => {
    const state = get();
    const suscripcion = state.suscripciones.find((s) => s.id === id);
    if (!suscripcion) return;

    const plan = state.planes.find((p) => p.id === suscripcion.planId);
    if (!plan) return;

    const now = new Date().toISOString();
    const proximaRenovacion = calcularProximaRenovacion(now, plan.periodicidad);

    set({
      suscripciones: state.suscripciones.map((s) =>
        s.id === id
          ? {
              ...s,
              estado: 'activa' as EstadoSuscripcion,
              proximaRenovacion,
              autoRenovacion: true,
              cancelacion: undefined,
            }
          : s,
      ),
      eventos: appendEvento(
        state.eventos,
        id,
        'renovacion',
        `Suscripción activada manualmente (${plan.nombre})`,
      ),
    });
  },

  suspenderSuscripcion: (id) => {
    const state = get();
    set({
      suscripciones: state.suscripciones.map((s) =>
        s.id === id ? { ...s, estado: 'suspendida' as EstadoSuscripcion, autoRenovacion: false } : s,
      ),
      eventos: appendEvento(state.eventos, id, 'suspension', 'Suscripción suspendida por el administrador'),
    });
  },

  renovarSuscripcion: (id) => {
    const state = get();
    const suscripcion = state.suscripciones.find((s) => s.id === id);
    if (!suscripcion) return;

    const plan = state.planes.find((p) => p.id === suscripcion.planId);
    if (!plan) return;

    const proximaRenovacion = calcularProximaRenovacion(
      suscripcion.proximaRenovacion,
      plan.periodicidad,
    );

    set({
      suscripciones: state.suscripciones.map((s) =>
        s.id === id
          ? {
              ...s,
              estado: 'activa' as EstadoSuscripcion,
              proximaRenovacion,
              autoRenovacion: true,
            }
          : s,
      ),
      eventos: appendEvento(
        state.eventos,
        id,
        'renovacion',
        `Renovación manual hasta ${new Date(proximaRenovacion).toLocaleDateString('es-CO')}`,
        { monto: plan.precio },
      ),
    });
  },

  cancelarSuscripcion: (id, input) => {
    const state = get();
    const suscripcion = state.suscripciones.find((s) => s.id === id);
    if (!suscripcion) return;

    const now = new Date().toISOString();
    const efectivaEn = input.mantieneAcceso ? suscripcion.proximaRenovacion : now;

    set({
      suscripciones: state.suscripciones.map((s) =>
        s.id === id
          ? {
              ...s,
              estado: 'cancelada' as EstadoSuscripcion,
              autoRenovacion: false,
              cancelacion: {
                solicitadaEn: now,
                efectivaEn,
                motivo: input.motivo.trim(),
                solicitadaPor: 'administrador',
              },
            }
          : s,
      ),
      eventos: appendEvento(
        state.eventos,
        id,
        'cancelacion',
        `Cancelación: ${input.motivo.trim()}${input.mantieneAcceso ? ' (acceso hasta fin de período)' : ''}`,
      ),
    });
  },

  cambiarPlan: (id, planId) => {
    const state = get();
    const suscripcion = state.suscripciones.find((s) => s.id === id);
    const plan = state.planes.find((p) => p.id === planId);
    if (!suscripcion || !plan) return;

    set({
      suscripciones: state.suscripciones.map((s) =>
        s.id === id ? { ...s, planId } : s,
      ),
      eventos: appendEvento(
        state.eventos,
        id,
        'cambio_plan',
        `Cambio de plan a ${plan.nombre}`,
      ),
    });
  },

  registrarPagoWebhook: (payload) => {
    const state = get();
    const suscripcion = state.suscripciones.find((s) => s.id === payload.suscripcionId);
    if (!suscripcion) return '';

    const plan = state.planes.find((p) => p.id === suscripcion.planId);
    if (!plan) return '';

    const now = new Date().toISOString();
    const estadoPago = mapWebhookEstado(payload.estado);
    const pagoId = uid('pay');

    const pago: Pago = {
      id: pagoId,
      suscripcionId: payload.suscripcionId,
      usuarioId: suscripcion.usuarioId,
      usuarioNombre: suscripcion.usuarioNombre,
      planId: suscripcion.planId,
      monto: payload.monto,
      moneda: 'COP',
      fecha: now,
      metodo: payload.metodo,
      proveedor: payload.proveedor,
      transaccionId: payload.transaccionId,
      referenciaExterna: payload.referenciaExterna,
      estado: estadoPago,
      motivoRechazo: payload.motivoRechazo,
      confirmadoEn: payload.estado === 'APPROVED' ? now : undefined,
      origenApp: 'fitpro-webhook-demo',
    };

    let suscripciones = state.suscripciones;
    const eventoTipo = payload.estado === 'REJECTED' ? 'pago_fallido' : 'pago_recibido';
    const eventoDesc =
      payload.estado === 'REJECTED'
        ? payload.motivoRechazo ?? 'Pago rechazado vía webhook'
        : `Webhook: pago ${estadoPago}`;
    let eventos = appendEvento(state.eventos, payload.suscripcionId, eventoTipo, eventoDesc, {
      monto: payload.monto,
      transaccionId: payload.transaccionId,
    });

    if (payload.estado === 'APPROVED') {
      const proximaRenovacion = calcularProximaRenovacion(now, plan.periodicidad);
      suscripciones = suscripciones.map((s) =>
        s.id === payload.suscripcionId
          ? {
              ...s,
              estado: 'activa' as EstadoSuscripcion,
              proximaRenovacion,
              autoRenovacion: true,
            }
          : s,
      );
      eventos = appendEvento(
        eventos,
        payload.suscripcionId,
        'renovacion',
        'Suscripción activada tras pago aprobado',
        { monto: payload.monto, transaccionId: payload.transaccionId },
      );
    }

    set({
      pagos: [...state.pagos, pago],
      suscripciones,
      eventos,
    });

    return pagoId;
  },
}));

export function usePlanById(planId: string | undefined) {
  return useBillingStore((s) => s.planes.find((p) => p.id === planId));
}

export function useSuscripcion(id: string | undefined) {
  return useBillingStore((s) => s.suscripciones.find((sub) => sub.id === id));
}

export function usePagosDeSuscripcion(suscripcionId: string | undefined) {
  const pagos = useBillingStore((s) => s.pagos);
  return useMemo(
    () =>
      pagos
        .filter((p) => p.suscripcionId === suscripcionId)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    [pagos, suscripcionId],
  );
}

export function useEventosDeSuscripcion(suscripcionId: string | undefined) {
  const eventos = useBillingStore((s) => s.eventos);
  return useMemo(
    () =>
      eventos
        .filter((e) => e.suscripcionId === suscripcionId)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    [eventos, suscripcionId],
  );
}

export function useSuscripcionesPorEstado(estado: EstadoSuscripcion | 'todas') {
  const suscripciones = useBillingStore((s) => s.suscripciones);
  return useMemo(
    () =>
      estado === 'todas'
        ? suscripciones
        : suscripciones.filter((s) => s.estado === estado),
    [suscripciones, estado],
  );
}

export function useAllPlanes() {
  return useBillingStore((s) => s.planes);
}

export function useAllPagos() {
  return useBillingStore((s) => s.pagos);
}
