import {
  exerciseDetailResponseSchema,
  exerciseListResponseSchema,
  exerciseSearchResponseSchema,
} from '../schemas';
import type {
  ExerciseDetail,
  ExerciseListItem,
  ExerciseSearchItem,
  PaginationMeta,
} from '../schemas';
import { request } from '../http';
import {
  validateExerciseId,
  validateListParams,
  validateSearchTerm,
  type ExerciseListParams,
} from '../validators';

export interface ExerciseListResult {
  items: ExerciseListItem[];
  meta: PaginationMeta;
}

export const searchExercises = async (
  search: string,
): Promise<ExerciseSearchItem[]> => {
  const term = validateSearchTerm(search);
  const response = await request('/exercises/search', {
    schema: exerciseSearchResponseSchema,
    searchParams: { search: term },
  });

  return response.data;
};

export const getExerciseById = async (
  exerciseId: string,
): Promise<ExerciseDetail> => {
  const id = validateExerciseId(exerciseId);
  const response = await request(`/exercises/${encodeURIComponent(id)}`, {
    schema: exerciseDetailResponseSchema,
  });

  return response.data;
};

export const listExercises = async (
  params: ExerciseListParams,
): Promise<ExerciseListResult> => {
  const validated = validateListParams(params);
  const response = await request('/exercises', {
    schema: exerciseListResponseSchema,
    searchParams: {
      name: validated.name,
      keywords: validated.keywords,
      cursor: validated.cursor,
      limit: validated.limit,
    },
  });

  return {
    items: response.data,
    meta: response.meta,
  };
};
