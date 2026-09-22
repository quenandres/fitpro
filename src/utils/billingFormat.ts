import type { Periodicidad } from '../types/billing';

const PERIODICIDAD_MESES: Record<Periodicidad, number> = {
  mensual: 1,
  trimestral: 3,
  semestral: 6,
  anual: 12,
};

/** Formatea un monto en pesos colombianos: `$59.900`. */
export function formatCOP(monto: number): string {
  return `$${monto.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
}

/** Fecha legible en español: `7 sep 2026`. */
export function formatFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Fecha con hora: `7 sep 2026, 10:05`. */
export function formatFechaHora(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Días restantes hasta la fecha de vencimiento (negativo si ya pasó). */
export function diasHastaVencimiento(fechaIso: string, ahora = new Date()): number {
  const vencimiento = new Date(fechaIso);
  vencimiento.setHours(0, 0, 0, 0);
  const hoy = new Date(ahora);
  hoy.setHours(0, 0, 0, 0);
  const diffMs = vencimiento.getTime() - hoy.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/** Calcula la próxima fecha de renovación según la periodicidad del plan. */
export function calcularProximaRenovacion(
  desdeIso: string,
  periodicidad: Periodicidad,
): string {
  const fecha = new Date(desdeIso);
  fecha.setMonth(fecha.getMonth() + PERIODICIDAD_MESES[periodicidad]);
  return fecha.toISOString();
}

/** Etiqueta legible de periodicidad. */
export function labelPeriodicidad(periodicidad: Periodicidad): string {
  const labels: Record<Periodicidad, string> = {
    mensual: 'Mensual',
    trimestral: 'Trimestral',
    semestral: 'Semestral',
    anual: 'Anual',
  };
  return labels[periodicidad];
}

/** Etiqueta legible de método de pago. */
export function labelMetodoPago(metodo: string): string {
  const labels: Record<string, string> = {
    pse: 'PSE',
    tarjeta: 'Tarjeta',
    nequi: 'Nequi',
    daviplata: 'Daviplata',
    efectivo: 'Efectivo',
  };
  return labels[metodo] ?? metodo;
}
