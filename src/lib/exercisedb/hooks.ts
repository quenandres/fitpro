import {
  useInfiniteQuery,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query';

import {
  getExerciseById,
  listExercises,
  searchExercises,
} from './services/exercises.service';
import {
  getBodyParts,
  getEquipments,
  getExerciseTypes,
  getMuscles,
} from './services/reference.service';
import { exerciseDbKeys, REFERENCE_STALE_TIME } from './queryKeys';
import type {
  ExerciseDetail,
  ExerciseSearchItem,
  ReferenceItem,
} from './schemas';
import type { ExerciseListParams } from './validators';

export const useExerciseSearch = (
  term: string,
  enabled = true,
): UseQueryResult<ExerciseSearchItem[], Error> =>
  useQuery({
    queryKey: exerciseDbKeys.search(term),
    queryFn: () => searchExercises(term),
    enabled: enabled && term.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  });

export const useExercise = (
  exerciseId: string | undefined,
): UseQueryResult<ExerciseDetail, Error> =>
  useQuery({
    queryKey: exerciseDbKeys.detail(exerciseId ?? ''),
    queryFn: () => getExerciseById(exerciseId!),
    enabled: Boolean(exerciseId),
    staleTime: 1000 * 60 * 10,
  });

export const useExercises = (params: ExerciseListParams, enabled = true) =>
  useInfiniteQuery({
    queryKey: exerciseDbKeys.list(params),
    queryFn: ({ pageParam }) =>
      listExercises({
        ...params,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.nextCursor : undefined,
    enabled,
    staleTime: 1000 * 60 * 5,
  });

export const useMuscles = (): UseQueryResult<ReferenceItem[], Error> =>
  useQuery({
    queryKey: exerciseDbKeys.muscles(),
    queryFn: getMuscles,
    staleTime: REFERENCE_STALE_TIME,
  });

export const useEquipments = (): UseQueryResult<ReferenceItem[], Error> =>
  useQuery({
    queryKey: exerciseDbKeys.equipments(),
    queryFn: getEquipments,
    staleTime: REFERENCE_STALE_TIME,
  });

export const useExerciseTypes = (): UseQueryResult<ReferenceItem[], Error> =>
  useQuery({
    queryKey: exerciseDbKeys.exerciseTypes(),
    queryFn: getExerciseTypes,
    staleTime: REFERENCE_STALE_TIME,
  });

export const useBodyParts = (): UseQueryResult<ReferenceItem[], Error> =>
  useQuery({
    queryKey: exerciseDbKeys.bodyParts(),
    queryFn: getBodyParts,
    staleTime: REFERENCE_STALE_TIME,
  });
