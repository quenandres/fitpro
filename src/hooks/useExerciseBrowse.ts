import { useEffect, useMemo } from 'react';

import {
  useExercises,
  useExerciseSearch,
} from '../lib/exercisedb';
import { buildKeywords } from '../lib/exercisedb/utils';
import type { ExerciseListItem, ExerciseSearchItem } from '../lib/exercisedb';
import type { ExerciseListResult } from '../lib/exercisedb/services/exercises.service';
import { useDebouncedValue } from './useDebouncedValue';

export interface ExerciseBrowseFilters {
  exerciseType: string;
  bodyPart: string;
  equipment: string;
  muscle?: string;
}

const MIN_FILTERED_RESULTS = 10;
const MAX_AUTO_PAGES = 8;

function filterListItems(
  items: ExerciseListItem[],
  exerciseType: string,
  bodyPart: string,
  equipment: string,
  muscle: string,
): ExerciseListItem[] {
  return items.filter((item) => {
    const okType = !exerciseType || item.exerciseType === exerciseType;
    const okBody = !bodyPart || item.bodyParts.includes(bodyPart);
    const okEquip = !equipment || item.equipments.includes(equipment);
    const okMuscle =
      !muscle ||
      item.targetMuscles.includes(muscle) ||
      item.secondaryMuscles.includes(muscle);
    return okType && okBody && okEquip && okMuscle;
  });
}

export const useExerciseBrowse = (search: string, filters: ExerciseBrowseFilters) => {
  const debouncedSearch = useDebouncedValue(search, 300);
  const isSearching = debouncedSearch.trim().length >= 2;
  const muscle = filters.muscle ?? '';
  const hasClientFilters = Boolean(
    filters.exerciseType || filters.bodyPart || filters.equipment || muscle,
  );

  const listKeywords = buildKeywords(
    filters.exerciseType,
    filters.bodyPart,
    filters.equipment,
    muscle,
  );

  const searchQuery = useExerciseSearch(debouncedSearch, isSearching);
  // Con filtros de catálogo pedimos páginas más grandes: la API no filtra por
  // exerciseType exacto y el match por keywords es aproximado.
  const listQuery = useExercises(
    {
      keywords: listKeywords,
      ...(hasClientFilters ? { limit: 50 } : {}),
    },
    !isSearching,
  );

  const listItems = useMemo(() => {
    const items =
      listQuery.data?.pages.flatMap((page: ExerciseListResult) => page.items) ?? [];
    return filterListItems(
      items,
      filters.exerciseType,
      filters.bodyPart,
      filters.equipment,
      muscle,
    );
  }, [
    listQuery.data,
    filters.exerciseType,
    filters.bodyPart,
    filters.equipment,
    muscle,
  ]);

  // Si el filtro en cliente deja la página casi vacía, pedir más páginas
  // (la API no filtra por exerciseType exacto; solo por texto en keywords).
  useEffect(() => {
    if (isSearching || !hasClientFilters) return;
    if (listQuery.isFetching || listQuery.isFetchingNextPage) return;
    if (!listQuery.hasNextPage) return;

    const pagesLoaded = listQuery.data?.pages.length ?? 0;
    if (pagesLoaded >= MAX_AUTO_PAGES) return;
    if (listItems.length >= MIN_FILTERED_RESULTS) return;

    void listQuery.fetchNextPage();
  }, [
    isSearching,
    hasClientFilters,
    listItems.length,
    listQuery.isFetching,
    listQuery.isFetchingNextPage,
    listQuery.hasNextPage,
    listQuery.data?.pages.length,
    listQuery.fetchNextPage,
  ]);

  const displayItems: Array<ExerciseListItem | ExerciseSearchItem> = isSearching
    ? (searchQuery.data ?? [])
    : listItems;

  const isLoading = isSearching
    ? searchQuery.isLoading
    : listQuery.isLoading ||
      (hasClientFilters &&
        listItems.length === 0 &&
        Boolean(listQuery.hasNextPage) &&
        (listQuery.isFetching || listQuery.isFetchingNextPage));

  const isError = isSearching ? searchQuery.isError : listQuery.isError;
  const error = isSearching ? searchQuery.error : listQuery.error;

  const totalCount = isSearching
    ? (searchQuery.data?.length ?? 0)
    : hasClientFilters
      ? listItems.length
      : (listQuery.data?.pages[0]?.meta.total ?? listItems.length);

  const refetch = () => {
    if (isSearching) {
      void searchQuery.refetch();
    } else {
      void listQuery.refetch();
    }
  };

  return {
    debouncedSearch,
    isSearching,
    displayItems,
    isLoading,
    isError,
    error,
    totalCount,
    listQuery,
    refetch,
  };
};
