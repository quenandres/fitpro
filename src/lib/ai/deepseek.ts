import { generateRoutineApiResponseSchema } from './schemas';
import { gatewayFetch } from '../gateway/client';
import { gatewayErrorMessage } from '../gateway/errors';
import { isMockMode } from '../mock-mode';
import type { GenerateRoutineApiResponse, GenerateRoutineRequest } from '../../types';

const MOCK_AI_RESPONSE: GenerateRoutineApiResponse = {
  rutina: {
    nombre: 'Full body demo — 3 días',
    categoria: 'Fuerza',
    dificultad: 'Intermedio',
    duracion_min: 45,
    descripcion: 'Rutina de demostración generada sin llamar al servidor.',
    ejercicios: [
      {
        ejercicio_id: 1,
        nombre: 'Sentadilla con Barra',
        series: 4,
        valor: 8,
        unidad_id: 1,
      },
      {
        ejercicio_id: 2,
        nombre: 'Press de Banca',
        series: 3,
        valor: 10,
        unidad_id: 1,
      },
    ],
    semanas: 1,
    tipo: 'estandar',
    rest_between_sets: 90,
  },
  dias_entrenamiento: ['Lunes', 'Miércoles', 'Viernes'],
  razonamiento: 'Modo demostración: respuesta enlatada para inversores.',
};

export const generateRoutineWithAI = async (
  payload: GenerateRoutineRequest,
): Promise<GenerateRoutineApiResponse> => {
  if (isMockMode()) {
    return {
      ...MOCK_AI_RESPONSE,
      rutina: {
        ...MOCK_AI_RESPONSE.rutina,
        descripcion: payload.objetivo
          ? `Plan orientado a: ${payload.objetivo}. ${MOCK_AI_RESPONSE.rutina.descripcion}`
          : MOCK_AI_RESPONSE.rutina.descripcion,
      },
    };
  }
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
