import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDataStore } from '../store/useDataStore';
import type {
  RoutineCreateMode,
  RoutineFormData,
  RoutineFormExercise,
  RoutineFormLevel,
  Rutina,
} from '../types';
import { calculateRoutineDuration } from '../utils/calculateRoutineDuration';
import {
  applyTemplateToProgramacion,
  cloneSemanaForm,
  createProgramacionSemanas,
  expandProgramacionToSemanas,
  getDiaIndexByDia,
  MAX_RUTINA_SEMANAS,
  MIN_RUTINA_SEMANAS,
  programacionToPayload,
} from '../utils/routineScheduleUtils';
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
  semanas: 1,
  programacion_semanal: createProgramacionSemanas(1),
  ...BASE_BY_LEVEL[level],
  categoria: BASE_BY_LEVEL[level].categoria ?? '',
  descripcion: BASE_BY_LEVEL[level].descripcion ?? '',
  duracion_min: BASE_BY_LEVEL[level].duracion_min ?? 45,
  tipo: BASE_BY_LEVEL[level].tipo ?? 'estandar',
  rest_between_sets: BASE_BY_LEVEL[level].rest_between_sets ?? 60,
  notes: BASE_BY_LEVEL[level].notes ?? '',
  dificultad: BASE_BY_LEVEL[level].dificultad ?? 'Intermedio',
});

const getActiveEjercicios = (
  form: RoutineFormData,
  semanaActiva: number,
  diaIndex: number,
): RoutineFormExercise[] =>
  form.programacion_semanal.find((s) => s.semana === semanaActiva)?.dias[diaIndex]?.ejercicios ?? [];

const updateActiveDay = (
  form: RoutineFormData,
  semanaActiva: number,
  diaIndex: number,
  ejercicios: RoutineFormExercise[],
): RoutineFormData => ({
  ...form,
  programacion_semanal: form.programacion_semanal.map((s) =>
    s.semana !== semanaActiva
      ? s
      : {
          ...s,
          dias: s.dias.map((d, i) => (i === diaIndex ? { ...d, ejercicios } : d)),
        },
  ),
  ejercicios,
});

export const useRoutineForm = (
  level: RoutineFormLevel,
  initialForm?: RoutineFormData,
  editingId?: number | null,
  initialCreateMode: RoutineCreateMode = 'semana_tipo',
) => {
  const navigate = useNavigate();
  const addRutina = useDataStore((s) => s.addRutina);
  const updateRutina = useDataStore((s) => s.updateRutina);
  const [form, setForm] = useState<RoutineFormData>(
    () => initialForm ?? createEmptyRoutineForm(level),
  );
  const [errors, setErrors] = useState<ReturnType<typeof validateRoutineByLevel>>([]);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [createMode, setCreateModeState] = useState<RoutineCreateMode>(initialCreateMode);
  const [semanaActiva, setSemanaActiva] = useState(1);
  const [diaIndex, setDiaIndex] = useState(0);
  const [templateApplied, setTemplateApplied] = useState(
    () => initialCreateMode !== 'desde_plantilla' || Boolean(initialForm?.programacion_semanal.some((s) =>
      s.dias.some((d) => d.ejercicios.length > 0),
    )),
  );
  const [modeSwitchNotice, setModeSwitchNotice] = useState<string | null>(null);

  useEffect(() => {
    if (initialForm) {
      setForm(initialForm);
      setSemanaActiva(1);
      setDiaIndex(0);
      const hasContent = initialForm.programacion_semanal.some((s) =>
        s.dias.some((d) => d.ejercicios.length > 0),
      );
      if (hasContent) setTemplateApplied(true);
    }
  }, [initialForm]);

  const activeEjercicios = useMemo(
    () => getActiveEjercicios(form, semanaActiva, diaIndex),
    [form, semanaActiva, diaIndex],
  );

  const durationBreakdown = useMemo(
    () =>
      calculateRoutineDuration({
        ejercicios: activeEjercicios,
        restBetweenSetsSec: form.rest_between_sets,
      }),
    [activeEjercicios, form.rest_between_sets],
  );

  useEffect(() => {
    setForm((prev) =>
      prev.duracion_min === durationBreakdown.totalMinutes
        ? prev
        : { ...prev, duracion_min: durationBreakdown.totalMinutes },
    );
  }, [durationBreakdown.totalMinutes]);

  const syncActiveEjercicios = useCallback(
    (nextForm: RoutineFormData) => {
      const ejercicios = getActiveEjercicios(nextForm, semanaActiva, diaIndex);
      return { ...nextForm, ejercicios };
    },
    [semanaActiva, diaIndex],
  );

  const loadForm = useCallback((data: RoutineFormData) => {
    setForm(data);
    setErrors([]);
    setSavedId(null);
    setSemanaActiva(1);
    setDiaIndex(0);
    setTemplateApplied(true);
  }, []);

  const setField = useCallback(<K extends keyof RoutineFormData>(key: K, value: RoutineFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors([]);
  }, []);

  const setCreateMode = useCallback((mode: RoutineCreateMode) => {
    setCreateModeState((prev) => {
      if (prev === 'semana_tipo' && mode === 'semana_a_semana') {
        setModeSwitchNotice('Las copias dejan de actualizarse solas.');
      } else {
        setModeSwitchNotice(null);
      }
      return mode;
    });
  }, []);

  const setSemanas = useCallback(
    (n: number) => {
      const clamped = Math.min(MAX_RUTINA_SEMANAS, Math.max(MIN_RUTINA_SEMANAS, n));
      setForm((prev) => {
        const expandMode =
          createMode === 'semana_a_semana' ? 'empty' : 'clone_first';
        const programacion = expandProgramacionToSemanas(
          prev.programacion_semanal,
          clamped,
          expandMode,
        );
        const next = syncActiveEjercicios({ ...prev, semanas: clamped, programacion_semanal: programacion });
        return next;
      });
      setSemanaActiva((s) => Math.min(s, clamped));
      setErrors([]);
    },
    [createMode, syncActiveEjercicios],
  );

  const setSemanaActivaSafe = useCallback(
    (semana: number) => {
      const clamped = Math.min(Math.max(1, semana), form.semanas);
      setSemanaActiva(clamped);
      setForm((prev) => ({
        ...prev,
        ejercicios: getActiveEjercicios(prev, clamped, diaIndex),
      }));
      setErrors([]);
    },
    [form.semanas, diaIndex],
  );

  const setDiaActivo = useCallback(
    (index: number) => {
      setDiaIndex(index);
      setForm((prev) => ({
        ...prev,
        ejercicios: getActiveEjercicios(prev, semanaActiva, index),
      }));
      setErrors([]);
    },
    [semanaActiva],
  );

  const applyToAllWeeks = useCallback(() => {
    setForm((prev) => {
      const source = prev.programacion_semanal[0];
      if (!source) return prev;
      const programacion = prev.programacion_semanal.map((s, i) =>
        i === 0 ? s : cloneSemanaForm(source, s.semana),
      );
      return syncActiveEjercicios({ ...prev, programacion_semanal: programacion });
    });
    setErrors([]);
  }, [syncActiveEjercicios]);

  const copyWeekFrom = useCallback(
    (origenSemana: number) => {
      setForm((prev) => {
        const source = prev.programacion_semanal.find((s) => s.semana === origenSemana);
        if (!source) return prev;
        const programacion = prev.programacion_semanal.map((s) =>
          s.semana === semanaActiva ? cloneSemanaForm(source, s.semana) : s,
        );
        return syncActiveEjercicios({ ...prev, programacion_semanal: programacion });
      });
      setErrors([]);
    },
    [semanaActiva, syncActiveEjercicios],
  );

  const applyTemplate = useCallback(
    (source: Rutina | RoutineFormData, n: number) => {
      const clamped = Math.min(MAX_RUTINA_SEMANAS, Math.max(MIN_RUTINA_SEMANAS, n));
      const programacion = applyTemplateToProgramacion(source, clamped);
      setForm((prev) => {
        const merged: RoutineFormData = {
          ...prev,
          nombre: prev.nombre.trim() || source.nombre,
          categoria: 'categoria' in source ? source.categoria : prev.categoria,
          descripcion: 'descripcion' in source ? source.descripcion : prev.descripcion,
          dificultad: 'dificultad' in source ? source.dificultad : prev.dificultad,
          duracion_min: 'duracion_min' in source ? source.duracion_min : prev.duracion_min,
          tipo: 'tipo' in source && source.tipo ? source.tipo : prev.tipo,
          rest_between_sets:
            'rest_between_sets' in source && source.rest_between_sets != null
              ? source.rest_between_sets
              : prev.rest_between_sets,
          notes: 'notes' in source ? (source.notes ?? '') : prev.notes,
          semanas: clamped,
          programacion_semanal: programacion,
          ejercicios: programacion[0]?.dias[0]?.ejercicios ?? [],
        };
        return syncActiveEjercicios(merged);
      });
      setSemanaActiva(1);
      setDiaIndex(getDiaIndexByDia(programacion[0]?.dias ?? [], 1));
      setTemplateApplied(true);
      setCreateModeState('semana_tipo');
      setErrors([]);
    },
    [syncActiveEjercicios],
  );

  const mutateActiveDay = useCallback(
    (updater: (ejercicios: RoutineFormExercise[]) => RoutineFormExercise[]) => {
      setForm((prev) => {
        const current = getActiveEjercicios(prev, semanaActiva, diaIndex);
        const nextEjercicios = updater(current);
        return updateActiveDay(prev, semanaActiva, diaIndex, nextEjercicios);
      });
      setErrors([]);
    },
    [semanaActiva, diaIndex],
  );

  const addExercise = useCallback(
    (picked: {
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
      mutateActiveDay((ejercicios) => [...ejercicios, entry]);
    },
    [mutateActiveDay],
  );

  const updateExercise = useCallback(
    (key: string, patch: Partial<RoutineFormExercise>) => {
      mutateActiveDay((ejercicios) =>
        ejercicios.map((ej) =>
          (ej._key ?? ej.nombre) === key ? { ...ej, ...patch } : ej,
        ),
      );
    },
    [mutateActiveDay],
  );

  const removeExercise = useCallback(
    (key: string) => {
      mutateActiveDay((ejercicios) =>
        ejercicios.filter((ej) => (ej._key ?? ej.nombre) !== key),
      );
    },
    [mutateActiveDay],
  );

  const createSuperset = useCallback(
    (keys: string[]) => {
      if (keys.length < 2) return;
      const groupId = `ss_${uid()}`;
      mutateActiveDay((ejercicios) =>
        ejercicios.map((ej) => {
          const id = ej._key ?? ej.nombre;
          return keys.includes(id) ? { ...ej, grupo_superset: groupId } : ej;
        }),
      );
    },
    [mutateActiveDay],
  );

  const removeSuperset = useCallback(
    (groupId: string) => {
      mutateActiveDay((ejercicios) =>
        ejercicios.map((ej) =>
          ej.grupo_superset === groupId ? { ...ej, grupo_superset: undefined } : ej,
        ),
      );
    },
    [mutateActiveDay],
  );

  const mergeResolvedMuscles = useCallback(
    (updates: ReadonlyArray<{ key: string; musculos_anatomia: string[] }>) => {
      if (updates.length === 0) return;
      mutateActiveDay((ejercicios) =>
        ejercicios.map((ej) => {
          if (ej.musculos_anatomia?.length) return ej;
          const key = ej._key ?? ej.nombre;
          const match = updates.find((u) => u.key === key);
          if (!match?.musculos_anatomia.length) return ej;
          return { ...ej, musculos_anatomia: match.musculos_anatomia };
        }),
      );
    },
    [mutateActiveDay],
  );

  const toRutinaPayload = useCallback((): Omit<Rutina, 'id'> => {
    const { programacion_semanal, semanas, ...rest } = form;
    const { ejercicios, programacion_semanal: progPayload } = programacionToPayload(
      programacion_semanal,
      semanas,
    );

    const payload: Omit<Rutina, 'id'> = {
      nombre: rest.nombre.trim(),
      categoria: rest.categoria || 'Fuerza',
      dificultad: rest.dificultad,
      duracion_min: rest.duracion_min,
      descripcion: rest.descripcion.trim(),
      ejercicios,
      semanas,
      programacion_semanal: progPayload,
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

  const selectedNames = useMemo(() => {
    const names = new Set<string>();
    form.programacion_semanal.forEach((s) =>
      s.dias.forEach((d) => d.ejercicios.forEach((e) => names.add(e.nombre))),
    );
    return [...names];
  }, [form.programacion_semanal]);

  const activeSemanaPlan = form.programacion_semanal.find((s) => s.semana === semanaActiva);

  return {
    form,
    errors,
    savedId,
    editingId: editingId ?? null,
    isEdit: editingId != null,
    durationBreakdown,
    createMode,
    setCreateMode,
    semanaActiva,
    setSemanaActiva: setSemanaActivaSafe,
    diaIndex,
    setDiaActivo,
    templateApplied,
    setTemplateApplied,
    modeSwitchNotice,
    activeSemanaPlan,
    setSemanas,
    applyToAllWeeks,
    copyWeekFrom,
    applyTemplate,
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
