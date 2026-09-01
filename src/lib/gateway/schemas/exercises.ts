import { z } from 'zod';

export const exerciseDetailSchema = z.object({
  id: z.number(),
  source_id: z.string().nullable().optional(),
  name: z.string(),
  body_part: z.string().nullable().optional(),
  equipment: z.string().nullable().optional(),
  target: z.string().nullable().optional(),
  muscle_group: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  gif_url: z.string().nullable().optional(),
  attribution: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
});

export const exerciseDetailListSchema = z.array(exerciseDetailSchema);

export const exerciseRowSchema = z.object({
  id: z.number(),
  source_id: z.string().nullable().optional(),
  name: z.string(),
  body_part_id: z.number().nullable().optional(),
  equipment_id: z.number().nullable().optional(),
  target_muscle_id: z.number().nullable().optional(),
  muscle_group_id: z.number().nullable().optional(),
  image_url: z.string().nullable().optional(),
  gif_url: z.string().nullable().optional(),
});

export const exerciseRowListSchema = z.array(exerciseRowSchema);

export type ExerciseDetailDto = z.infer<typeof exerciseDetailSchema>;
export type ExerciseRowDto = z.infer<typeof exerciseRowSchema>;
