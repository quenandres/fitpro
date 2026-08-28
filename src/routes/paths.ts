import type { RoutineFormLevel } from '../types';

/**
 * Rutas canónicas del frontend.
 *
 * - `library.catalogo.*` → datos de referencia (ExerciseDB / proxy read-only).
 * - `library.rutinas|planes|unidades|ia` → recursos del usuario vía gateway (`VITE_API_URL`).
 */
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  calendar: '/calendario',
  tracking: '/tracking',
  trackingUsuario: (id: string | number) => `/tracking?usuario=${id}`,
  perfil: '/perfil',
  player: '/player',
  anatomy: '/anatomytracker',
  workout: (id: string | number) => `/workout/${id}`,

  library: {
    root: '/library',

    /** Recursos del entrenador (persistidos en backend) */
    rutinas: '/library/rutinas',
    rutinasNueva: '/library/rutinas/nueva',
    rutinasPlantillas: '/library/rutinas/plantillas',
    rutinaNueva: (level: RoutineFormLevel, id?: number) => {
      const base = `/library/rutinas/nueva/${level}`;
      return id != null ? `${base}?id=${id}` : base;
    },
    ia: '/library/ia',
    planes: '/library/planes',
    unidades: '/library/unidades',

    /** Catálogo ExerciseDB (referencia externa, solo lectura) */
    catalogo: {
      root: '/library/catalogo',
      ejercicios: '/library/catalogo/ejercicios',
      partes: '/library/catalogo/partes',
      equipo: '/library/catalogo/equipo',
      tipos: '/library/catalogo/tipos',
      musculos: '/library/catalogo/musculos',
    },
  },

  /**
   * Módulo Comunidades — UI pura sobre datos mock (`useCommunitiesStore`).
   * Sin backend: ver CONTEXT.md / plan de implementación del módulo.
   */
  communities: {
    root: '/communities',
    create: '/communities/create',
    invitations: '/communities/invitations',
    detail: (id: string) => `/communities/${id}`,
    home: (id: string) => `/communities/${id}/home`,
    posts: (id: string) => `/communities/${id}/posts`,
    postCreate: (id: string) => `/communities/${id}/posts/create`,
    post: (id: string, postId: string) => `/communities/${id}/posts/${postId}`,
    events: (id: string) => `/communities/${id}/events`,
    eventCreate: (id: string) => `/communities/${id}/events/create`,
    event: (id: string, eventId: string) => `/communities/${id}/events/${eventId}`,
    eventParticipants: (id: string, eventId: string) =>
      `/communities/${id}/events/${eventId}/participants`,
    discussions: (id: string) => `/communities/${id}/discussions`,
    discussion: (id: string, discussionId: string) =>
      `/communities/${id}/discussions/${discussionId}`,
    members: (id: string) => `/communities/${id}/members`,
    about: (id: string) => `/communities/${id}/about`,
    admin: (id: string) => `/communities/${id}/admin`,
    adminMembers: (id: string) => `/communities/${id}/admin/members`,
    adminModeration: (id: string) => `/communities/${id}/admin/moderation`,
  },

  notifications: '/notifications',

  /**
   * Alias legacy del dashboard de métricas. La pantalla canónica es `home`
   * (`/`); esta ruta redirige ahí. No colisiona con las redirects `/admin/*`
   * de biblioteca (match por path exacto).
   */
  admin: {
    dashboard: '/admin/dashboard',
  },
} as const;

export const LEGACY_LIBRARY_REDIRECTS: ReadonlyArray<{ from: string; to: string }> = [
  { from: '/library/ejercicios', to: ROUTES.library.catalogo.ejercicios },
  { from: '/library/partes', to: ROUTES.library.catalogo.partes },
  { from: '/library/equipo', to: ROUTES.library.catalogo.equipo },
  { from: '/library/tipos', to: ROUTES.library.catalogo.tipos },
  { from: '/library/musculos', to: ROUTES.library.catalogo.musculos },
  { from: '/library/rutina', to: ROUTES.library.rutinasNueva },
  { from: '/library/rutina/plantillas', to: ROUTES.library.rutinasPlantillas },
  { from: '/library/mis-ejercicios', to: ROUTES.library.catalogo.ejercicios },
  { from: '/library/datos', to: ROUTES.library.root },
  { from: '/admin', to: ROUTES.library.rutinas },
  { from: '/admin/ejercicios', to: ROUTES.library.catalogo.ejercicios },
  { from: '/admin/catalogo', to: ROUTES.library.catalogo.root },
  { from: '/admin/planes', to: ROUTES.library.planes },
  { from: '/admin/planes/full', to: ROUTES.library.planes },
  { from: '/admin/unidades', to: ROUTES.library.unidades },
  { from: '/admin/unidades/full', to: ROUTES.library.unidades },
  { from: '/admin/datos', to: ROUTES.library.root },
  { from: '/admin/rutina-ia', to: ROUTES.library.ia },
];

export const LEGACY_ROUTINE_FORM_LEVELS: RoutineFormLevel[] = ['basica', 'intermedia', 'avanzada'];
