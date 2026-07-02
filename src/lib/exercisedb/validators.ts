import { z } from 'zod';

import { ExerciseDbValidationError } from './errors';

const searchTermSchema = z
  .string()
  .trim()
  .min(2, 'El termino de busqueda debe tener al menos 2 caracteres')
  .max(100, 'El termino de busqueda no puede superar 100 caracteres');

const exerciseIdSchema = z
  .string()
  .trim()
  .min(1, 'El exerciseId es obligatorio')
  .regex(/^exr_/, 'El exerciseId debe comenzar con exr_');

const listParamsSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    keywords: z.string().trim().min(1).max(200).optional(),
    cursor: z.string().trim().min(1).optional(),
    limit: z.number().int().min(1).max(50).optional(),
  })
  .refine(
    (params) => Boolean(params.name ?? params.keywords),
    'Debes proporcionar al menos name o keywords para listar ejercicios',
  );

export type ExerciseListParams = z.infer<typeof listParamsSchema>;

const parseOrThrow = <T>(
  schema: z.ZodType<T>,
  value: unknown,
  field: string,
): T => {
  const result = schema.safeParse(value);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    throw new ExerciseDbValidationError(
      firstIssue?.message ?? 'Parametro invalido',
      field,
      result.error.issues,
    );
  }

  return result.data;
};

export const validateSearchTerm = (term: string): string =>
  parseOrThrow(searchTermSchema, term, 'search');

export const validateExerciseId = (exerciseId: string): string =>
  parseOrThrow(exerciseIdSchema, exerciseId, 'exerciseId');

export const validateListParams = (params: unknown): ExerciseListParams =>
  parseOrThrow(listParamsSchema, params, 'listParams');
