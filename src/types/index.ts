export type RoutineTipo = 'estandar' | 'emom' | 'amrap' | 'fortime' | 'circuit';

export interface EjercicioRutina {
  /** FK al catálogo local mock (`useDataStore.ejercicios`) */
  ejercicio_id: number;
  /** Denormalizado para UI */
  nombre: string;
  series: number;
  valor: number;
  unidad_id: number;
  /** ID ExerciseDB (exr_…) — preparado para migración a Supabase */
  exerciseDbId?: string;
  imageUrl?: string;
  /** Esfuerzo percibido 1–10 (formulario avanzado) */
  rpe?: number;
  /** Mismo valor en 2+ ejercicios = superset */
  grupo_superset?: string;
  /** Músculos canónicos para heatmap (ExerciseDB o locales) */
  musculos_anatomia?: string[];
}

export interface DiaRutina {
  dia: number;
  nombre: string;
  ejercicios: EjercicioRutina[];
}

export interface SemanaRutina {
  semana: number;
  dias: DiaRutina[];
}

export interface Rutina {
  id: number;
  nombre: string;
  categoria: string;
  dificultad: string;
  duracion_min: number;
  descripcion: string;
  /** Flatten semana 1 — compat player, cards, asignación a planes */
  ejercicios: EjercicioRutina[];
  semanas?: number;
  programacion_semanal?: SemanaRutina[];
  tipo?: RoutineTipo;
  rest_between_sets?: number;
  notes?: string;
}

export type RoutineFormLevel = 'basica' | 'intermedia' | 'avanzada';

export type RoutineCreateMode = 'semana_tipo' | 'semana_a_semana' | 'desde_plantilla';

export interface RoutineFormDia extends Omit<DiaRutina, 'ejercicios'> {
  ejercicios: RoutineFormExercise[];
}

export interface RoutineFormSemana {
  semana: number;
  dias: RoutineFormDia[];
}

export interface RoutineFormExercise extends EjercicioRutina {
  /** Clave interna para edición en UI */
  _key?: string;
}

export interface RoutineFormData {
  nombre: string;
  categoria: string;
  descripcion: string;
  dificultad: string;
  duracion_min: number;
  tipo: RoutineTipo;
  /** Ejercicios del día activo (derivado en runtime) */
  ejercicios: RoutineFormExercise[];
  semanas: number;
  programacion_semanal: RoutineFormSemana[];
  rest_between_sets: number;
  notes: string;
}

export interface Ejercicio {
  id: number;
  nombre: string;
  categoria: string;
  grupo_muscular: string[];
  musculos_anatomia?: string[];
  equipamiento: string[];
  dificultad: string;
  unidad_id_default: number;
  descripcion: string;
  tags: string[];
  imagen?: string;
  videos?: string[];
  recomendaciones?: string[];
  descripcion_larga?: string;
}

export interface Unidad {
  id: number;
  nombre: string;
  tipo: string;
  simbolo: string;
  descripcion: string;
}

export interface ReglaProgresion {
  peso_incremento?: number;
  reps_incremento?: number;
  cada_semanas?: number;
}

export interface EjercicioPersonalizado {
  /** FK al catálogo local mock */
  ejercicio_id: number;
  nombre: string;
  series: number;
  /** Reps, tiempo o distancia prescritos (según unidad_id) */
  valor: number;
  unidad_id: number;
  /** Carga objetivo en kg — separada de reps cuando unidad_id es repeticiones */
  peso_objetivo_kg?: number;
  notas?: string;
  rpe?: number;
  musculos_anatomia?: string[];
  regla_progresion?: ReglaProgresion;
  /** @deprecated usar valor — solo migración JSON legacy */
  reps?: number;
}

export interface RutinaAsignada {
  rutina_id: number;
  nombre_rutina: string;
  frecuencia: string;
  notas?: string;
}

export type PlanModo = 'repetitiva' | 'sesiones_variables';

export type PlanProgresionModo = 'fijo' | 'incremental';

/** Plantilla de sesión en el plan del cliente (no día fijo de la semana). */
export interface SesionPlan {
  orden: number;
  nombre: string;
  rutina_id: number | null;
  rutina_nombre: string;
  ejercicios_personalizados: EjercicioPersonalizado[];
}

export interface SemanaPlan {
  semana: number;
  sesiones: SesionPlan[];
  notas?: string;
}

export interface PlanUsuario {
  id: number;
  nombre: string;
  descripcion: string;
  semanas: number;
  /** Cuota semanal objetivo (2 = pocos, 4 = ideal, 7 = muchos). */
  dias_entrenar_semana: number;
  modo: PlanModo;
  progresion: PlanProgresionModo;
  /** ISO YYYY-MM-DD — ancla semanas del plan para detectar semanas completadas */
  fecha_inicio?: string;
  /** Días mínimos de recuperación entre sesiones (recomendación del plan, no weekday fijo) */
  descanso_min_dias?: number;
  /** Regla global de progresión aplicada al crear el plan guiado (mock local) */
  regla_progresion_global?: ReglaProgresion;
  rutinas_asignadas: RutinaAsignada[];
  ejercicios_personalizados: EjercicioPersonalizado[];
  programacion_semanal: SemanaPlan[];
}

export type NivelUsuario = 'Principiante' | 'Intermedio' | 'Avanzado';

export interface Usuario {
  id: number;
  /** UUID de auth.users cuando el cliente viene del gateway */
  client_uuid?: string;
  nombre: string;
  email: string;
  objetivo: string;
  nivel: NivelUsuario | string;
  /** Edad en años — mock hasta perfil Supabase */
  edad?: number;
  /** Peso corporal de referencia (kg) — mock/read-only en esta fase */
  peso_kg?: number;
  dias_entrenar: number;
  plan: PlanUsuario;
}

export type SitioMedidaId =
  | 'cuello'
  | 'pecho'
  | 'brazo'
  | 'antebrazo'
  | 'cintura'
  | 'cadera'
  | 'muslo'
  | 'pantorrilla';

export interface ValoresSitio {
  unico?: number;
  izq?: number;
  der?: number;
}

/** Snapshot de medidas corporales; preparado para tabla Supabase (Fase 4). */
export interface SnapshotMedidas {
  id: string;
  usuario_id: number;
  /** YYYY-MM-DD en zona local */
  fecha: string;
  peso_kg?: number;
  sitios: Partial<Record<SitioMedidaId, ValoresSitio>>;
}

export type CitaTipo = 'entrenamiento' | 'medidas';

/** Cita entrenador–cliente; shape preparado para tabla Supabase `appointments`. */
export interface Cita {
  id: number;
  cliente_id: number;
  /** YYYY-MM-DD en zona local */
  fecha: string;
  /** HH:mm */
  hora_inicio: string;
  duracion_min: number;
  tipo: CitaTipo;
  rutina_id: number | null;
  notas?: string;
}

export interface WorkoutState {
  rutinaActual: Rutina | null;
  ejercicioActualIndex: number;
  serieActual: number;
  seriesCompletadas: number;
  isPaused: boolean;
  isActive: boolean;
  startTime: number | null;
}

export type SesionModalidad = 'fuerza' | 'isometrico' | 'otro';

/** Serie ejecutada; shape preparado para tabla Supabase `session_sets` (mock local). */
export interface SerieEjecutada {
  n: number;
  reps: number;
  peso_kg: number | null;
  rpe?: number;
}

/** Ejercicio dentro de una sesión completada. */
export interface EjercicioEjecutado {
  ejercicio_id: number;
  nombre: string;
  unidad_id: number;
  series: SerieEjecutada[];
}

/** Sesión completada; mock local — sustituir por gateway en Fase 4. */
export interface SesionEntrenamiento {
  id: string;
  usuario_id: number;
  /** YYYY-MM-DD en zona local */
  fecha: string;
  rutina_id: number;
  rutina_nombre: string;
  modalidad: SesionModalidad;
  duracion_min: number;
  /** Derivado de ejercicios[].series.length al guardar */
  series_completadas: number;
  /** Vínculo opcional con la plantilla SesionPlan.orden del plan activo. */
  sesion_orden?: number;
  /** Series reales con peso/reps — contrato futuro `session_sets` */
  ejercicios: EjercicioEjecutado[];
}

export interface GenerateRoutineCliente {
  usuario_id?: string | number;
  edad?: number;
  peso_kg?: number;
  nivel?: string;
  objetivo?: string;
  dias_entrenar?: number;
  equipamiento?: string;
  limitaciones?: string;
}

export interface GenerateRoutineRequest {
  objetivo: string;
  cliente?: GenerateRoutineCliente;
  nivel?: string;
  duracion_min?: number;
  equipamiento?: string;
  limitaciones?: string;
}

export interface GenerateRoutineExercise {
  nombre: string;
  series: number;
  valor: number;
  unidad_id?: number;
  motivo?: string;
}

export interface ResolvedExercise {
  ejercicio_id?: number;
  /** ID en exercises.exercises (Supabase) */
  catalogExerciseId?: number;
  nombre: string;
  series: number;
  valor: number;
  unidad_id: number;
  exerciseDbId?: string;
  imageUrl?: string;
  matchStatus: 'matched' | 'unmatched';
  /** Nombre original propuesto por la IA si difiere del match */
  proposedName?: string;
  musculos_anatomia?: string[];
}

export interface ResolvedRoutineDraft {
  rutina: Omit<Rutina, 'id'>;
  dias_entrenamiento: string[];
  razonamiento?: string;
  exercises: ResolvedExercise[];
}

export interface GenerateRoutineResponse {
  nombre: string;
  categoria: string;
  dificultad: string;
  duracion_min: number;
  descripcion: string;
  dias_entrenamiento: string[];
  ejercicios: GenerateRoutineExercise[];
}

export interface GenerateRoutineApiResponse {
  rutina: Omit<Rutina, 'id'>;
  dias_entrenamiento: string[];
  razonamiento?: string;
}
