import type { ExerciseDetailDto } from '../schemas/exercises';
import type { Ejercicio } from '../../../types';

const DEFAULT_UNIT_ID = 1;

export function exerciseDtoToEjercicio(dto: ExerciseDetailDto): Ejercicio {
  const grupo: string[] = [];
  if (dto.muscle_group) grupo.push(dto.muscle_group);
  if (dto.target && dto.target !== dto.muscle_group) grupo.push(dto.target);

  return {
    id: dto.id,
    nombre: dto.name,
    categoria: dto.body_part ?? 'General',
    grupo_muscular: grupo,
    musculos_anatomia: dto.target ? [dto.target] : undefined,
    equipamiento: dto.equipment ? [dto.equipment] : [],
    dificultad: 'Intermedio',
    unidad_id_default: DEFAULT_UNIT_ID,
    descripcion: dto.attribution ?? '',
    tags: dto.source_id ? ['catalogo'] : [],
    imagen: dto.image_url ?? dto.gif_url ?? undefined,
  };
}

export function exerciseDtosToEjercicios(dtos: ExerciseDetailDto[]): Ejercicio[] {
  return dtos.map(exerciseDtoToEjercicio);
}

/** Item de lista para picker / biblioteca */
export interface GatewayExerciseListItem {
  id: number;
  name: string;
  bodyPart?: string;
  equipment?: string;
  target?: string;
  imageUrl?: string;
  sourceId?: string;
}

export function exerciseDtoToListItem(dto: ExerciseDetailDto): GatewayExerciseListItem {
  return {
    id: dto.id,
    name: dto.name,
    bodyPart: dto.body_part ?? undefined,
    equipment: dto.equipment ?? undefined,
    target: dto.target ?? undefined,
    imageUrl: dto.image_url ?? dto.gif_url ?? undefined,
    sourceId: dto.source_id ?? undefined,
  };
}
