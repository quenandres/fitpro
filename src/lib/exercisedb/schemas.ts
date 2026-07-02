import { z } from 'zod';

export const referenceItemSchema = z.object({
  name: z.string(),
  imageUrl: z.string().url(),
});

export const exerciseSearchItemSchema = z.object({
  exerciseId: z.string(),
  name: z.string(),
  imageUrl: z.string().url(),
});

export const exerciseListItemSchema = exerciseSearchItemSchema.extend({
  bodyParts: z.array(z.string()),
  equipments: z.array(z.string()),
  exerciseType: z.string(),
  targetMuscles: z.array(z.string()),
  secondaryMuscles: z.array(z.string()),
  keywords: z.array(z.string()),
});

export const imageUrlsSchema = z.object({
  '360p': z.string().url(),
  '480p': z.string().url(),
  '720p': z.string().url(),
  '1080p': z.string().url(),
});

export const exerciseDetailSchema = exerciseListItemSchema.extend({
  imageUrls: imageUrlsSchema,
  videoUrl: z.string().url(),
  overview: z.string(),
  instructions: z.array(z.string()),
  exerciseTips: z.array(z.string()),
  variations: z.array(z.string()),
  relatedExerciseIds: z.array(z.string()),
});

export const paginationMetaSchema = z.object({
  total: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
  nextCursor: z.string().optional(),
});

export const successEnvelope = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const paginatedEnvelope = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    success: z.literal(true),
    meta: paginationMetaSchema,
    data: z.array(itemSchema),
  });

export const exerciseSearchResponseSchema = successEnvelope(
  z.array(exerciseSearchItemSchema),
);

export const exerciseDetailResponseSchema = successEnvelope(exerciseDetailSchema);

export const exerciseListResponseSchema = paginatedEnvelope(exerciseListItemSchema);

export const referenceListResponseSchema = successEnvelope(
  z.array(referenceItemSchema),
);

export type ReferenceItem = z.infer<typeof referenceItemSchema>;
export type ExerciseSearchItem = z.infer<typeof exerciseSearchItemSchema>;
export type ExerciseListItem = z.infer<typeof exerciseListItemSchema>;
export type ExerciseDetail = z.infer<typeof exerciseDetailSchema>;
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export type ExerciseSearchResponse = z.infer<typeof exerciseSearchResponseSchema>;
export type ExerciseDetailResponse = z.infer<typeof exerciseDetailResponseSchema>;
export type ExerciseListResponse = z.infer<typeof exerciseListResponseSchema>;
export type ReferenceListResponse = z.infer<typeof referenceListResponseSchema>;
