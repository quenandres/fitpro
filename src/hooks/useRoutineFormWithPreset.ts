import { useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useDataStore } from '../store/useDataStore';
import { inferInitialCreateMode, rutinaToFormData } from '../utils/inferRoutineFormLevel';
import { ROUTES } from '../routes/paths';
import type { RoutineFormData, RoutineFormLevel } from '../types';
import { useRoutineForm } from './useRoutineForm';

export interface RoutinePresetLocationState {
  presetForm?: RoutineFormData;
  presetName?: string;
  matchInfo?: { matched: number; total: number };
}

export const useRoutineFormWithPreset = (
  level: RoutineFormLevel,
  presetStateOverride?: RoutinePresetLocationState | null,
) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const rutinas = useDataStore((s) => s.rutinas);
  const plantillas = useDataStore((s) => s.plantillas);

  const isPlantillaMode = searchParams.get('modo') === 'plantilla';
  const plantillaIdParam = searchParams.get('plantillaId');
  const plantillaId = plantillaIdParam ? Number(plantillaIdParam) : null;
  const rutinaIdParam = searchParams.get('id');
  const rutinaId = !isPlantillaMode && rutinaIdParam ? Number(rutinaIdParam) : null;

  const editingId = isPlantillaMode ? plantillaId : rutinaId;

  const state = (presetStateOverride ?? location.state ?? {}) as RoutinePresetLocationState;

  const editingRutina = useMemo(() => {
    if (isPlantillaMode) {
      return plantillaId != null ? plantillas.find((p) => p.id === plantillaId) ?? null : null;
    }
    return rutinaId != null ? rutinas.find((r) => r.id === rutinaId) ?? null : null;
  }, [isPlantillaMode, plantillaId, plantillas, rutinaId, rutinas]);

  const initialForm = useMemo(
    () => state.presetForm ?? (editingRutina ? rutinaToFormData(editingRutina) : undefined),
    [state.presetForm, editingRutina],
  );
  const initialCreateMode = useMemo(
    () => (editingRutina ? inferInitialCreateMode(editingRutina) : 'semana_tipo'),
    [editingRutina],
  );

  return {
    ...useRoutineForm(level, initialForm, editingId, initialCreateMode, {
      target: isPlantillaMode ? 'plantilla' : 'rutina',
      plantillaMeta: editingRutina?.plantilla,
    }),
    presetName: state.presetName,
    matchInfo: state.matchInfo,
    editingRutina,
    isPlantillaMode,
  };
};

export const LEVEL_ROUTES: Record<RoutineFormLevel, string> = {
  basica: ROUTES.library.rutinaNueva('basica'),
  intermedia: ROUTES.library.rutinaNueva('intermedia'),
  avanzada: ROUTES.library.rutinaNueva('avanzada'),
};
