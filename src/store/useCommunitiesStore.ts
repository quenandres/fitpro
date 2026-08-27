import { useMemo } from 'react';
import { create } from 'zustand';
import type {
  Comentario,
  Comunidad,
  Discusion,
  EstadoRsvp,
  EventoComunidad,
  Invitacion,
  MiembroComunidad,
  NotificacionComunidad,
  Post,
  Reporte,
  RespuestaDiscusion,
  RolComunidad,
  TipoReaccion,
} from '../types/community';
import communitiesData from '../data/communities/communities.json';
import membersData from '../data/communities/members.json';
import postsData from '../data/communities/posts.json';
import eventsData from '../data/communities/events.json';
import discussionsData from '../data/communities/discussions.json';
import invitationsData from '../data/communities/invitations.json';
import notificationsData from '../data/communities/notifications.json';
import reportsData from '../data/communities/reports.json';

/** Miembro "yo" para simular sesión dentro de una comunidad — Ana es líder en Box Norte. */
export const CURRENT_MEMBER_ID = 'mem-ana';

const uid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

interface CommunitiesStore {
  comunidades: Comunidad[];
  miembros: MiembroComunidad[];
  posts: Post[];
  eventos: EventoComunidad[];
  discusiones: Discusion[];
  invitaciones: Invitacion[];
  notificaciones: NotificacionComunidad[];
  reportes: Reporte[];

  // Comunidad
  joinCommunity: (comunidadId: string) => void;
  leaveCommunity: (comunidadId: string) => void;

  // Miembros
  updateMemberRole: (miembroId: string, rol: RolComunidad) => void;
  toggleMemberSuspend: (miembroId: string) => void;
  removeMember: (miembroId: string) => void;

  // Posts
  addPost: (post: Omit<Post, 'id' | 'reacciones' | 'comentarios' | 'creadoEn'>) => string;
  removePost: (postId: string) => void;
  togglePostPin: (postId: string) => void;
  toggleReaction: (postId: string, tipo: TipoReaccion, miembroId?: string) => void;
  addComment: (postId: string, texto: string, autorId?: string) => void;

  // Eventos
  addEvent: (evento: Omit<EventoComunidad, 'id' | 'participantes'>) => string;
  rsvpEvent: (eventoId: string, estado: EstadoRsvp, miembroId?: string) => void;
  removeEvent: (eventoId: string) => void;

  // Discusiones
  addDiscussion: (discusion: Omit<Discusion, 'id' | 'respuestas' | 'creadaEn'>) => string;
  addDiscussionReply: (discusionId: string, texto: string, autorId?: string) => void;
  toggleDiscussionPin: (discusionId: string) => void;
  toggleDiscussionClose: (discusionId: string) => void;
  removeDiscussion: (discusionId: string) => void;

  // Reportes / moderación
  addReport: (reporte: Omit<Reporte, 'id' | 'estado' | 'creadoEn'>) => void;
  resolveReport: (reporteId: string) => void;

  // Invitaciones
  respondInvitation: (invitacionId: string, aceptar: boolean) => void;

  // Notificaciones
  markNotificationRead: (notificacionId: string) => void;
  markAllNotificationsRead: () => void;
}

export const useCommunitiesStore = create<CommunitiesStore>((set, get) => ({
  comunidades: communitiesData as Comunidad[],
  miembros: membersData as MiembroComunidad[],
  posts: postsData as Post[],
  eventos: eventsData as EventoComunidad[],
  discusiones: discussionsData as Discusion[],
  invitaciones: invitationsData as Invitacion[],
  notificaciones: notificationsData as NotificacionComunidad[],
  reportes: reportsData as Reporte[],

  joinCommunity: (comunidadId) => {
    const yaMiembro = get().miembros.some(
      (m) => m.comunidadId === comunidadId && m.id === CURRENT_MEMBER_ID,
    );
    if (yaMiembro) return;
    set((state) => ({
      miembros: [
        ...state.miembros,
        {
          id: CURRENT_MEMBER_ID,
          comunidadId,
          nombre: 'Tú',
          avatarUrl: 'https://picsum.photos/seed/current-user/160/160',
          rol: 'member',
          unidoEn: new Date().toISOString(),
        },
      ],
      comunidades: state.comunidades.map((c) =>
        c.id === comunidadId ? { ...c, miembrosCount: c.miembrosCount + 1 } : c,
      ),
    }));
  },

  leaveCommunity: (comunidadId) => {
    set((state) => ({
      miembros: state.miembros.filter(
        (m) => !(m.comunidadId === comunidadId && m.id === CURRENT_MEMBER_ID),
      ),
      comunidades: state.comunidades.map((c) =>
        c.id === comunidadId ? { ...c, miembrosCount: Math.max(0, c.miembrosCount - 1) } : c,
      ),
    }));
  },

  updateMemberRole: (miembroId, rol) => {
    set((state) => ({
      miembros: state.miembros.map((m) => (m.id === miembroId ? { ...m, rol } : m)),
    }));
  },

  toggleMemberSuspend: (miembroId) => {
    set((state) => ({
      miembros: state.miembros.map((m) =>
        m.id === miembroId ? { ...m, suspendido: !m.suspendido } : m,
      ),
    }));
  },

  removeMember: (miembroId) => {
    const miembro = get().miembros.find((m) => m.id === miembroId);
    set((state) => ({
      miembros: state.miembros.filter((m) => m.id !== miembroId),
      comunidades: miembro
        ? state.comunidades.map((c) =>
            c.id === miembro.comunidadId ? { ...c, miembrosCount: Math.max(0, c.miembrosCount - 1) } : c,
          )
        : state.comunidades,
    }));
  },

  addPost: (post) => {
    const id = uid('post');
    set((state) => ({
      posts: [
        { ...post, id, reacciones: [], comentarios: [], creadoEn: new Date().toISOString() },
        ...state.posts,
      ],
      comunidades: state.comunidades.map((c) =>
        c.id === post.comunidadId ? { ...c, postsCount: c.postsCount + 1 } : c,
      ),
    }));
    return id;
  },

  removePost: (postId) => {
    const post = get().posts.find((p) => p.id === postId);
    set((state) => ({
      posts: state.posts.filter((p) => p.id !== postId),
      comunidades: post
        ? state.comunidades.map((c) =>
            c.id === post.comunidadId ? { ...c, postsCount: Math.max(0, c.postsCount - 1) } : c,
          )
        : state.comunidades,
    }));
  },

  togglePostPin: (postId) => {
    set((state) => ({
      posts: state.posts.map((p) => (p.id === postId ? { ...p, fijado: !p.fijado } : p)),
    }));
  },

  toggleReaction: (postId, tipo, miembroId = CURRENT_MEMBER_ID) => {
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        const existente = p.reacciones.find((r) => r.miembroId === miembroId);
        if (existente && existente.tipo === tipo) {
          return { ...p, reacciones: p.reacciones.filter((r) => r.miembroId !== miembroId) };
        }
        const sinPropia = p.reacciones.filter((r) => r.miembroId !== miembroId);
        return { ...p, reacciones: [...sinPropia, { tipo, miembroId }] };
      }),
    }));
  },

  addComment: (postId, texto, autorId = CURRENT_MEMBER_ID) => {
    const comentario: Comentario = {
      id: uid('com'),
      postId,
      autorId,
      texto,
      creadoEn: new Date().toISOString(),
    };
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, comentarios: [...p.comentarios, comentario] } : p,
      ),
    }));
  },

  addEvent: (evento) => {
    const id = uid('evt');
    set((state) => ({
      eventos: [{ ...evento, id, participantes: [] }, ...state.eventos],
      comunidades: state.comunidades.map((c) =>
        c.id === evento.comunidadId ? { ...c, eventosCount: c.eventosCount + 1 } : c,
      ),
    }));
    return id;
  },

  rsvpEvent: (eventoId, estado, miembroId = CURRENT_MEMBER_ID) => {
    set((state) => ({
      eventos: state.eventos.map((ev) => {
        if (ev.id !== eventoId) return ev;
        const sinPropia = ev.participantes.filter((p) => p.miembroId !== miembroId);
        const participantes = estado === 'ninguno' ? sinPropia : [...sinPropia, { miembroId, estado }];
        return { ...ev, participantes };
      }),
    }));
  },

  removeEvent: (eventoId) => {
    set((state) => ({ eventos: state.eventos.filter((e) => e.id !== eventoId) }));
  },

  addDiscussion: (discusion) => {
    const id = uid('disc');
    set((state) => ({
      discusiones: [
        { ...discusion, id, respuestas: [], creadaEn: new Date().toISOString() },
        ...state.discusiones,
      ],
    }));
    return id;
  },

  addDiscussionReply: (discusionId, texto, autorId = CURRENT_MEMBER_ID) => {
    const respuesta: RespuestaDiscusion = {
      id: uid('resp'),
      discusionId,
      autorId,
      texto,
      creadoEn: new Date().toISOString(),
    };
    set((state) => ({
      discusiones: state.discusiones.map((d) =>
        d.id === discusionId ? { ...d, respuestas: [...d.respuestas, respuesta] } : d,
      ),
    }));
  },

  toggleDiscussionPin: (discusionId) => {
    set((state) => ({
      discusiones: state.discusiones.map((d) =>
        d.id === discusionId ? { ...d, fijada: !d.fijada } : d,
      ),
    }));
  },

  toggleDiscussionClose: (discusionId) => {
    set((state) => ({
      discusiones: state.discusiones.map((d) =>
        d.id === discusionId ? { ...d, cerrada: !d.cerrada } : d,
      ),
    }));
  },

  removeDiscussion: (discusionId) => {
    set((state) => ({ discusiones: state.discusiones.filter((d) => d.id !== discusionId) }));
  },

  addReport: (reporte) => {
    set((state) => ({
      reportes: [
        ...state.reportes,
        { ...reporte, id: uid('rep'), estado: 'pendiente', creadoEn: new Date().toISOString() },
      ],
    }));
  },

  resolveReport: (reporteId) => {
    set((state) => ({
      reportes: state.reportes.map((r) => (r.id === reporteId ? { ...r, estado: 'resuelto' } : r)),
    }));
  },

  respondInvitation: (invitacionId, aceptar) => {
    const invitacion = get().invitaciones.find((i) => i.id === invitacionId);
    set((state) => ({
      invitaciones: state.invitaciones.map((i) =>
        i.id === invitacionId ? { ...i, estado: aceptar ? 'aceptada' : 'rechazada' } : i,
      ),
    }));
    if (aceptar && invitacion) {
      get().joinCommunity(invitacion.comunidadId);
    }
  },

  markNotificationRead: (notificacionId) => {
    set((state) => ({
      notificaciones: state.notificaciones.map((n) =>
        n.id === notificacionId ? { ...n, leida: true } : n,
      ),
    }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notificaciones: state.notificaciones.map((n) => ({ ...n, leida: true })),
    }));
  },
}));

/** Rol simulado del usuario actual dentro de una comunidad, o `null` si no es miembro. */
export function useCurrentMemberRole(comunidadId: string): RolComunidad | null {
  return useCommunitiesStore(
    (s) => s.miembros.find((m) => m.comunidadId === comunidadId && m.id === CURRENT_MEMBER_ID)?.rol ?? null,
  );
}

export function useCommunity(comunidadId: string | undefined) {
  return useCommunitiesStore((s) => s.comunidades.find((c) => c.id === comunidadId));
}

/**
 * Nota: estos selectores derivados filtran con `useMemo` en vez de dentro del
 * selector de Zustand — un selector que hace `.filter()` devuelve un array
 * nuevo en cada render, y con `useSyncExternalStore` (Zustand v5) eso dispara
 * un loop infinito de "getSnapshot should be cached".
 */
export function useCommunityMembers(comunidadId: string | undefined) {
  const miembros = useCommunitiesStore((s) => s.miembros);
  return useMemo(() => miembros.filter((m) => m.comunidadId === comunidadId), [miembros, comunidadId]);
}

export function useCommunityPosts(comunidadId: string | undefined) {
  const posts = useCommunitiesStore((s) => s.posts);
  return useMemo(() => posts.filter((p) => p.comunidadId === comunidadId), [posts, comunidadId]);
}

export function useCommunityEvents(comunidadId: string | undefined) {
  const eventos = useCommunitiesStore((s) => s.eventos);
  return useMemo(() => eventos.filter((e) => e.comunidadId === comunidadId), [eventos, comunidadId]);
}

export function useCommunityDiscussions(comunidadId: string | undefined) {
  const discusiones = useCommunitiesStore((s) => s.discusiones);
  return useMemo(() => discusiones.filter((d) => d.comunidadId === comunidadId), [discusiones, comunidadId]);
}

export function useCommunityReports(comunidadId: string | undefined) {
  const reportes = useCommunitiesStore((s) => s.reportes);
  return useMemo(() => reportes.filter((r) => r.comunidadId === comunidadId), [reportes, comunidadId]);
}

export function useMemberById(miembroId: string | undefined) {
  return useCommunitiesStore((s) => s.miembros.find((m) => m.id === miembroId));
}
