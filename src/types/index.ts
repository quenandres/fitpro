export type RoutineTipo = 'estandar' | 'emom' | 'amrap' | 'fortime' | 'circuit';

export interface EjercicioRutina {
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

export interface Rutina {
  id: number;
  nombre: string;
  categoria: string;
  dificultad: string;
  duracion_min: number;
  descripcion: string;
  ejercicios: EjercicioRutina[];
  tipo?: RoutineTipo;
  rest_between_sets?: number;
  notes?: string;
}

export type RoutineFormLevel = 'basica' | 'intermedia' | 'avanzada';

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
  ejercicios: RoutineFormExercise[];
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

export interface EjercicioPersonalizado {
  nombre: string;
  series: number;
  reps: number;
  notas?: string;
}

export interface RutinaAsignada {
  rutina_id: number;
  nombre_rutina: string;
  frecuencia: string;
  notas?: string;
}

export interface DiaSemana {
  dia: number;
  nombre: string;
  rutina_id: number | null;
  rutina_nombre: string;
  ejercicios_personalizados: EjercicioPersonalizado[];
}

export interface SemanaPlan {
  semana: number;
  dias: DiaSemana[];
  notas?: string;
}

export interface PlanUsuario {
  id: number;
  nombre: string;
  descripcion: string;
  semanas: number;
  dias_entrenar_semana: number;
  rutinas_asignadas: RutinaAsignada[];
  ejercicios_personalizados: EjercicioPersonalizado[];
  programacion_semanal: SemanaPlan[];
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  objetivo: string;
  nivel: string;
  dias_entrenar: number;
  plan: PlanUsuario;
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

/** Sesión completada; shape preparado para tabla Supabase `sessions` (Fase 4). */
export interface SesionEntrenamiento {
  id: string;
  usuario_id: number;
  /** YYYY-MM-DD en zona local */
  fecha: string;
  rutina_id: number;
  rutina_nombre: string;
  modalidad: SesionModalidad;
  duracion_min: number;
  series_completadas: number;
}

export interface GenerateRoutineRequest {
  objetivo: string;
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
