/**
 * Tipos de dominio del Dashboard Admin (100% mock, ver src/data/adminDashboard/*.json).
 * No tiene relación con el modelo de rutinas/comunidades reales — es una vista
 * de solo lectura sobre datos hardcodeados, pensada para ilustrar 3 variantes
 * por rol mientras no exista backend de métricas.
 */

import { mapRoleFromGateway, type PlatformRole } from './platformRole';

export type RolDashboard = PlatformRole;

export const ROLES_DASHBOARD: readonly RolDashboard[] = ['superadmin', 'admin', 'entrenador'];

export const ROLE_LABEL: Record<RolDashboard, string> = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  entrenador: 'Entrenador',
};

/** Mapea rol del gateway (trainer → entrenador) al rol de dashboard. */
export function resolveDashboardRole(role?: string): RolDashboard {
  if (role === 'superadmin' || role === 'admin' || role === 'entrenador') return role;
  return mapRoleFromGateway(role);
}

export interface KpiResumen {
  label: string;
  valor: number | string;
}

export interface PuntoSerieTemporal {
  fecha: string;
  valor: number;
}

export interface PuntoComparativo {
  etiqueta: string;
  valor: number;
}

export type SeveridadAlerta = 'alta' | 'media' | 'baja';

export interface AlertaAtencion {
  id: string;
  titulo: string;
  detalle: string;
  severidad: SeveridadAlerta;
}

export interface ItemDestacado {
  id: string;
  titulo: string;
  detalle: string;
  metrica: string;
}

export interface SuperadminMetrics {
  kpis: KpiResumen[];
  usuariosActivos: PuntoSerieTemporal[];
  nuevosVsActivos: { etiqueta: string; nuevos: number; activos: number }[];
  cumplimiento: PuntoSerieTemporal[];
  usuariosPorCumplimiento: PuntoComparativo[];
  comunidadesActivas: PuntoComparativo[];
  crecimientoMiembros: PuntoSerieTemporal[];
  actividadSocial: { fecha: string; posts: number; comentarios: number; reacciones: number }[];
  eventos: PuntoComparativo[];
  asistencia: PuntoComparativo[];
  usuariosEnRiesgo: AlertaAtencion[];
  comunidadesInactivas: AlertaAtencion[];
  eventosBajaAsistencia: AlertaAtencion[];
}

export interface EntrenadorMetrics {
  kpis: KpiResumen[];
  cumplimiento: PuntoSerieTemporal[];
  progreso: PuntoSerieTemporal[];
  usuariosPorCumplimiento: PuntoComparativo[];
  comunidadesAdministradas: PuntoComparativo[];
  actividadSocial: { fecha: string; publicaciones: number; discusiones: number }[];
  eventos: PuntoComparativo[];
  participacion: PuntoComparativo[];
  usuariosEnRiesgo: AlertaAtencion[];
  notificaciones: AlertaAtencion[];
}

export interface LiderComunidadMetrics {
  kpis: KpiResumen[];
  nuevosMiembros: PuntoSerieTemporal[];
  actividadSocial: { fecha: string; publicaciones: number; comentarios: number; reacciones: number }[];
  discusiones: PuntoComparativo[];
  eventos: PuntoComparativo[];
  asistencia: PuntoComparativo[];
  contenidoPopular: ItemDestacado[];
}
