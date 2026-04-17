import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_RECOVERY, MUSCLE_MAP } from './anatomy.constants';
import type { AnatomyView, Gender, RecoveryState } from './anatomy.types';

interface UseAnatomyTrackerParams {
  initialGender?: Gender;
  initialView?: AnatomyView;
  onRecoveryChange?: (state: RecoveryState) => void;
}

/**
 * Encapsula todo el estado del tracker de recuperación: género, vista,
 * músculo seleccionado, mapa de recuperación y toggle de heatmap. Mantiene
 * la API imperativa (handlers) y expone datos derivados (músculos, nivel).
 */
export function useAnatomyTracker({
  initialGender = 'male',
  initialView = 'front',
  onRecoveryChange,
}: UseAnatomyTrackerParams = {}) {
  const [gender, setGender] = useState<Gender>(initialGender);
  const [view, setView] = useState<AnatomyView>(initialView);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [recovery, setRecovery] = useState<RecoveryState>({});

  // Evita re-suscripciones si el padre pasa un callback inline (nueva ref cada render).
  const onRecoveryChangeRef = useRef(onRecoveryChange);
  useEffect(() => {
    onRecoveryChangeRef.current = onRecoveryChange;
  }, [onRecoveryChange]);

  useEffect(() => {
    onRecoveryChangeRef.current?.(recovery);
  }, [recovery]);

  const muscles = useMemo(
    () => MUSCLE_MAP[view]?.[gender] ?? [],
    [view, gender],
  );

  const getLevel = useCallback(
    (canonical: string) => recovery[canonical] ?? DEFAULT_RECOVERY,
    [recovery],
  );

  const selectMuscle = useCallback((canonical: string) => {
    setSelected(canonical);
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(null);
  }, []);

  const updateLevel = useCallback(
    (newLevel: number) => {
      setSelected((currentSelected) => {
        if (!currentSelected) return currentSelected;
        setRecovery((prev) => ({ ...prev, [currentSelected]: newLevel }));
        return currentSelected;
      });
    },
    [],
  );

  const resetAll = useCallback(() => {
    setRecovery({});
    setSelected(null);
  }, []);

  const toggleHeatmap = useCallback(() => {
    setShowHeatmap((v) => !v);
  }, []);

  const changeGender = useCallback((next: Gender) => {
    setGender(next);
    setSelected(null);
  }, []);

  const changeView = useCallback((next: AnatomyView) => {
    setView(next);
    setSelected(null);
  }, []);

  return {
    gender,
    view,
    showHeatmap,
    selected,
    muscles,
    getLevel,
    selectMuscle,
    clearSelection,
    updateLevel,
    resetAll,
    toggleHeatmap,
    changeGender,
    changeView,
  };
}

export type UseAnatomyTrackerReturn = ReturnType<typeof useAnatomyTracker>;
