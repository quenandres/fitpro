/**
 * Tipos de dominio del Dashboard Admin (100% mock, ver src/data/adminDashboard/*.json).
 * No tiene relación con el modelo de rutinas/comunidades reales — es una vista
 * de solo lectura sobre datos hardcodeados, pensada para ilustrar 3 variantes
 * por rol mientras no exista backend de métricas.
 */

export type RolDashboard = 'superadmin' | 'entrenador' | 'lider_comunidad';

export const ROLES_DASHBOARD: readonly RolDashboard[] = ['superadmin', 'entrenador', 'lider_comunidad'];

export const ROLE_LABEL: Record<RolDashboard, string> = {
  superadmin: 'Superadmin',
  entrenador: 'Entrenador',
  lider_comunidad: 'Líder de comunidad',
};

/** AuthUser.role es un string libre sin enum en el frontend hoy; si no coincide
 * con ninguno de los 3 valores esperados (incluido `undefined`, caso normal
 * mientras el backend no los envíe), se usa 'entrenador' como fallback. */
export function resolveDashboardRole(role?: string): RolDashboard {
  if (role === 'superadmin' || role === 'entrenador' || role === 'lider_comunidad') return role;
  return 'entrenador';
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
