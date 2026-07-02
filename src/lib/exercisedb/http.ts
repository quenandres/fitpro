import type { z } from 'zod';

import { buildHeaders, EXERCISEDB_BASE_URL } from './config';
import { ExerciseDbError, ExerciseDbValidationError } from './errors';

export interface RequestOptions<T extends z.ZodType> {
  schema: T;
  searchParams?: Record<string, string | number | undefined>;
}

export const request = async <T extends z.ZodType>(
  path: string,
  options: RequestOptions<T>,
): Promise<z.infer<T>> => {
  const url = new URL(`${EXERCISEDB_BASE_URL}${path}`);

  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  let response: Response;

  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      headers: buildHeaders(),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'No se pudo conectar con ExerciseDB';

    throw new ExerciseDbError(message, undefined, path);
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new ExerciseDbError(
      'La respuesta de ExerciseDB no es JSON valido',
      response.status,
      path,
    );
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof payload.message === 'string'
        ? payload.message
        : `ExerciseDB respondio con status ${response.status}`;

    throw new ExerciseDbError(message, response.status, path);
  }

  const parsed = options.schema.safeParse(payload);

  if (!parsed.success) {
    throw new ExerciseDbValidationError(
      'La respuesta de ExerciseDB no tiene el formato esperado',
      path,
      parsed.error.issues,
    );
  }

  return parsed.data;
};
