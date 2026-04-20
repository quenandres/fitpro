export interface EjercicioRutina {
  nombre: string;
  series: number;
  valor: number;
  unidad_id: number;
}

export interface Rutina {
  id: number;
  nombre: string;
  categoria: string;
  dificultad: string;
  duracion_min: number;
  descripcion: string;
  ejercicios: EjercicioRutina[];
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

export interface WorkoutState {
  rutinaActual: Rutina | null;
  ejercicioActualIndex: number;
  serieActual: number;
  seriesCompletadas: number;
  isPaused: boolean;
  isActive: boolean;
  startTime: number | null;
}
