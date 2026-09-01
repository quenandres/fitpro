import unidadesData from '../../../data/unidades.json';
import type {
  EjercicioRutina,
  RoutineFormData,
  RoutineFormExercise,
  Rutina,
  SemanaRutina,
} from '../../../types';
import type {
  BlockDto,
  BlockItemDto,
  SetDefDto,
  TemplateDayDto,
  TemplateDto,
  TemplateWeekDto,
} from '../schemas/templates';
import type { CreateTemplatePayload } from '../schemas/templates';

type UnidadRow = { id: number; simbolo: string; nombre: string };

const unidades = unidadesData as UnidadRow[];

const UNIT_CODE_TO_ID: Record<string, number> = {
  reps: 1,
  m: 2,
  km: 3,
  min: 4,
  seg: 5,
  s: 5,
  kg: 6,
  lbs: 7,
  sets: 8,
  rounds: 9,
  cal: 10,
  '%': 11,
  bpm: 12,
  steps: 13,
  mi: 14,
  failure: 15,
};

const ID_TO_UNIT_CODE: Record<number, string> = Object.fromEntries(
  Object.entries(UNIT_CODE_TO_ID).map(([code, id]) => [id, code]),
);

export function unitCodeToId(code: string | undefined): number {
  if (!code) return 1;
  return UNIT_CODE_TO_ID[code] ?? 1;
}

export function unitIdToCode(id: number): string {
  const u = unidades.find((x) => x.id === id);
  if (u?.simbolo && UNIT_CODE_TO_ID[u.simbolo] != null) return u.simbolo;
  return ID_TO_UNIT_CODE[id] ?? 'reps';
}

function setDefsToSeries(setDefs: SetDefDto[] | undefined): { series: number; valor: number; unidad_id: number; rpe?: number } {
  const defs = setDefs ?? [];
  if (defs.length === 0) {
    return { series: 1, valor: 10, unidad_id: 1 };
  }
  const first = defs[0];
  const valor =
    first.reps ??
    first.reps_min ??
    first.duracion_seg ??
    (first.distancia_m != null ? Number(first.distancia_m) : undefined) ??
    10;
  return {
    series: defs.length,
    valor,
    unidad_id: unitCodeToId(first.unit_code),
    rpe: first.rpe_objetivo ?? undefined,
  };
}

function blockItemToExercise(
  item: BlockItemDto,
  exerciseNameMap: Map<number, string>,
  grupoSuperset?: string,
): EjercicioRutina {
  const { series, valor, unidad_id, rpe } = setDefsToSeries(item.set_defs);
  return {
    nombre: exerciseNameMap.get(item.exercise_id) ?? `Ejercicio #${item.exercise_id}`,
    series,
    valor,
    unidad_id,
    rpe,
    grupo_superset: grupoSuperset,
    exerciseDbId: String(item.exercise_id),
  };
}

function blocksToEjercicios(
  blocks: BlockDto[] | undefined,
  exerciseNameMap: Map<number, string>,
): EjercicioRutina[] {
  const result: EjercicioRutina[] = [];
  for (const block of blocks ?? []) {
    const isSuperset = block.tipo === 'superset';
    const groupId = isSuperset ? block.id : undefined;
    for (const item of block.block_items ?? []) {
      result.push(blockItemToExercise(item, exerciseNameMap, groupId));
    }
  }
  return result;
}

export function templateToRutina(
  template: TemplateDto,
  exerciseNameMap: Map<number, string>,
): Rutina {
  const programacion: SemanaRutina[] = (template.template_weeks ?? []).map((week) => ({
    semana: week.semana,
    dias: (week.template_days ?? []).map((day) => ({
      dia: day.dia,
      nombre: day.nombre ?? '',
      ejercicios: blocksToEjercicios(day.blocks, exerciseNameMap),
    })),
  }));

  const firstWeek = programacion[0];
  const flatEjercicios = firstWeek?.dias.flatMap((d) => d.ejercicios) ?? [];

  return {
    id: template.id,
    nombre: template.nombre,
    categoria: template.categoria ?? '',
    dificultad: template.dificultad ?? 'Intermedio',
    duracion_min: template.duracion_min ?? 45,
    descripcion: template.descripcion ?? '',
    ejercicios: flatEjercicios,
    semanas: template.semanas ?? (programacion.length || 1),
    programacion_semanal: programacion,
    tipo: (template.tipo as Rutina['tipo']) ?? undefined,
    rest_between_sets: template.rest_between_sets ?? undefined,
    notes: template.notes ?? undefined,
  };
}

function exerciseToBlockItems(
  ejercicios: RoutineFormExercise[],
  exerciseIdByName: Map<string, number>,
): BlockDto[] {
  const blocks: BlockDto[] = [];
  let orden = 0;

  const groups = new Map<string, RoutineFormExercise[]>();
  const singles: RoutineFormExercise[] = [];

  for (const ej of ejercicios) {
    if (ej.grupo_superset) {
      const list = groups.get(ej.grupo_superset) ?? [];
      list.push(ej);
      groups.set(ej.grupo_superset, list);
    } else {
      singles.push(ej);
    }
  }

  for (const ej of singles) {
    blocks.push(singleExerciseBlock(ej, exerciseIdByName, orden++));
  }

  for (const [, group] of groups) {
    blocks.push({
      id: crypto.randomUUID(),
      day_id: '',
      tipo: 'superset',
      orden: orden++,
      block_items: group.map((ej, i) => formExerciseToBlockItem(ej, exerciseIdByName, i)),
    });
  }

  return blocks;
}

function singleExerciseBlock(
  ej: RoutineFormExercise,
  exerciseIdByName: Map<string, number>,
  orden: number,
): BlockDto {
  return {
    id: crypto.randomUUID(),
    day_id: '',
    tipo: 'normal',
    orden,
    block_items: [formExerciseToBlockItem(ej, exerciseIdByName, 0)],
  };
}

function formExerciseToBlockItem(
  ej: RoutineFormExercise,
  exerciseIdByName: Map<string, number>,
  orden: number,
): BlockItemDto {
  const exerciseId =
    (ej.exerciseDbId ? Number(ej.exerciseDbId) : undefined) ??
    exerciseIdByName.get(ej.nombre) ??
    1;

  const setDefs: SetDefDto[] = Array.from({ length: Math.max(1, ej.series) }, (_, i) => ({
    id: crypto.randomUUID(),
    block_item_id: '',
    tipo: 'working',
    orden: i,
    reps: ej.unidad_id === 1 ? ej.valor : undefined,
    duracion_seg: ej.unidad_id === 5 ? ej.valor : undefined,
    distancia_m: ej.unidad_id === 2 ? ej.valor : undefined,
    rpe_objetivo: ej.rpe,
    unit_code: unitIdToCode(ej.unidad_id),
  }));

  return {
    id: crypto.randomUUID(),
    block_id: '',
    exercise_id: exerciseId,
    orden,
    set_defs: setDefs,
  };
}

export function routineFormToTemplatePayload(form: RoutineFormData): CreateTemplatePayload {
  return {
    nombre: form.nombre.trim(),
    categoria: form.categoria || 'Fuerza',
    dificultad: form.dificultad,
    duracion_min: form.duracion_min,
    descripcion: form.descripcion.trim(),
    semanas: form.semanas,
    tipo: form.tipo,
    rest_between_sets: form.rest_between_sets,
    notes: form.notes.trim() || null,
    visibility: 'private',
    status: 'published',
  };
}

export function formToGatewaySavePayload(
  form: RoutineFormData,
  exerciseIdByName: Map<string, number>,
  id?: string,
): Record<string, unknown> {
  const meta = routineFormToTemplatePayload(form);
  const tree = routineFormToTemplateTree(form, exerciseIdByName);

  return {
    ...(id ? { id } : {}),
    ...meta,
    weeks: (tree.template_weeks ?? []).map((week) => ({
      semana: week.semana,
      days: (week.template_days ?? []).map((day) => ({
        dia: day.dia,
        nombre: day.nombre ?? '',
        blocks: (day.blocks ?? []).map((block) => ({
          tipo: block.tipo ?? 'normal',
          orden: block.orden ?? 0,
          rondas: block.rondas,
          duracion_seg: block.duracion_seg,
          descanso_entre_rondas_seg: block.descanso_entre_rondas_seg,
          notas: block.notas,
          items: (block.block_items ?? []).map((item) => ({
            exercise_id: item.exercise_id,
            orden: item.orden ?? 0,
            notas: item.notas,
            set_defs: (item.set_defs ?? []).map((setDef) => ({
              tipo: setDef.tipo ?? 'working',
              orden: setDef.orden ?? 0,
              reps: setDef.reps,
              reps_min: setDef.reps_min,
              reps_max: setDef.reps_max,
              peso_kg: setDef.peso_kg,
              porcentaje_1rm: setDef.porcentaje_1rm,
              rpe_objetivo: setDef.rpe_objetivo,
              tempo: setDef.tempo,
              duracion_seg: setDef.duracion_seg,
              distancia_m: setDef.distancia_m,
              unit_code: setDef.unit_code ?? 'reps',
            })),
          })),
        })),
      })),
    })),
  };
}

export function rutinaPayloadToGatewaySavePayload(
  rutina: Omit<Rutina, 'id'>,
  exerciseIdByName: Map<string, number>,
  id?: string,
): Record<string, unknown> {
  const form: RoutineFormData = {
    nombre: rutina.nombre,
    categoria: rutina.categoria,
    descripcion: rutina.descripcion,
    dificultad: rutina.dificultad,
    duracion_min: rutina.duracion_min,
    tipo: rutina.tipo ?? 'estandar',
    rest_between_sets: rutina.rest_between_sets ?? 60,
    notes: rutina.notes ?? '',
    semanas: rutina.semanas ?? 1,
    ejercicios: rutina.ejercicios,
    programacion_semanal: (rutina.programacion_semanal ?? []).map((s) => ({
      semana: s.semana,
      dias: s.dias.map((d) => ({
        dia: d.dia,
        nombre: d.nombre,
        ejercicios: d.ejercicios.map((e) => ({ ...e })),
      })),
    })),
  };
  return formToGatewaySavePayload(form, exerciseIdByName, id);
}

export function routineFormToTemplateTree(
  form: RoutineFormData,
  exerciseIdByName: Map<string, number>,
): TemplateDto {
  const templateWeeks: TemplateWeekDto[] = form.programacion_semanal.map((semana) => ({
    id: crypto.randomUUID(),
    template_id: '',
    semana: semana.semana,
    template_days: semana.dias.map(
      (dia): TemplateDayDto => ({
        id: crypto.randomUUID(),
        week_id: '',
        dia: dia.dia,
        nombre: dia.nombre,
        blocks: exerciseToBlockItems(dia.ejercicios, exerciseIdByName),
      }),
    ),
  }));

  return {
    id: '',
    owner_id: '',
    nombre: form.nombre,
    categoria: form.categoria,
    dificultad: form.dificultad,
    duracion_min: form.duracion_min,
    descripcion: form.descripcion,
    semanas: form.semanas,
    tipo: form.tipo,
    rest_between_sets: form.rest_between_sets,
    notes: form.notes,
    template_weeks: templateWeeks,
  };
}

export function rutinaPayloadToTemplateTree(
  rutina: Omit<Rutina, 'id'>,
  exerciseIdByName: Map<string, number>,
): TemplateDto {
  const form: RoutineFormData = {
    nombre: rutina.nombre,
    categoria: rutina.categoria,
    descripcion: rutina.descripcion,
    dificultad: rutina.dificultad,
    duracion_min: rutina.duracion_min,
    tipo: rutina.tipo ?? 'estandar',
    rest_between_sets: rutina.rest_between_sets ?? 60,
    notes: rutina.notes ?? '',
    semanas: rutina.semanas ?? 1,
    ejercicios: rutina.ejercicios,
    programacion_semanal: (rutina.programacion_semanal ?? []).map((s) => ({
      semana: s.semana,
      dias: s.dias.map((d) => ({
        dia: d.dia,
        nombre: d.nombre,
        ejercicios: d.ejercicios.map((e) => ({ ...e })),
      })),
    })),
  };
  return routineFormToTemplateTree(form, exerciseIdByName);
}
