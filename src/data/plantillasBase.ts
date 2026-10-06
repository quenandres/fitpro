import type { EjercicioRutina, PlantillaCategoria, Rutina, RoutineFormLevel, SemanaRutina } from '../types';
import { createProgramacionSemanas } from '../utils/routineScheduleUtils';

export const PLANTILLA_CATEGORY_LABELS: Record<PlantillaCategoria, string> = {
  hyrox: 'Hyrox / competencia',
  isometrico: 'Isométricos',
  pliometria: 'Pliometría',
  fuerza: 'Fuerza',
  cardio: 'Cardio',
  hiit: 'HIIT',
  movilidad: 'Movilidad',
  funcional: 'Funcional',
  hipertrofia: 'Hipertrofia',
};

const ej = (
  ejercicio_id: number,
  nombre: string,
  series: number,
  valor: number,
  unidad_id = 1,
  rpe?: number,
): EjercicioRutina => ({ ejercicio_id, nombre, series, valor, unidad_id, rpe });

/** Aplica la misma lista de ejercicios a los días indicados (1-indexed lunes..domingo, 0=domingo) de cada semana. */
function buildSemanas(
  semanas: number,
  diasConEjercicios: Array<{ dia: number; nombre: string; ejercicios: EjercicioRutina[] }>,
): SemanaRutina[] {
  const base = createProgramacionSemanas(semanas);
  return base.map((semana) => ({
    ...semana,
    dias: semana.dias.map((d) => {
      const match = diasConEjercicios.find((x) => x.dia === d.dia);
      if (!match) return d;
      return { ...d, nombre: match.nombre, ejercicios: match.ejercicios.map((e) => ({ ...e })) };
    }),
  }));
}

function flatten(semanas: SemanaRutina[]): EjercicioRutina[] {
  return semanas[0]?.dias.flatMap((d) => d.ejercicios) ?? [];
}

interface PlantillaSeed {
  id: number;
  nombre: string;
  categoria: string;
  dificultad: string;
  duracion_min: number;
  descripcion: string;
  tipo?: Rutina['tipo'];
  rest_between_sets?: number;
  semanas: SemanaRutina[];
  plantilla: {
    categoria: PlantillaCategoria;
    tags: string[];
    nivel: RoutineFormLevel;
    destacada?: boolean;
  };
}

const SEEDS: PlantillaSeed[] = [
  {
    id: -1,
    nombre: 'Full Body 3 días (Principiante)',
    categoria: 'Funcional',
    dificultad: 'Principiante',
    duracion_min: 45,
    descripcion: 'Cuerpo completo 3 veces por semana, ideal para empezar con base de fuerza y técnica.',
    plantilla: { categoria: 'funcional', tags: ['principiante', 'full body', 'fuerza'], nivel: 'basica', destacada: true },
    semanas: buildSemanas(4, [
      { dia: 1, nombre: 'Full Body A', ejercicios: [ej(1, 'Sentadilla con Barra', 3, 10), ej(2, 'Press de Banca', 3, 10), ej(4, 'Dominadas', 3, 6), ej(11, 'Plancha Abdominal', 3, 30, 5)] },
      { dia: 3, nombre: 'Full Body B', ejercicios: [ej(3, 'Peso Muerto', 3, 8), ej(17, 'Press Militar', 3, 8), ej(6, 'Remo', 3, 10), ej(12, 'Zancadas', 3, 10)] },
      { dia: 5, nombre: 'Full Body C', ejercicios: [ej(1, 'Sentadilla con Barra', 3, 10), ej(15, 'Flexiones', 3, 12), ej(4, 'Dominadas', 3, 6), ej(19, 'Mountain Climbers', 3, 20, 5)] },
    ]),
  },
  {
    id: -2,
    nombre: 'Torso / Pierna 4 días',
    categoria: 'Fuerza',
    dificultad: 'Intermedio',
    duracion_min: 55,
    descripcion: 'Estructura clásica: dos días de torso y dos de pierna con foco en fuerza e hipertrofia.',
    plantilla: { categoria: 'hipertrofia', tags: ['torso', 'pierna', 'hipertrofia', 'intermedio'], nivel: 'intermedia', destacada: true },
    semanas: buildSemanas(4, [
      { dia: 1, nombre: 'Torso A', ejercicios: [ej(2, 'Press de Banca', 4, 8, 1, 8), ej(6, 'Remo', 4, 10, 1, 8), ej(17, 'Press Militar', 3, 10, 1, 8), ej(4, 'Dominadas', 3, 8, 1, 8)] },
      { dia: 2, nombre: 'Pierna A', ejercicios: [ej(1, 'Sentadilla con Barra', 4, 8, 1, 8), ej(3, 'Peso Muerto', 3, 6, 1, 8), ej(12, 'Zancadas', 3, 12, 1, 8), ej(11, 'Plancha Abdominal', 3, 45, 5)] },
      { dia: 4, nombre: 'Torso B', ejercicios: [ej(15, 'Flexiones', 4, 12, 1, 8), ej(6, 'Remo', 4, 10, 1, 8), ej(17, 'Press Militar', 3, 8, 1, 8), ej(4, 'Dominadas', 3, 10, 1, 8)] },
      { dia: 5, nombre: 'Pierna B', ejercicios: [ej(1, 'Sentadilla con Barra', 4, 10, 1, 8), ej(3, 'Peso Muerto', 3, 8, 1, 8), ej(12, 'Zancadas', 3, 12, 1, 8), ej(19, 'Mountain Climbers', 3, 20, 5)] },
    ]),
  },
  {
    id: -3,
    nombre: 'Push / Pull / Legs 6 días',
    categoria: 'Hipertrofia',
    dificultad: 'Avanzado',
    duracion_min: 60,
    descripcion: 'PPL clásico, alto volumen semanal repartido en 6 sesiones para maximizar estímulo hipertrófico.',
    plantilla: { categoria: 'hipertrofia', tags: ['ppl', 'hipertrofia', 'avanzado', 'volumen'], nivel: 'avanzada', destacada: true },
    semanas: buildSemanas(4, [
      { dia: 1, nombre: 'Push A', ejercicios: [ej(2, 'Press de Banca', 4, 8, 1, 8), ej(17, 'Press Militar', 3, 10, 1, 8), ej(15, 'Flexiones', 3, 15, 1, 9)] },
      { dia: 2, nombre: 'Pull A', ejercicios: [ej(4, 'Dominadas', 4, 8, 1, 8), ej(6, 'Remo', 4, 10, 1, 8), ej(13, 'Carrera de Agricultor', 3, 30, 2)] },
      { dia: 3, nombre: 'Legs A', ejercicios: [ej(1, 'Sentadilla con Barra', 4, 8, 1, 8), ej(3, 'Peso Muerto', 3, 6, 1, 8), ej(12, 'Zancadas', 3, 12, 1, 8)] },
      { dia: 4, nombre: 'Push B', ejercicios: [ej(2, 'Press de Banca', 4, 10, 1, 8), ej(17, 'Press Militar', 3, 12, 1, 8), ej(15, 'Flexiones', 3, 20, 1, 9)] },
      { dia: 5, nombre: 'Pull B', ejercicios: [ej(4, 'Dominadas', 4, 10, 1, 8), ej(6, 'Remo', 4, 12, 1, 8), ej(9, 'Tracción de Trineo', 3, 20, 2)] },
      { dia: 6, nombre: 'Legs B', ejercicios: [ej(1, 'Sentadilla con Barra', 4, 10, 1, 8), ej(3, 'Peso Muerto', 3, 8, 1, 8), ej(12, 'Zancadas', 3, 15, 1, 8)] },
    ]),
  },
  {
    id: -4,
    nombre: 'Fuerza 5x5 · 3 días',
    categoria: 'Fuerza',
    dificultad: 'Intermedio',
    duracion_min: 50,
    descripcion: 'Protocolo lineal de fuerza basado en los básicos, 5 series de 5 repeticiones.',
    plantilla: { categoria: 'fuerza', tags: ['fuerza', '5x5', 'básicos'], nivel: 'intermedia' },
    semanas: buildSemanas(4, [
      { dia: 1, nombre: 'Fuerza A', ejercicios: [ej(1, 'Sentadilla con Barra', 5, 5, 1, 8), ej(2, 'Press de Banca', 5, 5, 1, 8), ej(6, 'Remo', 5, 5, 1, 8)] },
      { dia: 3, nombre: 'Fuerza B', ejercicios: [ej(1, 'Sentadilla con Barra', 5, 5, 1, 8), ej(17, 'Press Militar', 5, 5, 1, 8), ej(3, 'Peso Muerto', 1, 5, 1, 9)] },
      { dia: 5, nombre: 'Fuerza A', ejercicios: [ej(1, 'Sentadilla con Barra', 5, 5, 1, 8), ej(2, 'Press de Banca', 5, 5, 1, 8), ej(6, 'Remo', 5, 5, 1, 8)] },
    ]),
  },
  {
    id: -5,
    nombre: 'Hipertrofia 5 días',
    categoria: 'Hipertrofia',
    dificultad: 'Intermedio',
    duracion_min: 55,
    descripcion: 'Split de 5 días por grupo muscular dominante, volumen moderado-alto.',
    plantilla: { categoria: 'hipertrofia', tags: ['hipertrofia', 'split', 'volumen'], nivel: 'intermedia' },
    semanas: buildSemanas(4, [
      { dia: 1, nombre: 'Pecho / Tríceps', ejercicios: [ej(2, 'Press de Banca', 4, 10, 1, 8), ej(15, 'Flexiones', 3, 15, 1, 8)] },
      { dia: 2, nombre: 'Espalda / Bíceps', ejercicios: [ej(4, 'Dominadas', 4, 8, 1, 8), ej(6, 'Remo', 4, 10, 1, 8)] },
      { dia: 3, nombre: 'Pierna', ejercicios: [ej(1, 'Sentadilla con Barra', 4, 10, 1, 8), ej(12, 'Zancadas', 3, 12, 1, 8)] },
      { dia: 4, nombre: 'Hombro / Core', ejercicios: [ej(17, 'Press Militar', 4, 10, 1, 8), ej(11, 'Plancha Abdominal', 3, 40, 5)] },
      { dia: 5, nombre: 'Full Body ligero', ejercicios: [ej(7, 'Burpees', 3, 12), ej(18, 'Kettlebell Swing', 3, 15)] },
    ]),
  },
  {
    id: -6,
    nombre: 'HIIT / Acondicionamiento 3 días',
    categoria: 'Acondicionamiento',
    dificultad: 'Intermedio',
    duracion_min: 35,
    descripcion: 'Circuitos de alta intensidad para acondicionamiento metabólico y pérdida de grasa.',
    tipo: 'circuit',
    rest_between_sets: 45,
    plantilla: { categoria: 'hiit', tags: ['hiit', 'cardio', 'acondicionamiento'], nivel: 'basica' },
    semanas: buildSemanas(4, [
      { dia: 1, nombre: 'HIIT A', ejercicios: [ej(7, 'Burpees', 4, 15), ej(16, 'Saltar la Cuerda', 4, 60, 5), ej(19, 'Mountain Climbers', 4, 20, 5)] },
      { dia: 3, nombre: 'HIIT B', ejercicios: [ej(10, 'Wall Balls', 4, 15), ej(18, 'Kettlebell Swing', 4, 20), ej(5, 'Carrera', 4, 120, 5)] },
      { dia: 5, nombre: 'HIIT C', ejercicios: [ej(8, 'Empuje de Trineo', 4, 20, 2), ej(9, 'Tracción de Trineo', 4, 20, 2), ej(7, 'Burpees', 4, 15)] },
    ]),
  },
  {
    id: -7,
    nombre: 'Movilidad 2 días',
    categoria: 'Movilidad',
    dificultad: 'Todos los niveles',
    duracion_min: 25,
    descripcion: 'Rutina de movilidad y prevención de lesiones, complementaria al entrenamiento de fuerza.',
    plantilla: { categoria: 'movilidad', tags: ['movilidad', 'recuperación', 'prevención'], nivel: 'basica' },
    semanas: buildSemanas(4, [
      { dia: 2, nombre: 'Movilidad A', ejercicios: [ej(20, 'Estiramiento de Isquiotibiales', 3, 30, 5), ej(11, 'Plancha Abdominal', 3, 30, 5)] },
      { dia: 6, nombre: 'Movilidad B', ejercicios: [ej(20, 'Estiramiento de Isquiotibiales', 3, 30, 5), ej(19, 'Mountain Climbers', 3, 15, 5)] },
    ]),
  },
  {
    id: -8,
    nombre: 'Funcional / Hyrox 3 días',
    categoria: 'Funcional',
    dificultad: 'Avanzado',
    duracion_min: 60,
    descripcion: 'Simulacros de estaciones funcionales y carrera al estilo Hyrox.',
    tipo: 'circuit',
    rest_between_sets: 90,
    plantilla: { categoria: 'hyrox', tags: ['hyrox', 'funcional', 'competencia'], nivel: 'avanzada' },
    semanas: buildSemanas(4, [
      { dia: 1, nombre: 'Estaciones A', ejercicios: [ej(8, 'Empuje de Trineo', 4, 25, 2, 8), ej(9, 'Tracción de Trineo', 4, 25, 2, 8), ej(10, 'Wall Balls', 4, 20, 1, 8)] },
      { dia: 3, nombre: 'Carrera + Fuerza', ejercicios: [ej(5, 'Carrera', 3, 400, 2, 7), ej(3, 'Peso Muerto', 4, 6, 1, 8), ej(13, 'Carrera de Agricultor', 3, 30, 2)] },
      { dia: 5, nombre: 'Simulacro completo', ejercicios: [ej(7, 'Burpees', 4, 20), ej(18, 'Kettlebell Swing', 4, 20), ej(14, 'SkiErg', 3, 200, 2), ej(10, 'Wall Balls', 4, 20, 1, 8)] },
    ]),
  },
];

export const PLANTILLAS_BASE: Rutina[] = SEEDS.map((seed) => ({
  id: seed.id,
  nombre: seed.nombre,
  categoria: seed.categoria,
  dificultad: seed.dificultad,
  duracion_min: seed.duracion_min,
  descripcion: seed.descripcion,
  ejercicios: flatten(seed.semanas),
  semanas: seed.semanas.length,
  programacion_semanal: seed.semanas,
  tipo: seed.tipo,
  rest_between_sets: seed.rest_between_sets,
  plantilla: seed.plantilla,
  estado: 'publicada',
  origen: 'plantilla',
  updated_at: new Date('2026-09-01').toISOString(),
}));
