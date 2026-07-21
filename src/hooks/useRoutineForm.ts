import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDataStore } from '../store/useDataStore';
import type { RoutineFormData, RoutineFormExercise, RoutineFormLevel, Rutina } from '../types';
import { calculateRoutineDuration } from '../utils/calculateRoutineDuration';
import { validateRoutineByLevel } from '../utils/routineFormValidators';

const uid = (): string =>
  `ex_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

const BASE_BY_LEVEL: Record<RoutineFormLevel, Partial<RoutineFormData>> = {
  basica: {
    dificultad: 'Principiante',
    categoria: 'Fuerza',
    duracion_min: 30,
    descripcion: '',
    tipo: 'estandar',
    rest_between_sets: 60,
    notes: '',
  },
  intermedia: {
    dificultad: 'Intermedio',
    categoria: '',
    duracion_min: 45,
    descripcion: '',
    tipo: 'estandar',
    rest_between_sets: 60,
    notes: '',
  },
  avanzada: {
    dificultad: 'Avanzado',
    categoria: '',
    duracion_min: 60,
    descripcion: '',
    tipo: 'estandar',
    rest_between_sets: 90,
    notes: '',
  },
};

export const createEmptyRoutineForm = (level: RoutineFormLevel): RoutineFormData => ({
  nombre: '',
  ejercicios: [],
  ...BASE_BY_LEVEL[level],
  categoria: BASE_BY_LEVEL[level].categoria ?? '',
  descripcion: BASE_BY_LEVEL[level].descripcion ?? '',
  duracion_min: BASE_BY_LEVEL[level].duracion_min ?? 45,
  tipo: BASE_BY_LEVEL[level].tipo ?? 'estandar',
  rest_between_sets: BASE_BY_LEVEL[level].rest_between_sets ?? 60,
  notes: BASE_BY_LEVEL[level].notes ?? '',
  dificultad: BASE_BY_LEVEL[level].dificultad ?? 'Intermedio',
});

export const useRoutineForm = (
  level: RoutineFormLevel,
  initialForm?: RoutineFormData,
  editingId?: number | null,
) => {
  const navigate = useNavigate();
  const addRutina = useDataStore((s) => s.addRutina);
  const updateRutina = useDataStore((s) => s.updateRutina);
  const [form, setForm] = useState<RoutineFormData>(
    () => initialForm ?? createEmptyRoutineForm(level),
  );
  const [errors, setErrors] = useState<ReturnType<typeof validateRoutineByLevel>>([]);
  const [savedId, setSavedId] = useState<number | null>(null);

  const durationBreakdown = useMemo(
    () =>
      calculateRoutineDuration({
        ejercicios: form.ejercicios,
        restBetweenSetsSec: form.rest_between_sets,
      }),
    [form.ejercicios, form.rest_between_sets],
  );

  useEffect(() => {
    setForm((prev) =>
      prev.duracion_min === durationBreakdown.totalMinutes
        ? prev
        : { ...prev, duracion_min: durationBreakdown.totalMinutes },
    );
  }, [durationBreakdown.totalMinutes]);

  const loadForm = useCallback((data: RoutineFormData) => {
    setForm(data);
    setErrors([]);
    setSavedId(null);
  }, []);

  const setField = useCallback(<K extends keyof RoutineFormData>(key: K, value: RoutineFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors([]);
  }, []);

  const addExercise = useCallback((picked: {
    nombre: string;
    unidad_id_default: number;
    exerciseDbId?: string;
    imageUrl?: string;
    musculos_anatomia?: string[];
  }) => {
    const entry: RoutineFormExercise = {
      _key: uid(),
      nombre: picked.nombre,
      series: 3,
      valor: 10,
      unidad_id: picked.unidad_id_default,
      exerciseDbId: picked.exerciseDbId,
      imageUrl: picked.imageUrl,
      musculos_anatomia: picked.musculos_anatomia,
    };
    setForm((prev) => ({ ...prev, ejercicios: [...prev.ejercicios, entry] }));
    setErrors([]);
  }, []);

  const updateExercise = useCallback(
    (key: string, patch: Partial<RoutineFormExercise>) => {
      setForm((prev) => ({
        ...prev,
        ejercicios: prev.ejercicios.map((ej) =>
          (ej._key ?? ej.nombre) === key ? { ...ej, ...patch } : ej,
        ),
      }));
      setErrors([]);
    },
    [],
  );

  const removeExercise = useCallback((key: string) => {
    setForm((prev) => ({
      ...prev,
      ejercicios: prev.ejercicios.filter((ej) => (ej._key ?? ej.nombre) !== key),
    }));
    setErrors([]);
  }, []);

  const createSuperset = useCallback((keys: string[]) => {
    if (keys.length < 2) return;
    const groupId = `ss_${uid()}`;
    setForm((prev) => ({
      ...prev,
      ejercicios: prev.ejercicios.map((ej) => {
        const id = ej._key ?? ej.nombre;
        return keys.includes(id) ? { ...ej, grupo_superset: groupId } : ej;
      }),
    }));
  }, []);

  const removeSuperset = useCallback((groupId: string) => {
    setForm((prev) => ({
      ...prev,
      ejercicios: prev.ejercicios.map((ej) =>
        ej.grupo_superset === groupId ? { ...ej, grupo_superset: undefined } : ej,
      ),
    }));
  }, []);

  /** Persiste músculos resueltos desde ExerciseDB en el estado del formulario. */
  const mergeResolvedMuscles = useCallback(
    (updates: ReadonlyArray<{ key: string; musculos_anatomia: string[] }>) => {
      if (updates.length === 0) return;
      setForm((prev) => ({
        ...prev,
        ejercicios: prev.ejercicios.map((ej) => {
          if (ej.musculos_anatomia?.length) return ej;
          const key = ej._key ?? ej.nombre;
          const match = updates.find((u) => u.key === key);
          if (!match?.musculos_anatomia.length) return ej;
          return { ...ej, musculos_anatomia: match.musculos_anatomia };
        }),
      }));
    },
    [],
  );

  const toRutinaPayload = useCallback((): Omit<Rutina, 'id'> => {
    const { ejercicios, ...rest } = form;
    const payload: Omit<Rutina, 'id'> = {
      nombre: rest.nombre.trim(),
      categoria: rest.categoria || 'Fuerza',
      dificultad: rest.dificultad,
      duracion_min: rest.duracion_min,
      descripcion: rest.descripcion.trim(),
      ejercicios: ejercicios.map(({ _key: _k, ...ej }) => ({ ...ej })),
    };

    if (level !== 'basica') {
      payload.rest_between_sets = rest.rest_between_sets;
      payload.notes = rest.notes.trim() || undefined;
    }

    if (level === 'avanzada') {
      payload.tipo = rest.tipo;
    }

    return payload;
  }, [form, level]);

  const save = useCallback((): number | null => {
    const validation = validateRoutineByLevel(level, form);
    if (validation.length > 0) {
      setErrors(validation);
      return null;
    }
    const payload = toRutinaPayload();
    if (editingId != null) {
      updateRutina(editingId, payload);
      setSavedId(editingId);
      return editingId;
    }
    const id = addRutina(payload);
    setSavedId(id);
    return id;
  }, [addRutina, editingId, form, level, toRutinaPayload, updateRutina]);

  const validateStep1 = useCallback((): boolean => {
    const stepErrors = validateRoutineByLevel(level, form);
    setErrors(stepErrors);
    return stepErrors.length === 0;
  }, [form, level]);

  const selectedNames = useMemo(
    () => form.ejercicios.map((e) => e.nombre),
    [form.ejercicios],
  );

  return {
    form,
    errors,
    savedId,
    editingId: editingId ?? null,
    isEdit: editingId != null,
    durationBreakdown,
    setField,
    addExercise,
    updateExercise,
    removeExercise,
    createSuperset,
    removeSuperset,
    mergeResolvedMuscles,
    save,
    validateStep1,
    loadForm,
    selectedNames,
    navigate,
  };
};
