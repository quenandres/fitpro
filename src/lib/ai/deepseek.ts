import type { GenerateRoutineApiResponse, GenerateRoutineRequest } from '../../types';

const buildEndpoint = (): string => {
  const baseUrl = (import.meta.env.VITE_API_URL ?? '').toString().replace(/\/+$/, '');
  return `${baseUrl}/api/ai/routine`;
};

export const generateRoutineWithAI = async (
  payload: GenerateRoutineRequest,
): Promise<GenerateRoutineApiResponse> => {
  const response = await fetch(buildEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as GenerateRoutineApiResponse | { error: string };

  if (!response.ok) {
    const message = 'error' in data ? data.error : 'No se pudo generar la rutina';
    throw new Error(message);
  }

  if (!('rutina' in data) || !('dias_entrenamiento' in data)) {
    throw new Error('La respuesta de IA no tiene el formato esperado');
  }

  return data;
};
