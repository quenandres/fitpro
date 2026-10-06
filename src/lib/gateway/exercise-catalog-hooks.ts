import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  CATALOG_IMAGE_PLACEHOLDER,
  gatewayExerciseToListItem,
} from './exerciseCatalogAdapter';
import { isMockMode } from '../mock-mode';
import {
  fetchExerciseById,
  getExerciseMedia,
  listExerciseReference,
  queryExercises,
  type GatewayExercise,
} from './exercises.service';
export const exerciseCatalogKeys = {
  all: ['exercise-catalog'] as const,
  reference: (table: string) => [...exerciseCatalogKeys.all, 'reference', table] as const,
  browse: (search: string, filters: CatalogBrowseFilters) =>
    [...exerciseCatalogKeys.all, 'browse', search, filters] as const,
  detail: (id: string) => [...exerciseCatalogKeys.all, 'detail', id] as const,
  media: (id: number) => [...exerciseCatalogKeys.all, 'media', id] as const,
};

const REFERENCE_STALE_TIME = 1000 * 60 * 60 * 24;

export type CatalogBrowseFilters = {
  exerciseType: string;
  bodyPart: string;
  equipment: string;
  muscle: string;
};

function buildCatalogFilters(
  search: string,
  filters: CatalogBrowseFilters,
): Record<string, string> {
  const f: Record<string, string> = {};
  const term = search.trim();
  if (term.length >= 2) f.name = `ilike.*${term}*`;
  if (filters.bodyPart) f.body_part = `eq.${filters.bodyPart}`;
  if (filters.equipment) f.equipment = `eq.${filters.equipment}`;
  if (filters.muscle) f.target = `eq.${filters.muscle}`;
  if (filters.exerciseType) f.muscle_group = `eq.${filters.exerciseType}`;
  return f;
}

function useExerciseReference(table: Parameters<typeof listExerciseReference>[0]) {
  return useQuery({
    queryKey: exerciseCatalogKeys.reference(table),
    queryFn: () => listExerciseReference(table),
    staleTime: REFERENCE_STALE_TIME,
  });
}

export function useGatewayBodyParts() {
  return useExerciseReference('body_parts');
}

export function useGatewayEquipments() {
  return useExerciseReference('equipment');
}

export function useGatewayTargetMuscles() {
  return useExerciseReference('target_muscles');
}

export function useGatewayMuscleGroups() {
  return useExerciseReference('muscle_groups');
}

export function useGatewayExerciseCatalogBrowse(
  search: string,
  filters: CatalogBrowseFilters,
) {
  const debouncedSearch = useDebouncedValue(search, 300);
  const isSearching = debouncedSearch.trim().length >= 2;

  const listQuery = useInfiniteQuery({
    queryKey: exerciseCatalogKeys.browse(debouncedSearch, filters),
    queryFn: ({ pageParam }) =>
      queryExercises({
        filters: buildCatalogFilters(debouncedSearch, filters),
        limit: 30,
        page: pageParam,
      }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const pagination = last.pagination;
      if (!pagination || pagination.page >= pagination.total_pages) return undefined;
      return pagination.page + 1;
    },
    staleTime: 60_000,
  });

  const displayItems = useMemo(
    () =>
      listQuery.data?.pages.flatMap((page) => page.data.map(gatewayExerciseToListItem)) ?? [],
    [listQuery.data],
  );

  const totalCount =
    listQuery.data?.pages[0]?.pagination?.total_records ?? displayItems.length;

  return {
    debouncedSearch,
    isSearching,
    displayItems,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,
    totalCount,
    listQuery,
    refetch: () => void listQuery.refetch(),
  };
}

export function useGatewayExerciseDetail(exerciseId: string | undefined) {
  const numericId = exerciseId ? Number(exerciseId) : NaN;
  const enabled = Boolean(exerciseId) && !Number.isNaN(numericId);

  return useQuery({
    queryKey: exerciseCatalogKeys.detail(exerciseId ?? ''),
    queryFn: () => fetchExerciseById(numericId),
    enabled,
    staleTime: 60_000,
  });
}

export function useGatewayExerciseMedia(
  exerciseId: number | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: exerciseCatalogKeys.media(exerciseId ?? 0),
    queryFn: () => getExerciseMedia(exerciseId!),
    enabled: enabled && exerciseId != null && !Number.isNaN(exerciseId),
    staleTime: 60_000 * 30,
  });
}

/** Miniatura del catálogo: media firmada vía gateway (no usar columnas image_url rotas). */
export function useExercisePreviewUrl(
  exerciseId: string,
  fallbackImageUrl: string,
  options?: { loadMedia?: boolean },
) {
  const loadMedia = options?.loadMedia ?? true;
  const numericId = Number(exerciseId);
  const needsSignedMedia =
    loadMedia &&
    !isMockMode() &&
    !Number.isNaN(numericId) &&
    numericId > 0 &&
    fallbackImageUrl === CATALOG_IMAGE_PLACEHOLDER;

  const mediaQuery = useGatewayExerciseMedia(
    needsSignedMedia ? numericId : undefined,
    needsSignedMedia,
  );

  const posterUrl =
    mediaQuery.data?.imagen_url ||
    (fallbackImageUrl !== CATALOG_IMAGE_PLACEHOLDER ? fallbackImageUrl : undefined);

  const videoUrl = mediaQuery.data?.gif_url;

  const fallbackStill =
    posterUrl ||
    videoUrl ||
    (fallbackImageUrl !== CATALOG_IMAGE_PLACEHOLDER ? fallbackImageUrl : CATALOG_IMAGE_PLACEHOLDER);

  return {
    videoUrl,
    posterUrl: posterUrl ?? CATALOG_IMAGE_PLACEHOLDER,
    fallbackStill,
    isLoadingPreview: needsSignedMedia && mediaQuery.isLoading,
    waitsForViewport: !loadMedia && fallbackImageUrl === CATALOG_IMAGE_PLACEHOLDER,
  };
}

export type GatewayExerciseDetailView = GatewayExercise & {
  media?: { imagen_url: string; gif_url: string };
};

export function useGatewayExerciseDetailView(exerciseId: string | null) {
  const detailQuery = useGatewayExerciseDetail(exerciseId ?? undefined);
  const mediaQuery = useGatewayExerciseMedia(
    detailQuery.data?.id,
  );

  return {
    data: detailQuery.data
      ? {
          ...detailQuery.data,
          media: mediaQuery.data,
        }
      : undefined,
    isLoading: detailQuery.isLoading || (detailQuery.data != null && mediaQuery.isLoading),
    isError: detailQuery.isError || mediaQuery.isError,
    refetch: () => {
      void detailQuery.refetch();
      void mediaQuery.refetch();
    },
  };
}
