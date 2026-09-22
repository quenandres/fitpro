export type EstadoSuscripcion =
  | 'pendiente'
  | 'activa'
  | 'por_vencer'
  | 'vencida'
  | 'cancelada'
  | 'suspendida';

export type EstadoPago =
  | 'pendiente'
  | 'aprobado'
  | 'rechazado'
  | 'cancelado'
  | 'reembolsado';

export type MetodoPago = 'pse' | 'tarjeta' | 'nequi' | 'daviplata' | 'efectivo';
export type Periodicidad = 'mensual' | 'trimestral' | 'semestral' | 'anual';

export interface Plan {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  moneda: 'COP';
  periodicidad: Periodicidad;
  diasPrueba: number;
  activo: boolean;
  beneficios: string[];
}

export interface Suscripcion {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  usuarioAvatarUrl?: string;
  planId: string;
  estado: EstadoSuscripcion;
  inicio: string;
  proximaRenovacion: string;
  autoRenovacion: boolean;
  cancelacion?: {
    solicitadaEn: string;
    efectivaEn: string;
    motivo: string;
    solicitadaPor: 'usuario' | 'administrador';
  };
}

export type TipoEventoSuscripcion =
  | 'creada'
  | 'pago_recibido'
  | 'renovacion'
  | 'cambio_plan'
  | 'suspension'
  | 'cancelacion'
  | 'pago_fallido';

/** Timeline de auditoría de la relación usuario → plan → pagos. */
export interface EventoSuscripcion {
  id: string;
  suscripcionId: string;
  tipo: TipoEventoSuscripcion;
  fecha: string;
  descripcion: string;
  monto?: number;
  transaccionId?: string;
}

export interface Pago {
  id: string;
  suscripcionId: string;
  usuarioId: string;
  usuarioNombre: string;
  planId: string;
  monto: number;
  moneda: 'COP';
  fecha: string;
  metodo: MetodoPago;
  proveedor: string;
  transaccionId: string;
  referenciaExterna: string;
  estado: EstadoPago;
  motivoRechazo?: string;
  confirmadoEn?: string;
  origenApp: string;
}

export type WebhookEstadoPago = 'APPROVED' | 'REJECTED' | 'PENDING' | 'CANCELLED' | 'REFUNDED';

export interface WebhookPagoPayload {
  suscripcionId: string;
  monto: number;
  metodo: MetodoPago;
  proveedor: string;
  transaccionId: string;
  referenciaExterna: string;
  estado: WebhookEstadoPago;
  motivoRechazo?: string;
}

export interface CancelarSuscripcionInput {
  motivo: string;
  mantieneAcceso: boolean;
}
