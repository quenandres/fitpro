// Validators for routine creation

export interface ValidationError {
  field: string;
  message: string;
}

export interface RoutineFormData {
  // Step 1: Info
  nombre: string;
  categoria: string;
  descripcion: string;
  
  // Step 2: Config
  dificultad: string;
  duracion_min: number;
  tipo: string;
  
  // Step 3: Exercises
  ejercicios: ExerciseInRoutine[];
  
  // Step 4: Advanced
  rest_between_sets: number;
  notes: string;
}

export interface ExerciseInRoutine {
  nombre: string;
  series: number;
  valor: number;
  unidad_id: number;
}

export const validateStep1 = (data: Partial<RoutineFormData>): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!data.nombre?.trim()) {
    errors.push({ field: 'nombre', message: 'El nombre es obligatorio' });
  } else if (data.nombre.length < 3) {
    errors.push({ field: 'nombre', message: 'El nombre debe tener al menos 3 caracteres' });
  } else if (data.nombre.length > 50) {
    errors.push({ field: 'nombre', message: 'El nombre no puede exceder 50 caracteres' });
  }
  
  if (!data.categoria) {
    errors.push({ field: 'categoria', message: 'Selecciona una categoría' });
  }
  
  if (data.descripcion && data.descripcion.length > 500) {
    errors.push({ field: 'descripcion', message: 'La descripción no puede exceder 500 caracteres' });
  }
  
  return errors;
};

export const validateStep2 = (data: Partial<RoutineFormData>): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!data.dificultad) {
    errors.push({ field: 'dificultad', message: 'Selecciona la dificultad' });
  }
  
  if (!data.duracion_min || data.duracion_min < 5 || data.duracion_min > 120) {
    errors.push({ field: 'duracion_min', message: 'La duración debe ser entre 5 y 120 minutos' });
  }
  
  if (!data.tipo) {
    errors.push({ field: 'tipo', message: 'Selecciona el tipo de rutina' });
  }
  
  return errors;
};

export const validateStep3 = (data: Partial<RoutineFormData>): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!data.ejercicios || data.ejercicios.length === 0) {
    errors.push({ field: 'ejercicios', message: 'Agrega al menos un ejercicio' });
  }
  
  return errors;
};

export const validateStep4 = (data: Partial<RoutineFormData>): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!data.rest_between_sets || data.rest_between_sets < 0) {
    errors.push({ field: 'rest_between_sets', message: 'Ingresa un tiempo de descanso válido' });
  }
  
  return errors;
};

export const validateAllSteps = (data: RoutineFormData): ValidationError[] => {
  return [
    ...validateStep1(data),
    ...validateStep2(data),
    ...validateStep3(data),
    ...validateStep4(data),
  ];
};

// Category options with icons
export const categoryOptions = [
  { value: 'Fuerza', label: '💪 Fuerza', icon: '💪' },
  { value: 'Cardio', label: '🔥 Cardio', icon: '🔥' },
  { value: 'Funcional', label: '⚡ Funcional', icon: '⚡' },
  { value: 'Core', label: '🎯 Core', icon: '🎯' },
  { value: 'Metabólico', label: '⏱️ Metabólico', icon: '⏱️' },
  { value: 'Movilidad', label: '🧘 Movilidad', icon: '🧘' },
  { value: 'Peso Corporal', label: '🏋️ Peso Corporal', icon: '🏋️' },
  { value: 'Hipertrofia', label: '💎 Hipertrofia', icon: '💎' },
];

export const difficultyOptions = [
  { value: 'Principiante', label: 'Principiante', color: 'green' },
  { value: 'Intermedio', label: 'Intermedio', color: 'yellow' },
  { value: 'Avanzado', label: 'Avanzado', color: 'red' },
];

export const routineTypeOptions = [
  { value: 'estandar', label: 'Estándar', desc: 'Rutina convencional' },
  { value: 'emom', label: 'EMOM', desc: 'Every Minute On the Minute' },
  { value: 'amrap', label: 'AMRAP', desc: 'As Many Reps As Possible' },
  { value: 'fortime', label: 'For Time', desc: 'Completar en el menor tiempo' },
  { value: 'circuit', label: 'Circuito', desc: 'Serie continua de ejercicios' },
];

export const durationOptions = [
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 20, label: '20 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' },
];

export const restOptions = [
  { value: 30, label: '30 segundos' },
  { value: 60, label: '1 minuto' },
  { value: 90, label: '1:30 minutos' },
  { value: 120, label: '2 minutos' },
  { value: 180, label: '3 minutos' },
  { value: 300, label: '5 minutos' },
];
