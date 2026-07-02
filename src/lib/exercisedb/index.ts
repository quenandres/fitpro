export { EXERCISEDB_BASE_URL, EXERCISEDB_HOST, buildHeaders, getApiKey } from './config';
export { ExerciseDbError, ExerciseDbValidationError } from './errors';
export { request } from './http';
export {
  exerciseDbKeys,
  REFERENCE_STALE_TIME,
} from './queryKeys';
export {
  useBodyParts,
  useEquipments,
  useExercise,
  useExercises,
  useExerciseSearch,
  useExerciseTypes,
  useMuscles,
} from './hooks';
export type {
  ExerciseDetail,
  ExerciseDetailResponse,
  ExerciseListItem,
  ExerciseListResponse,
  ExerciseSearchItem,
  ExerciseSearchResponse,
  PaginationMeta,
  ReferenceItem,
  ReferenceListResponse,
} from './schemas';
export {
  getExerciseById,
  listExercises,
  searchExercises,
} from './services/exercises.service';
export type { ExerciseListResult } from './services/exercises.service';
export {
  getBodyParts,
  getEquipments,
  getExerciseTypes,
  getMuscles,
} from './services/reference.service';
export {
  validateExerciseId,
  validateListParams,
  validateSearchTerm,
} from './validators';
export type { ExerciseListParams } from './validators';
