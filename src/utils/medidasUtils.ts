import { SITIOS_MEDIDA } from '../data/sitiosMedida';
import type { SitioMedidaId, ValoresSitio } from '../types';

export function formatCm(value?: number): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value.toFixed(1)} cm`;
}

export function sitioHasValue(valores?: ValoresSitio): boolean {
  if (!valores) return false;
  if (valores.unico != null && !Number.isNaN(valores.unico)) return true;
  if (valores.izq != null && !Number.isNaN(valores.izq)) return true;
  if (valores.der != null && !Number.isNaN(valores.der)) return true;
  return false;
}

export function parseCmInput(raw: string): number | undefined {
  const trimmed = raw.trim().replace(',', '.');
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  if (Number.isNaN(n) || n < 0) return undefined;
  return Math.round(n * 10) / 10;
}

export function getFilledCanonicals(
  sitios: Partial<Record<SitioMedidaId, ValoresSitio>>,
): Set<string> {
  const filled = new Set<string>();
  for (const def of SITIOS_MEDIDA) {
    if (sitioHasValue(sitios[def.id])) {
      for (const canonical of def.canonicals) filled.add(canonical);
    }
  }
  return filled;
}

export function formatSitioResumen(valores: ValoresSitio | undefined, bilateral: boolean): string {
  if (!valores || !sitioHasValue(valores)) return 'Sin registrar';
  if (!bilateral) return formatCm(valores.unico);
  const parts: string[] = [];
  if (valores.der != null) parts.push(`D ${valores.der.toFixed(1)}`);
  if (valores.izq != null) parts.push(`I ${valores.izq.toFixed(1)}`);
  return parts.length ? `${parts.join(' · ')} cm` : 'Sin registrar';
}
