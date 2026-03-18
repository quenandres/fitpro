import { useDataStore } from '../store/useDataStore';
import type { Unidad } from '../types';

export const useUnits = () => {
  const unidades = useDataStore(state => state.unidades);
  
  const getSimbolo = (unidadId: number): string => {
    const unidad = unidades.find(u => u.id === unidadId);
    return unidad?.simbolo || '';
  };

  const getUnidad = (unidadId: number): Unidad | undefined => {
    return unidades.find(u => u.id === unidadId);
  };

  const formatearValor = (valor: number, unidadId: number): string => {
    const simbolo = getSimbolo(unidadId);
    return `${valor}${simbolo}`;
  };

  return { unidades, getSimbolo, getUnidad, formatearValor };
};
