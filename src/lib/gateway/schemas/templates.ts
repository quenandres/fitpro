import { z } from 'zod';

export const setDefSchema = z.object({
  id: z.string().uuid(),
  block_item_id: z.string().uuid(),
  tipo: z.enum(['warmup', 'working', 'dropset', 'failure', 'amrap']).optional(),
  orden: z.number().optional(),
  reps: z.number().nullable().optional(),
  reps_min: z.number().nullable().optional(),
  reps_max: z.number().nullable().optional(),
  peso_kg: z.number().nullable().optional(),
  porcentaje_1rm: z.number().nullable().optional(),
  rpe_objetivo: z.number().nullable().optional(),
  tempo: z.string().nullable().optional(),
  duracion_seg: z.number().nullable().optional(),
  distancia_m: z.number().nullable().optional(),
  unit_code: z.string().optional(),
});

export const blockItemSchema = z.object({
  id: z.string().uuid(),
  block_id: z.string().uuid(),
  exercise_id: z.number(),
  orden: z.number().optional(),
  notas: z.string().nullable().optional(),
  set_defs: z.array(setDefSchema).optional(),
});

export const blockSchema = z.object({
  id: z.string().uuid(),
  day_id: z.string().uuid(),
  tipo: z.enum(['normal', 'superset', 'circuit', 'emom', 'amrap', 'fortime']).optional(),
  orden: z.number().optional(),
  rondas: z.number().nullable().optional(),
  duracion_seg: z.number().nullable().optional(),
  descanso_entre_rondas_seg: z.number().nullable().optional(),
  notas: z.string().nullable().optional(),
  block_items: z.array(blockItemSchema).optional(),
});

export const templateDaySchema = z.object({
  id: z.string().uuid(),
  week_id: z.string().uuid(),
  dia: z.number(),
  nombre: z.string().optional(),
  blocks: z.array(blockSchema).optional(),
});

export const templateWeekSchema = z.object({
  id: z.string().uuid(),
  template_id: z.string().uuid(),
  semana: z.number(),
  template_days: z.array(templateDaySchema).optional(),
});

export const templateSchema = z.object({
  id: z.string().uuid(),
  owner_id: z.string().uuid(),
  visibility: z.enum(['global', 'private']).optional(),
  nombre: z.string(),
  categoria: z.string().optional(),
  dificultad: z.string().optional(),
  duracion_min: z.number().optional(),
  descripcion: z.string().optional(),
  semanas: z.number().optional(),
  tipo: z.string().nullable().optional(),
  rest_between_sets: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  template_weeks: z.array(templateWeekSchema).optional(),
});

export const templateListSchema = z.array(
  templateSchema.omit({ template_weeks: true }),
);

export const templateTreeSchema = templateSchema;

export type SetDefDto = z.infer<typeof setDefSchema>;
export type BlockItemDto = z.infer<typeof blockItemSchema>;
export type BlockDto = z.infer<typeof blockSchema>;
export type TemplateDayDto = z.infer<typeof templateDaySchema>;
export type TemplateWeekDto = z.infer<typeof templateWeekSchema>;
export type TemplateDto = z.infer<typeof templateSchema>;
export type TemplateSummaryDto = z.infer<typeof templateListSchema>[number];

export interface CreateTemplatePayload {
  nombre: string;
  categoria?: string;
  dificultad?: string;
  duracion_min?: number;
  descripcion?: string;
  semanas: number;
  tipo?: string | null;
  rest_between_sets?: number | null;
  notes?: string | null;
  visibility?: 'global' | 'private';
  status?: 'draft' | 'published' | 'archived';
}

export interface UpdateTemplatePayload extends Partial<CreateTemplatePayload> {}
