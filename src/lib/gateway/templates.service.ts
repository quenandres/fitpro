import { z } from 'zod';

import { gatewayRequest, gatewayRequestVoid } from './httpClient';
import {
  templateListSchema,
  templateTreeSchema,
  type SetDefDto,
  type TemplateDto,
  type TemplateSummaryDto,
} from './schemas/templates';

const templatesListResponseSchema = z.object({
  templates: templateListSchema,
  count: z.number(),
});

const templateEnvelopeSchema = z.object({
  template: z.record(z.string(), z.unknown()),
});

function mapGatewayTemplate(raw: Record<string, unknown>): TemplateDto {
  const weeks = (raw.weeks ?? raw.template_weeks ?? []) as Array<Record<string, unknown>>;

  const template_weeks = weeks.map((week) => {
    const days = (week.days ?? week.template_days ?? []) as Array<Record<string, unknown>>;
    const weekId = String(week.id ?? '');

    return {
      id: weekId,
      template_id: String(raw.id ?? ''),
      semana: Number(week.semana ?? 1),
      template_days: days.map((day) => {
        const dayId = String(day.id ?? '');
        const blocks = (day.blocks ?? []) as Array<Record<string, unknown>>;

        return {
          id: dayId,
          week_id: weekId,
          dia: Number(day.dia ?? 0),
          nombre: String(day.nombre ?? ''),
          blocks: blocks.map((block) => {
            const blockId = String(block.id ?? '');
            const items = (block.items ?? block.block_items ?? []) as Array<Record<string, unknown>>;

            return {
              id: blockId,
              day_id: dayId,
              tipo: (block.tipo as 'normal' | 'superset' | 'circuit' | 'emom' | 'amrap' | 'fortime' | undefined) ?? 'normal',
              orden: Number(block.orden ?? 0),
              rondas: block.rondas as number | null | undefined,
              duracion_seg: block.duracion_seg as number | null | undefined,
              descanso_entre_rondas_seg: block.descanso_entre_rondas_seg as number | null | undefined,
              notas: block.notas as string | null | undefined,
              block_items: items.map((item) => ({
                id: String(item.id ?? ''),
                block_id: blockId,
                exercise_id: Number(item.exercise_id),
                orden: Number(item.orden ?? 0),
                notas: item.notas as string | null | undefined,
                set_defs: (item.set_defs as SetDefDto[] | undefined) ?? [],
              })),
            };
          }),
        };
      }),
    };
  });

  return templateTreeSchema.parse({
    id: raw.id,
    owner_id: raw.owner_id,
    visibility: raw.visibility,
    nombre: raw.nombre,
    categoria: raw.categoria,
    dificultad: raw.dificultad,
    duracion_min: raw.duracion_min,
    descripcion: raw.descripcion,
    semanas: raw.semanas,
    tipo: raw.tipo,
    rest_between_sets: raw.rest_between_sets,
    notes: raw.notes,
    status: raw.status,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    template_weeks,
  });
}

export async function listTemplates(): Promise<TemplateSummaryDto[]> {
  const data = await gatewayRequest(
    '/api/routines/templates',
    { method: 'GET' },
    templatesListResponseSchema,
  );
  return data.templates;
}

export async function getTemplate(id: string): Promise<TemplateDto> {
  const data = await gatewayRequest(
    `/api/routines/templates/${encodeURIComponent(id)}`,
    { method: 'GET' },
    templateEnvelopeSchema,
  );
  return mapGatewayTemplate(data.template);
}

export async function saveTemplate(body: Record<string, unknown>): Promise<TemplateDto> {
  const data = await gatewayRequest(
    '/api/routines/templates',
    { method: 'POST', body },
    templateEnvelopeSchema,
  );
  return mapGatewayTemplate(data.template);
}

export async function deleteTemplate(id: string): Promise<void> {
  await gatewayRequestVoid(`/api/routines/templates/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

/** @deprecated Usar saveTemplate — conservado para compatibilidad interna */
export async function createTemplate(body: Record<string, unknown>): Promise<TemplateSummaryDto> {
  const saved = await saveTemplate(body);
  return saved;
}

/** @deprecated Usar saveTemplate */
export async function updateTemplate(id: string, body: Record<string, unknown>): Promise<TemplateSummaryDto> {
  const saved = await saveTemplate({ ...body, id });
  return saved;
}

export async function replaceTemplateTree(templateId: string, tree: TemplateDto): Promise<void> {
  await saveTemplate({
    id: templateId,
    nombre: tree.nombre,
    categoria: tree.categoria,
    dificultad: tree.dificultad,
    duracion_min: tree.duracion_min,
    descripcion: tree.descripcion,
    semanas: tree.semanas,
    tipo: tree.tipo,
    rest_between_sets: tree.rest_between_sets,
    notes: tree.notes,
    visibility: tree.visibility,
    status: tree.status,
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
  });
}

/** Compatibilidad con flujos legacy — delega en saveTemplate */
export async function insertTemplateTree(templateId: string, tree: TemplateDto): Promise<void> {
  await replaceTemplateTree(templateId, tree);
}
