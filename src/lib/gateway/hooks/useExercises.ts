import { useMemo } from 'react';
import {
  useInfiniteQuery,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query';

import {
  exerciseDtoToEjercicio,
  exerciseDtoToListItem,
  type GatewayExerciseListItem,
} from '../adapters/exerciseAdapter';
import {
  getExerciseById,
  listBodyParts,
  listEquipments,
  listExercises,
  listTargetMuscles,
  type ExerciseListParams,
} from '../exercises.service';
import { gatewayKeys, GATEWAY_STALE_TIME } from '../queryKeys';
import type { Ejercicio } from '../../../types';
import type { ExerciseDetailDto } from '../schemas/exercises';

const PAGE_SIZE = 40;

export function useExercises(params: ExerciseListParams = {}, enabled = true) {
  return useQuery({
    queryKey: gatewayKeys.exercises.list(params as Record<string, unknown>),
    queryFn: () => listExercises({ limit: params.limit ?? PAGE_SIZE, ...params }),
    enabled,
    staleTime: GATEWAY_STALE_TIME,
  });
}

export function useExercisesInfinite(params: Omit<ExerciseListParams, 'offset'> = {}, enabled = true) {
  return useInfiniteQuery({
    queryKey: gatewayKeys.exercises.list({ ...params, mode: 'infinite' }),
    queryFn: ({ pageParam = 0 }) =>
      listExercises({
        ...params,
        limit: PAGE_SIZE,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastOffset) =>
      lastPage.length >= PAGE_SIZE ? lastOffset + PAGE_SIZE : undefined,
    enabled,
    staleTime: GATEWAY_STALE_TIME,
  });
}

export function useExerciseCatalog(enabled = true): UseQueryResult<Ejercicio[], Error> {
  return useQuery({
    queryKey: gatewayKeys.exercises.list({ mode: 'catalog' }),
    queryFn: async () => {
      const rows = await listExercises({ limit: 500 });
      return rows.map(exerciseDtoToEjercicio);
    },
    enabled,
    staleTime: GATEWAY_STALE_TIME,
  });
}

export function useExerciseDetail(id: number | undefined): UseQueryResult<ExerciseDetailDto, Error> {
  return useQuery({
    queryKey: gatewayKeys.exercises.detail(id ?? 0),
    queryFn: () => getExerciseById(id!),
    enabled: id != null && id > 0,
    staleTime: GATEWAY_STALE_TIME,
  });
}

export function useGatewayBodyParts() {
  return useQuery({
    queryKey: gatewayKeys.exercises.bodyParts(),
    queryFn: listBodyParts,
    staleTime: GATEWAY_STALE_TIME,
  });
}

export function useGatewayEquipments() {
  return useQuery({
    queryKey: gatewayKeys.exercises.equipments(),
    queryFn: listEquipments,
    staleTime: GATEWAY_STALE_TIME,
  });
}

export function useGatewayMuscles() {
  return useQuery({
    queryKey: gatewayKeys.exercises.muscles(),
    queryFn: listTargetMuscles,
    staleTime: GATEWAY_STALE_TIME,
  });
}

export function useGatewayExerciseBrowse(
  search: string,
  filters: { bodyPart?: string; equipment?: string; muscle?: string },
) {
  const params = useMemo(
    () => ({
      search: search.trim().length >= 2 ? search.trim() : undefined,
      bodyPart: filters.bodyPart || undefined,
      equipment: filters.equipment || undefined,
      muscle: filters.muscle || undefined,
    }),
    [search, filters.bodyPart, filters.equipment, filters.muscle],
  );

  const query = useExercisesInfinite(params, true);

  const displayItems: GatewayExerciseListItem[] = useMemo(() => {
    const pages = query.data?.pages ?? [];
    return pages.flatMap((page) => page.map(exerciseDtoToListItem));
  }, [query.data?.pages]);

  return {
    ...query,
    displayItems,
    totalCount: displayItems.length,
    isSearching: search.trim().length >= 2,
  };
}
