import unidadesData from '../data/unidades.json';
import type { Unidad } from '../types';

export const UNIDADES: Unidad[] = unidadesData as Unidad[];

export const getUnidadById = (id: number): Unidad | undefined =>
  UNIDADES.find((u) => u.id === id);

export const getSimboloUnidad = (id: number): string => getUnidadById(id)?.simbolo ?? '';
