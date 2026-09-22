import { gatewayFetch } from './client';

export type GatewayExercise = {
  id: number;
  source_id: string;
  name: string;
  body_part: string;
  equipment: string;
  target: string;
  muscle_group: string;
  image_url: string;
  gif_url: string;
};

export type ExerciseQueryResult = {
  data: GatewayExercise[];
  pagination?: {
    page: number;
    size: number;
    total_records: number;
    total_pages: number;
  };
};

export async function queryExercises(body: {
  filters?: Record<string, string>;
  limit?: number;
  page?: number;
  order?: string;
}): Promise<ExerciseQueryResult> {
  return gatewayFetch<ExerciseQueryResult>('/api/exercises/exercise_details', {
    method: 'QUERY',
    body: JSON.stringify({
      select: 'id,source_id,name,body_part,equipment,target,muscle_group',
      filters: body.filters ?? {},
      limit: body.limit ?? 20,
      page: body.page ?? 1,
      order: body.order ?? 'name.asc',
    }),
  });
}

export async function getExerciseMedia(exerciseId: number): Promise<{
  imagen_url: string;
  gif_url: string;
}> {
  return gatewayFetch(`/api/media/ejercicios/${exerciseId}`);
}
