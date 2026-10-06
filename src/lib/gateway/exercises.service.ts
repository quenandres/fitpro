import {
  mockCatalogReferenceItems,
  mockQueryGatewayExercises,
} from '../../demo/exercisedb-local';
import { isMockMode } from '../mock-mode';
import { gatewayFetch } from './client';
import {
  toCatalogReferenceItem,
  type CatalogReferenceItem,
} from './exerciseCatalogAdapter';

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
  if (isMockMode()) {
    return mockQueryGatewayExercises(body);
  }
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

type ReferenceTable = 'body_parts' | 'equipment' | 'target_muscles' | 'muscle_groups';

async function queryReferenceTable(table: ReferenceTable): Promise<CatalogReferenceItem[]> {
  const result = await gatewayFetch<{ data: Array<{ name: string }> }>(
    `/api/exercises/${table}`,
    {
      method: 'QUERY',
      body: JSON.stringify({
        select: 'name',
        limit: 200,
        order: 'name.asc',
      }),
    },
  );
  const rows = result.data ?? [];
  return rows.map((row) => toCatalogReferenceItem(row.name));
}

export async function listExerciseReference(
  table: ReferenceTable,
): Promise<CatalogReferenceItem[]> {
  if (isMockMode()) {
    return mockCatalogReferenceItems(table);
  }
  return queryReferenceTable(table);
}

export async function fetchExerciseById(id: number): Promise<GatewayExercise | null> {
  const result = await queryExercises({
    filters: { id: `eq.${id}` },
    limit: 1,
    page: 1,
  });
  return result.data[0] ?? null;
}

export type { CatalogReferenceItem };
