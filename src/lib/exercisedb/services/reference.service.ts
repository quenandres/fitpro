import { mockReferenceItems } from '../../../demo/exercisedb-local';
import { isMockMode } from '../../mock-mode';
import { referenceListResponseSchema } from '../schemas';
import type { ReferenceItem } from '../schemas';
import { request } from '../http';

const fetchReferenceCatalog = async (path: string): Promise<ReferenceItem[]> => {
  const response = await request(path, {
    schema: referenceListResponseSchema,
  });

  return response.data;
};

export const getMuscles = (): Promise<ReferenceItem[]> =>
  isMockMode() ? Promise.resolve(mockReferenceItems('muscles')) : fetchReferenceCatalog('/muscles');

export const getEquipments = (): Promise<ReferenceItem[]> =>
  isMockMode() ? Promise.resolve(mockReferenceItems('equipments')) : fetchReferenceCatalog('/equipments');

export const getExerciseTypes = (): Promise<ReferenceItem[]> =>
  isMockMode() ? Promise.resolve(mockReferenceItems('types')) : fetchReferenceCatalog('/exercisetypes');

export const getBodyParts = (): Promise<ReferenceItem[]> =>
  isMockMode() ? Promise.resolve(mockReferenceItems('bodyparts')) : fetchReferenceCatalog('/bodyparts');
