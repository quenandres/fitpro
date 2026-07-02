import type { ExerciseListParams } from './validators';

export const exerciseDbKeys = {
  all: ['exercisedb'] as const,
  search: (term: string) => [...exerciseDbKeys.all, 'search', term] as const,
  detail: (exerciseId: string) =>
    [...exerciseDbKeys.all, 'detail', exerciseId] as const,
  list: (params: ExerciseListParams) =>
    [...exerciseDbKeys.all, 'list', params] as const,
  muscles: () => [...exerciseDbKeys.all, 'muscles'] as const,
  equipments: () => [...exerciseDbKeys.all, 'equipments'] as const,
  exerciseTypes: () => [...exerciseDbKeys.all, 'exerciseTypes'] as const,
  bodyParts: () => [...exerciseDbKeys.all, 'bodyParts'] as const,
};

export const REFERENCE_STALE_TIME = 1000 * 60 * 60 * 24;
