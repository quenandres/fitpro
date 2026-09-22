import type { EstadoPago, EstadoSuscripcion } from '../../../types/billing';
import { PAGO_ESTADO_META, SUSCRIPCION_ESTADO_META } from './billingMeta';

interface Props {
  estado: EstadoSuscripcion | EstadoPago;
  tipo?: 'suscripcion' | 'pago';
  className?: string;
}

export function EstadoBadge({ estado, tipo = 'suscripcion', className = '' }: Props) {
  const meta =
    tipo === 'pago'
      ? PAGO_ESTADO_META[estado as EstadoPago]
      : SUSCRIPCION_ESTADO_META[estado as EstadoSuscripcion];

  if (!meta) return null;

  const { label, color, Icon } = meta;

  return (
    <span
      className={`fp-bill-estado-badge ${className}`.trim()}
      style={{ color, borderColor: color, background: `color-mix(in srgb, ${color} 14%, transparent)` }}
    >
      <Icon size={12} aria-hidden />
      {label}
    </span>
  );
}
