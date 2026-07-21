import type { GenerateRoutineApiResponse, GenerateRoutineRequest } from '../../types';

const buildEndpoint = (): string => {
  const baseUrl = (import.meta.env.VITE_API_URL ?? '').toString().replace(/\/+$/, '');
  if (!baseUrl) {
    throw new Error(
      'VITE_API_URL no está configurada. Añádela en .env (ej: http://localhost:8000).',
    );
  }
  return `${baseUrl}/api/ai/routine`;
};

const parseErrorMessage = (data: unknown, status: number): string => {
  if (typeof data === 'object' && data !== null) {
    if ('detail' in data) {
      const detail = (data as { detail: unknown }).detail;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail) && detail.length > 0) {
        const first = detail[0] as { msg?: string };
        if (first?.msg) return first.msg;
      }
    }
    if ('error' in data && typeof (data as { error: unknown }).error === 'string') {
      return (data as { error: string }).error;
    }
  }
  return `No se pudo generar la rutina (HTTP ${status})`;
};

export const generateRoutineWithAI = async (
  payload: GenerateRoutineRequest,
): Promise<GenerateRoutineApiResponse> => {
  let response: Response;

  try {
    response = await fetch(buildEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const isNetwork =
      err instanceof TypeError &&
      (err.message.includes('fetch') || err.message.includes('Failed to fetch'));
    if (isNetwork) {
      throw new Error(
        'No se pudo conectar con el API de FitPro. ¿Está corriendo fitpro_api en el puerto 8000?',
      );
    }
    throw err instanceof Error ? err : new Error('Error de red al llamar al API');
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new Error('El API respondió con un cuerpo no válido');
  }

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, response.status));
  }

  if (
    typeof data !== 'object' ||
    data === null ||
    !('rutina' in data) ||
    !('dias_entrenamiento' in data)
  ) {
    throw new Error('La respuesta de IA no tiene el formato esperado');
  }

  return data as GenerateRoutineApiResponse;
};
