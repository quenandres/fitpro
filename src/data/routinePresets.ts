import type { RoutineFormLevel, RoutineTipo } from '../types';

export type PresetCategory =
  | 'hyrox'
  | 'isometrico'
  | 'pliometria'
  | 'fuerza'
  | 'cardio'
  | 'hiit'
  | 'movilidad'
  | 'funcional';

export interface RoutinePresetExerciseSlot {
  searchTerm: string;
  series: number;
  valor: number;
  unidad_id: number;
  rpe?: number;
  supersetGroup?: string;
}

export interface RoutinePreset {
  id: string;
  nombre: string;
  categoria: string;
  category: PresetCategory;
  tags: string[];
  level: RoutineFormLevel;
  descripcion: string;
  duracion_min: number;
  tipo?: RoutineTipo;
  rest_between_sets?: number;
  notes?: string;
  exercises: RoutinePresetExerciseSlot[];
}

export const PRESET_CATEGORY_LABELS: Record<PresetCategory, string> = {
  hyrox: 'Hyrox / competencia',
  isometrico: 'Isométricos',
  pliometria: 'Pliometría',
  fuerza: 'Fuerza',
  cardio: 'Cardio',
  hiit: 'HIIT',
  movilidad: 'Movilidad',
  funcional: 'Funcional',
};

export const ROUTINE_PRESETS: RoutinePreset[] = [
  {
    id: 'hyrox-simulacro',
    nombre: 'Simulacro Hyrox',
    categoria: 'Funcional',
    category: 'hyrox',
    tags: ['hyrox', 'competencia', 'resistencia'],
    level: 'avanzada',
    descripcion:
      'Mezcla de carrera y estaciones funcionales típicas de la competición Hyrox.',
    duracion_min: 60,
    tipo: 'circuit',
    rest_between_sets: 90,
    notes: 'Alternar carrera con estaciones. Ajusta distancias según tu nivel.',
    exercises: [
      { searchTerm: 'run', series: 1, valor: 1000, unidad_id: 2 },
      { searchTerm: 'ski erg', series: 1, valor: 1000, unidad_id: 2 },
      { searchTerm: 'sled push', series: 1, valor: 50, unidad_id: 2 },
      { searchTerm: 'sled pull', series: 1, valor: 50, unidad_id: 2 },
      { searchTerm: 'burpee broad jump', series: 1, valor: 80, unidad_id: 2 },
      { searchTerm: 'rowing machine', series: 1, valor: 1000, unidad_id: 2 },
      { searchTerm: 'farmer walk', series: 1, valor: 200, unidad_id: 2 },
      { searchTerm: 'walking lunge', series: 1, valor: 100, unidad_id: 2 },
      { searchTerm: 'wall ball', series: 1, valor: 100, unidad_id: 1 },
      { searchTerm: 'run', series: 1, valor: 1000, unidad_id: 2 },
    ],
  },
  {
    id: 'hyrox-estaciones',
    nombre: 'Estaciones Hyrox',
    categoria: 'Funcional',
    category: 'hyrox',
    tags: ['hyrox', 'estaciones', 'erg'],
    level: 'intermedia',
    descripcion: 'Bloque de estaciones ergométricas sin carrera larga.',
    duracion_min: 45,
    rest_between_sets: 60,
    notes: 'Descanso 60 s entre estaciones.',
    exercises: [
      { searchTerm: 'ski erg', series: 3, valor: 500, unidad_id: 2 },
      { searchTerm: 'sled push', series: 3, valor: 25, unidad_id: 2 },
      { searchTerm: 'rowing machine', series: 3, valor: 500, unidad_id: 2 },
      { searchTerm: 'wall ball', series: 3, valor: 20, unidad_id: 1 },
      { searchTerm: 'farmer walk', series: 3, valor: 50, unidad_id: 2 },
    ],
  },
  {
    id: 'hyrox-hybrid-run',
    nombre: 'Hybrid run + erg',
    categoria: 'Cardio',
    category: 'hyrox',
    tags: ['hyrox', 'cardio', 'run'],
    level: 'intermedia',
    descripcion: 'Combinación de carrera corta y máquinas ergométricas.',
    duracion_min: 40,
    rest_between_sets: 45,
    exercises: [
      { searchTerm: 'run', series: 4, valor: 400, unidad_id: 2 },
      { searchTerm: 'ski erg', series: 4, valor: 250, unidad_id: 2 },
      { searchTerm: 'rowing machine', series: 4, valor: 250, unidad_id: 2 },
    ],
  },
  {
    id: 'iso-core',
    nombre: 'Core isométrico',
    categoria: 'Core',
    category: 'isometrico',
    tags: ['isometrico', 'core', 'estabilidad'],
    level: 'basica',
    descripcion: 'Holds de core para estabilidad y resistencia isométrica.',
    duracion_min: 25,
    exercises: [
      { searchTerm: 'plank', series: 3, valor: 45, unidad_id: 5 },
      { searchTerm: 'side plank', series: 3, valor: 30, unidad_id: 5 },
      { searchTerm: 'dead bug', series: 3, valor: 12, unidad_id: 1 },
      { searchTerm: 'hollow hold', series: 3, valor: 30, unidad_id: 5 },
    ],
  },
  {
    id: 'iso-lower-holds',
    nombre: 'Holds tren inferior',
    categoria: 'Fuerza',
    category: 'isometrico',
    tags: ['isometrico', 'piernas', 'wall sit'],
    level: 'intermedia',
    descripcion: 'Isométricos de piernas: wall sit, split squat hold.',
    duracion_min: 30,
    rest_between_sets: 60,
    exercises: [
      { searchTerm: 'wall sit', series: 4, valor: 45, unidad_id: 5 },
      { searchTerm: 'split squat', series: 3, valor: 30, unidad_id: 5 },
      { searchTerm: 'glute bridge hold', series: 3, valor: 30, unidad_id: 5 },
      { searchTerm: 'calf raise hold', series: 3, valor: 20, unidad_id: 5 },
    ],
  },
  {
    id: 'iso-plank-progression',
    nombre: 'Planchas progresivas',
    categoria: 'Core',
    category: 'isometrico',
    tags: ['isometrico', 'plank', 'progresion'],
    level: 'intermedia',
    descripcion: 'Progresión de planchas frontales y laterales.',
    duracion_min: 20,
    rest_between_sets: 45,
    exercises: [
      { searchTerm: 'plank', series: 4, valor: 60, unidad_id: 5 },
      { searchTerm: 'side plank', series: 3, valor: 40, unidad_id: 5 },
      { searchTerm: 'plank shoulder tap', series: 3, valor: 20, unidad_id: 1 },
    ],
  },
  {
    id: 'plyo-lower',
    nombre: 'Pliometría tren inferior',
    categoria: 'Funcional',
    category: 'pliometria',
    tags: ['pliometria', 'saltos', 'piernas'],
    level: 'intermedia',
    descripcion: 'Saltos y movimientos explosivos de piernas.',
    duracion_min: 35,
    rest_between_sets: 90,
    notes: 'Calentamiento obligatorio. Evitar si hay dolor articular.',
    exercises: [
      { searchTerm: 'box jump', series: 4, valor: 8, unidad_id: 1 },
      { searchTerm: 'jump squat', series: 4, valor: 10, unidad_id: 1 },
      { searchTerm: 'lateral bound', series: 3, valor: 10, unidad_id: 1 },
      { searchTerm: 'burpee', series: 3, valor: 8, unidad_id: 1 },
    ],
  },
  {
    id: 'plyo-agility',
    nombre: 'Saltos y agilidad',
    categoria: 'Funcional',
    category: 'pliometria',
    tags: ['pliometria', 'agilidad', 'velocidad'],
    level: 'avanzada',
    descripcion: 'Circuito pliométrico con foco en agilidad.',
    duracion_min: 40,
    tipo: 'circuit',
    rest_between_sets: 60,
    exercises: [
      { searchTerm: 'box jump', series: 3, valor: 10, unidad_id: 1, rpe: 8 },
      { searchTerm: 'skater hop', series: 3, valor: 12, unidad_id: 1, rpe: 7 },
      { searchTerm: 'jumping jack', series: 3, valor: 30, unidad_id: 1, rpe: 6 },
      { searchTerm: 'mountain climber', series: 3, valor: 20, unidad_id: 1, rpe: 7 },
    ],
  },
  {
    id: 'plyo-upper',
    nombre: 'Plyo upper body',
    categoria: 'Funcional',
    category: 'pliometria',
    tags: ['pliometria', 'empuje', 'explosivo'],
    level: 'avanzada',
    descripcion: 'Empuje explosivo y variantes pliométricas de tren superior.',
    duracion_min: 35,
    tipo: 'estandar',
    rest_between_sets: 90,
    exercises: [
      { searchTerm: 'push up', series: 4, valor: 12, unidad_id: 1, rpe: 7 },
      { searchTerm: 'clap push up', series: 3, valor: 6, unidad_id: 1, rpe: 8 },
      { searchTerm: 'medicine ball slam', series: 4, valor: 10, unidad_id: 1, rpe: 8 },
    ],
  },
  {
    id: 'fuerza-full-body',
    nombre: 'Full body fuerza',
    categoria: 'Fuerza',
    category: 'fuerza',
    tags: ['fuerza', 'full body', 'gimnasio'],
    level: 'intermedia',
    descripcion: 'Rutina clásica de gimnasio para todos los grupos musculares.',
    duracion_min: 45,
    rest_between_sets: 90,
    exercises: [
      { searchTerm: 'barbell squat', series: 4, valor: 8, unidad_id: 1 },
      { searchTerm: 'bench press', series: 4, valor: 8, unidad_id: 1 },
      { searchTerm: 'barbell row', series: 4, valor: 10, unidad_id: 1 },
      { searchTerm: 'overhead press', series: 3, valor: 10, unidad_id: 1 },
      { searchTerm: 'romanian deadlift', series: 3, valor: 10, unidad_id: 1 },
    ],
  },
  {
    id: 'fuerza-push-pull',
    nombre: 'Push / Pull',
    categoria: 'Fuerza',
    category: 'fuerza',
    tags: ['fuerza', 'push', 'pull'],
    level: 'intermedia',
    descripcion: 'Alternancia empuje y tracción con supersets.',
    duracion_min: 50,
    rest_between_sets: 75,
    exercises: [
      { searchTerm: 'bench press', series: 4, valor: 8, unidad_id: 1, supersetGroup: 'A' },
      { searchTerm: 'barbell row', series: 4, valor: 10, unidad_id: 1, supersetGroup: 'A' },
      { searchTerm: 'incline dumbbell press', series: 3, valor: 10, unidad_id: 1, supersetGroup: 'B' },
      { searchTerm: 'lat pulldown', series: 3, valor: 12, unidad_id: 1, supersetGroup: 'B' },
    ],
  },
  {
    id: 'fuerza-piernas',
    nombre: 'Piernas fuerza',
    categoria: 'Fuerza',
    category: 'fuerza',
    tags: ['fuerza', 'piernas', 'squat'],
    level: 'intermedia',
    descripcion: 'Enfoque en squat, bisagra y accesorios de pierna.',
    duracion_min: 45,
    rest_between_sets: 120,
    exercises: [
      { searchTerm: 'barbell squat', series: 5, valor: 5, unidad_id: 1 },
      { searchTerm: 'leg press', series: 4, valor: 10, unidad_id: 1 },
      { searchTerm: 'leg curl', series: 3, valor: 12, unidad_id: 1 },
      { searchTerm: 'calf raise', series: 4, valor: 15, unidad_id: 1 },
    ],
  },
  {
    id: 'cardio-liss',
    nombre: 'LISS cardio',
    categoria: 'Cardio',
    category: 'cardio',
    tags: ['cardio', 'liss', 'resistencia'],
    level: 'basica',
    descripcion: 'Cardio de intensidad baja constante.',
    duracion_min: 30,
    exercises: [
      { searchTerm: 'run', series: 1, valor: 30, unidad_id: 5 },
      { searchTerm: 'stationary bike', series: 1, valor: 20, unidad_id: 5 },
    ],
  },
  {
    id: 'cardio-intervals',
    nombre: 'Intervalos cardio',
    categoria: 'Cardio',
    category: 'cardio',
    tags: ['cardio', 'intervalos', 'hiit'],
    level: 'intermedia',
    descripcion: 'Intervalos de alta intensidad en cinta o bicicleta.',
    duracion_min: 25,
    rest_between_sets: 60,
    exercises: [
      { searchTerm: 'run', series: 8, valor: 2, unidad_id: 5 },
      { searchTerm: 'jumping jack', series: 8, valor: 30, unidad_id: 1 },
    ],
  },
  {
    id: 'hiit-emom',
    nombre: 'EMOM funcional',
    categoria: 'Metabólico',
    category: 'hiit',
    tags: ['hiit', 'emom', 'funcional'],
    level: 'avanzada',
    descripcion: 'Every Minute On the Minute: un ejercicio por minuto.',
    duracion_min: 20,
    tipo: 'emom',
    rest_between_sets: 0,
    notes: 'Realiza las reps al inicio de cada minuto; descansa el resto.',
    exercises: [
      { searchTerm: 'burpee', series: 10, valor: 8, unidad_id: 1, rpe: 8 },
      { searchTerm: 'kettlebell swing', series: 10, valor: 12, unidad_id: 1, rpe: 7 },
      { searchTerm: 'box jump', series: 10, valor: 6, unidad_id: 1, rpe: 8 },
    ],
  },
  {
    id: 'hiit-amrap',
    nombre: 'AMRAP 20 min',
    categoria: 'Metabólico',
    category: 'hiit',
    tags: ['hiit', 'amrap', 'crossfit'],
    level: 'avanzada',
    descripcion: 'As Many Reps As Possible en 20 minutos.',
    duracion_min: 20,
    tipo: 'amrap',
    rest_between_sets: 0,
    exercises: [
      { searchTerm: 'push up', series: 1, valor: 10, unidad_id: 1, rpe: 7 },
      { searchTerm: 'air squat', series: 1, valor: 15, unidad_id: 1, rpe: 7 },
      { searchTerm: 'sit up', series: 1, valor: 10, unidad_id: 1, rpe: 6 },
    ],
  },
  {
    id: 'movilidad-stretch',
    nombre: 'Stretching + movilidad',
    categoria: 'Movilidad',
    category: 'movilidad',
    tags: ['movilidad', 'stretching', 'flexibilidad'],
    level: 'basica',
    descripcion: 'Sesión de estiramientos y movilidad articular.',
    duracion_min: 25,
    exercises: [
      { searchTerm: 'hamstring stretch', series: 2, valor: 45, unidad_id: 5 },
      { searchTerm: 'hip flexor stretch', series: 2, valor: 45, unidad_id: 5 },
      { searchTerm: 'shoulder stretch', series: 2, valor: 30, unidad_id: 5 },
      { searchTerm: 'cat cow', series: 2, valor: 10, unidad_id: 1 },
    ],
  },
  {
    id: 'movilidad-yoga',
    nombre: 'Yoga flow',
    categoria: 'Movilidad',
    category: 'movilidad',
    tags: ['yoga', 'movilidad', 'flow'],
    level: 'intermedia',
    descripcion: 'Secuencia de yoga para movilidad y control.',
    duracion_min: 30,
    rest_between_sets: 30,
    exercises: [
      { searchTerm: 'downward dog', series: 3, valor: 30, unidad_id: 5 },
      { searchTerm: 'warrior pose', series: 2, valor: 45, unidad_id: 5 },
      { searchTerm: 'child pose', series: 2, valor: 60, unidad_id: 5 },
    ],
  },
  {
    id: 'funcional-farmer',
    nombre: 'Farmer carry circuit',
    categoria: 'Funcional',
    category: 'funcional',
    tags: ['funcional', 'carry', 'agarre'],
    level: 'intermedia',
    descripcion: 'Circuito de carries y movimientos funcionales.',
    duracion_min: 35,
    tipo: 'circuit',
    rest_between_sets: 60,
    exercises: [
      { searchTerm: 'farmer walk', series: 4, valor: 40, unidad_id: 2 },
      { searchTerm: 'suitcase carry', series: 4, valor: 30, unidad_id: 2 },
      { searchTerm: 'walking lunge', series: 3, valor: 12, unidad_id: 1 },
    ],
  },
  {
    id: 'funcional-bodyweight',
    nombre: 'Bodyweight circuit',
    categoria: 'Peso Corporal',
    category: 'funcional',
    tags: ['funcional', 'bodyweight', 'circuito'],
    level: 'basica',
    descripcion: 'Circuito sin equipamiento para cualquier lugar.',
    duracion_min: 30,
    tipo: 'circuit',
    exercises: [
      { searchTerm: 'push up', series: 3, valor: 12, unidad_id: 1 },
      { searchTerm: 'air squat', series: 3, valor: 15, unidad_id: 1 },
      { searchTerm: 'plank', series: 3, valor: 45, unidad_id: 5 },
      { searchTerm: 'lunges', series: 3, valor: 10, unidad_id: 1 },
    ],
  },
];

export const getPresetById = (id: string): RoutinePreset | undefined =>
  ROUTINE_PRESETS.find((p) => p.id === id);

export const getPresetsByCategory = (category: PresetCategory | 'all'): RoutinePreset[] =>
  category === 'all'
    ? ROUTINE_PRESETS
    : ROUTINE_PRESETS.filter((p) => p.category === category);
