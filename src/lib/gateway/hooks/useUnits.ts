import { useQuery } from '@tanstack/react-query';

import unidadesData from '../../../data/unidades.json';
import type { Unidad } from '../../../types';
import { gatewayKeys, GATEWAY_STALE_TIME } from '../queryKeys';

const UNIDADES = unidadesData as Unidad[];

export function useUnits() {
  const query = useQuery({
    queryKey: gatewayKeys.units(),
    queryFn: async () => UNIDADES,
    staleTime: GATEWAY_STALE_TIME,
    initialData: UNIDADES,
  });

  const unidades = query.data ?? UNIDADES;

  const getSimbolo = (unidadId: number): string => {
    const unidad = unidades.find((u) => u.id === unidadId);
    return unidad?.simbolo ?? '';
  };

  const getUnidad = (unidadId: number): Unidad | undefined =>
    unidades.find((u) => u.id === unidadId);

  const formatearValor = (valor: number, unidadId: number): string => {
    const simbolo = getSimbolo(unidadId);
    return `${valor}${simbolo}`;
  };

  return {
    unidades,
    isLoading: query.isLoading,
    getSimbolo,
    getUnidad,
    formatearValor,
  };
}

export { UNIDADES };
