import { z } from 'zod';

import { gatewayRequest } from './httpClient';
import {
  exerciseDetailListSchema,
  exerciseDetailSchema,
  type ExerciseDetailDto,
} from './schemas/exercises';

export interface ExerciseListParams {
  search?: string;
  bodyPart?: string;
  equipment?: string;
  muscle?: string;
  limit?: number;
  offset?: number;
}

const exercisesListResponseSchema = z.object({
  exercises: exerciseDetailListSchema,
  count: z.number(),
  total: z.number(),
  page: z.number(),
  page_size: z.number(),
});

const exerciseEnvelopeSchema = z.object({
  exercise: exerciseDetailSchema,
});

const taxonomyResponseSchema = z.object({
  type: z.string(),
  items: z.array(z.object({ id: z.number(), name: z.string() }).passthrough()),
  count: z.number(),
});

function buildQuery(params: ExerciseListParams): string {
  const qs = new URLSearchParams();
  const pageSize = params.limit ?? 50;
  const page = params.offset != null ? Math.floor(params.offset / pageSize) + 1 : 1;
  qs.set('page', String(page));
  qs.set('page_size', String(pageSize));
  if (params.search?.trim()) qs.set('search', params.search.trim());
  if (params.bodyPart) qs.set('body_part', params.bodyPart);
  if (params.equipment) qs.set('equipment', params.equipment);
  if (params.muscle) qs.set('target', params.muscle);
  return qs.toString();
}

export async function listExercises(params: ExerciseListParams = {}): Promise<ExerciseDetailDto[]> {
  const data = await gatewayRequest(
    `/api/exercises?${buildQuery(params)}`,
    { method: 'GET' },
    exercisesListResponseSchema,
  );
  return data.exercises;
}

export async function getExerciseById(id: number): Promise<ExerciseDetailDto> {
  const data = await gatewayRequest(
    `/api/exercises/${id}`,
    { method: 'GET' },
    exerciseEnvelopeSchema,
  );
  return data.exercise;
}

async function listTaxonomyNames(type: string): Promise<string[]> {
  const data = await gatewayRequest(
    `/api/exercises/taxonomy/${type}`,
    { method: 'GET' },
    taxonomyResponseSchema,
  );
  return data.items.map((item) => item.name).sort();
}

export async function listBodyParts(): Promise<string[]> {
  return listTaxonomyNames('body_parts');
}

export async function listEquipments(): Promise<string[]> {
  return listTaxonomyNames('equipment');
}

export async function listTargetMuscles(): Promise<string[]> {
  const [targets, groups] = await Promise.all([
    listTaxonomyNames('target_muscles'),
    listTaxonomyNames('muscle_groups'),
  ]);
  return [...new Set([...targets, ...groups])].sort();
}
