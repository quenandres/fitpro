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
  fetchReferenceCatalog('/muscles');

export const getEquipments = (): Promise<ReferenceItem[]> =>
  fetchReferenceCatalog('/equipments');

export const getExerciseTypes = (): Promise<ReferenceItem[]> =>
  fetchReferenceCatalog('/exercisetypes');

export const getBodyParts = (): Promise<ReferenceItem[]> =>
  fetchReferenceCatalog('/bodyparts');
