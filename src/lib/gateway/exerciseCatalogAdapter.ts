import type { GatewayExercise } from './exercises.service';
import type { ExerciseListItem } from '../exercisedb/schemas';

export type CatalogReferenceItem = {
  name: string;
  imageUrl: string;
};

export const CATALOG_IMAGE_PLACEHOLDER =
  'https://placehold.co/120x120/e2e8f0/64748b?text=Ejercicio';

export const REFERENCE_IMAGE_PLACEHOLDER =
  'https://placehold.co/400x300/e2e8f0/64748b?text=Cat%C3%A1logo';

export function gatewayExerciseToListItem(row: GatewayExercise): ExerciseListItem {
  const imageUrl =
    row.image_url && row.image_url.startsWith('http')
      ? row.image_url
      : CATALOG_IMAGE_PLACEHOLDER;

  return {
    exerciseId: String(row.id),
    name: row.name,
    imageUrl,
    bodyParts: row.body_part ? [row.body_part] : [],
    equipments: row.equipment ? [row.equipment] : [],
    exerciseType: row.muscle_group || 'General',
    targetMuscles: row.target ? [row.target] : [],
    secondaryMuscles: [],
    keywords: [],
  };
}

export function toCatalogReferenceItem(name: string): CatalogReferenceItem {
  return { name, imageUrl: REFERENCE_IMAGE_PLACEHOLDER };
}
