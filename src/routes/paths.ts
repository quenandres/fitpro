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
