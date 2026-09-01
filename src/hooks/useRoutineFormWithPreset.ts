import { useLocation, useSearchParams } from 'react-router-dom';
import { useTemplate } from '../lib/gateway/hooks/useTemplates';
import { inferInitialCreateMode, rutinaToFormData } from '../utils/inferRoutineFormLevel';
import { ROUTES } from '../routes/paths';
import type { RoutineFormData, RoutineFormLevel } from '../types';
import { useRoutineForm } from './useRoutineForm';

export interface RoutinePresetLocationState {
  presetForm?: RoutineFormData;
  presetName?: string;
  matchInfo?: { matched: number; total: number };
}

export const useRoutineFormWithPreset = (level: RoutineFormLevel) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get('id');

  const { data: editingRutina } = useTemplate(editingId ?? undefined);

  const state = (location.state ?? {}) as RoutinePresetLocationState;

  const initialForm = state.presetForm ?? (editingRutina ? rutinaToFormData(editingRutina) : undefined);
  const initialCreateMode = editingRutina
    ? inferInitialCreateMode(editingRutina)
    : 'semana_tipo';

  return {
    ...useRoutineForm(level, initialForm, editingId, initialCreateMode),
    presetName: state.presetName,
    matchInfo: state.matchInfo,
    editingRutina: editingRutina ?? null,
  };
};

export const LEVEL_ROUTES: Record<RoutineFormLevel, string> = {
  basica: ROUTES.library.rutinaNueva('basica'),
  intermedia: ROUTES.library.rutinaNueva('intermedia'),
  avanzada: ROUTES.library.rutinaNueva('avanzada'),
};
