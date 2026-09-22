import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  PauseCircle,
  RefreshCw,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import type { EstadoPago, EstadoSuscripcion } from '../../types/billing';

export interface BillingMeta {
  label: string;
  color: string;
  Icon: LucideIcon;
}

export const SUSCRIPCION_ESTADO_META: Record<EstadoSuscripcion, BillingMeta> = {
  activa: { label: 'Activa', color: 'var(--brand)', Icon: CheckCircle2 },
  por_vencer: { label: 'Por vencer', color: 'var(--accent-orange)', Icon: AlertTriangle },
  vencida: { label: 'Vencida', color: 'var(--accent-red)', Icon: XCircle },
  pendiente: { label: 'Pendiente', color: 'var(--accent-purple)', Icon: Clock },
  cancelada: { label: 'Cancelada', color: 'var(--text-muted)', Icon: Ban },
  suspendida: { label: 'Suspendida', color: 'var(--accent-red)', Icon: PauseCircle },
};

export const PAGO_ESTADO_META: Record<EstadoPago, BillingMeta> = {
  aprobado: { label: 'Aprobado', color: 'var(--brand)', Icon: CheckCircle2 },
  pendiente: { label: 'Pendiente', color: 'var(--accent-purple)', Icon: Clock },
  rechazado: { label: 'Rechazado', color: 'var(--accent-red)', Icon: XCircle },
  cancelado: { label: 'Cancelado', color: 'var(--text-muted)', Icon: Ban },
  reembolsado: { label: 'Reembolsado', color: 'var(--accent-orange)', Icon: RotateCcw },
};

export const SUSCRIPCION_TABS: Array<{ key: EstadoSuscripcion | 'todas'; label: string }> = [
  { key: 'todas', label: 'Todas' },
  { key: 'activa', label: 'Activas' },
  { key: 'por_vencer', label: 'Por vencer' },
  { key: 'vencida', label: 'Vencidas' },
  { key: 'cancelada', label: 'Canceladas' },
];

export const PAGO_TABS: Array<{ key: EstadoPago | 'todos'; label: string }> = [
  { key: 'todos', label: 'Todos' },
  { key: 'aprobado', label: 'Aprobados' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'rechazado', label: 'Rechazados' },
  { key: 'reembolsado', label: 'Reembolsados' },
];

export const EVENTO_TIPO_ICON: Record<string, LucideIcon> = {
  creada: CheckCircle2,
  pago_recibido: CheckCircle2,
  renovacion: RefreshCw,
  cambio_plan: RefreshCw,
  suspension: PauseCircle,
  cancelacion: Ban,
  pago_fallido: XCircle,
};
