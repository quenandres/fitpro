/**
 * Modelo de dominio del módulo Comunidades — UI pura, datos mock.
 * Sin persistencia real: fixtures en `src/data/communities/` + `useCommunitiesStore`.
 */

export type RolComunidad = 'member' | 'moderator' | 'leader';

export type CategoriaComunidad =
  | 'crossfit'
  | 'running'
  | 'fuerza'
  | 'yoga'
  | 'nutricion'
  | 'ciclismo'
  | 'calistenia';

export type VisibilidadComunidad = 'publica' | 'privada';

export interface Comunidad {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: CategoriaComunidad;
  visibilidad: VisibilidadComunidad;
  portadaUrl: string;
  avatarUrl: string;
  miembrosCount: number;
  postsCount: number;
  eventosCount: number;
  reglas: string[];
  liderIds: string[];
  creadaEn: string;
}

export interface MiembroComunidad {
  id: string;
  comunidadId: string;
  nombre: string;
  avatarUrl: string;
  rol: RolComunidad;
  bio?: string;
  unidoEn: string;
  suspendido?: boolean;
}

export type TipoReaccion = 'like' | 'fuego' | 'aplauso';

export interface Reaccion {
  tipo: TipoReaccion;
  miembroId: string;
}

export interface Comentario {
  id: string;
  postId: string;
  autorId: string;
  texto: string;
  creadoEn: string;
}

export type TipoMedia = 'imagen' | 'video';

export interface MediaPost {
  tipo: TipoMedia;
  url: string;
}

export type TipoPost = 'general' | 'logro' | 'pregunta' | 'anuncio';

export interface Post {
  id: string;
  comunidadId: string;
  autorId: string;
  tipo: TipoPost;
  texto: string;
  media: MediaPost[];
  reacciones: Reaccion[];
  comentarios: Comentario[];
  fijado?: boolean;
  creadoEn: string;
}

export type EstadoRsvp = 'confirmado' | 'lista_espera' | 'ninguno';

export interface Participante {
  miembroId: string;
  estado: EstadoRsvp;
}

export interface EventoComunidad {
  id: string;
  comunidadId: string;
  titulo: string;
  descripcion: string;
  lugar: string;
  imagenUrl?: string;
  inicioEn: string;
  finEn: string;
  cupoMax: number | null;
  participantes: Participante[];
  creadoPorId: string;
}

export interface RespuestaDiscusion {
  id: string;
  discusionId: string;
  autorId: string;
  texto: string;
  creadoEn: string;
}

export interface Discusion {
  id: string;
  comunidadId: string;
  autorId: string;
  titulo: string;
  texto: string;
  fijada?: boolean;
  cerrada?: boolean;
  respuestas: RespuestaDiscusion[];
  creadaEn: string;
}

export type EstadoInvitacion = 'pendiente' | 'aceptada' | 'rechazada';

export interface Invitacion {
  id: string;
  comunidadId: string;
  invitadaPorId: string;
  estado: EstadoInvitacion;
  creadaEn: string;
}

export type TipoNotificacion =
  | 'reaccion'
  | 'comentario'
  | 'evento'
  | 'invitacion'
  | 'discusion'
  | 'moderacion';

export interface NotificacionComunidad {
  id: string;
  tipo: TipoNotificacion;
  comunidadId: string;
  texto: string;
  /** Ruta relativa a la que hace deep-link (ej. `/communities/:id/posts/:postId`) */
  ruta: string;
  leida: boolean;
  creadaEn: string;
}

export type MotivoReporte = 'spam' | 'contenido_inapropiado' | 'acoso' | 'otro';

export type EstadoReporte = 'pendiente' | 'resuelto';

export interface Reporte {
  id: string;
  comunidadId: string;
  postId?: string;
  discusionId?: string;
  reportadoPorId: string;
  motivo: MotivoReporte;
  detalle?: string;
  estado: EstadoReporte;
  creadoEn: string;
}
