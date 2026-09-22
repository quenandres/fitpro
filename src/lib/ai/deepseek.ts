import { generateRoutineApiResponseSchema } from './schemas';
import { gatewayFetch } from '../gateway/client';
import { gatewayErrorMessage } from '../gateway/errors';
import type { GenerateRoutineApiResponse, GenerateRoutineRequest } from '../../types';

export const generateRoutineWithAI = async (
  payload: GenerateRoutineRequest,
): Promise<GenerateRoutineApiResponse> => {
  try {
    const data = await gatewayFetch<unknown>('/api/ai/routine', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const parsed = generateRoutineApiResponseSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error('La respuesta de IA no tiene el formato esperado');
    }

    return parsed.data as GenerateRoutineApiResponse;
  } catch (err) {
    if (err instanceof Error && err.message === 'La respuesta de IA no tiene el formato esperado') {
      throw err;
    }
    throw new Error(
      gatewayErrorMessage(err, 'No se pudo generar la rutina. Comprueba que gym-gateway esté activo.'),
    );
  }
};
