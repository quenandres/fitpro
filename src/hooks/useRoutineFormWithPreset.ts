import { useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useDataStore } from '../store/useDataStore';
import { useRoutineForm } from './useRoutineForm';
import { rutinaToFormData } from '../utils/inferRoutineFormLevel';
import type { RoutineFormData, RoutineFormLevel } from '../types';

export interface RoutinePresetLocationState {
  presetForm?: RoutineFormData;
  presetName?: string;
  matchInfo?: { matched: number; total: number };
  fromAdmin?: boolean;
}

export const useRoutineFormWithPreset = (level: RoutineFormLevel) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const rutinas = useDataStore((s) => s.rutinas);

  const state = (location.state ?? {}) as RoutinePresetLocationState;
  const editingId = searchParams.get('id') ? Number(searchParams.get('id')) : null;
  const fromAdmin = searchParams.get('from') === 'admin' || state.fromAdmin;

  const editingRutina = useMemo(
    () => (editingId != null ? rutinas.find((r) => r.id === editingId) ?? null : null),
    [editingId, rutinas],
  );

  const initialForm = state.presetForm ?? (editingRutina ? rutinaToFormData(editingRutina) : undefined);

  return {
    ...useRoutineForm(level, initialForm, editingId),
    presetName: state.presetName,
    matchInfo: state.matchInfo,
    fromAdmin,
    editingRutina,
  };
};

export const LEVEL_ROUTES: Record<RoutineFormLevel, string> = {
  basica: '/library/rutina/basica',
  intermedia: '/library/rutina/intermedia',
  avanzada: '/library/rutina/avanzada',
};
