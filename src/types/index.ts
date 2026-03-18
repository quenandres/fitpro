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

export interface WorkoutState {
  rutinaActual: Rutina | null;
  ejercicioActualIndex: number;
  serieActual: number;
  seriesCompletadas: number;
  isPaused: boolean;
  isActive: boolean;
  startTime: number | null;
}
