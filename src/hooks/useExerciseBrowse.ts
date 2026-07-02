import { useMemo } from 'react';

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
}

function filterListItems(
  items: ExerciseListItem[],
  exerciseType: string,
  bodyPart: string,
  equipment: string,
): ExerciseListItem[] {
  return items.filter((item) => {
    const okType = !exerciseType || item.exerciseType === exerciseType;
    const okBody = !bodyPart || item.bodyParts.includes(bodyPart);
    const okEquip = !equipment || item.equipments.includes(equipment);
    return okType && okBody && okEquip;
  });
}

export const useExerciseBrowse = (search: string, filters: ExerciseBrowseFilters) => {
  const debouncedSearch = useDebouncedValue(search, 300);
  const isSearching = debouncedSearch.trim().length >= 2;

  const listKeywords = buildKeywords(
    filters.exerciseType,
    filters.bodyPart,
    filters.equipment,
  );

  const searchQuery = useExerciseSearch(debouncedSearch, isSearching);
  const listQuery = useExercises({ keywords: listKeywords }, !isSearching);

  const listItems = useMemo(() => {
    const items =
      listQuery.data?.pages.flatMap((page: ExerciseListResult) => page.items) ?? [];
    return filterListItems(
      items,
      filters.exerciseType,
      filters.bodyPart,
      filters.equipment,
    );
  }, [listQuery.data, filters.exerciseType, filters.bodyPart, filters.equipment]);

  const displayItems: Array<ExerciseListItem | ExerciseSearchItem> = isSearching
    ? (searchQuery.data ?? [])
    : listItems;

  const isLoading = isSearching ? searchQuery.isLoading : listQuery.isLoading;
  const isError = isSearching ? searchQuery.isError : listQuery.isError;
  const error = isSearching ? searchQuery.error : listQuery.error;

  const totalCount = isSearching
    ? (searchQuery.data?.length ?? 0)
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
