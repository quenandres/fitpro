import ejerciciosData from '../data/ejercicios.json';
import type {
  ExerciseQueryResult,
  GatewayExercise,
} from '../lib/gateway/exercises.service';
import type {
  ExerciseDetail,
  ExerciseListItem,
  ExerciseSearchItem,
  ReferenceItem,
} from '../lib/exercisedb/schemas';
import type { ExerciseListParams } from '../lib/exercisedb/validators';

const IMG = 'https://placehold.co/120x120/png';

type LocalEjercicio = {
  id: number;
  nombre: string;
  categoria: string;
  grupo_muscular: string[];
  equipamiento: string[];
};

function toSearchItem(row: LocalEjercicio): ExerciseSearchItem {
  return {
    exerciseId: `local-${row.id}`,
    name: row.nombre,
    imageUrl: IMG,
  };
}

function toListItem(row: LocalEjercicio): ExerciseListItem {
  return {
    ...toSearchItem(row),
    bodyParts: row.grupo_muscular.slice(0, 1),
    equipments: row.equipamiento.length ? row.equipamiento : ['Ninguno'],
    exerciseType: row.categoria,
    targetMuscles: row.grupo_muscular.slice(0, 2),
    secondaryMuscles: row.grupo_muscular.slice(2),
    keywords: [],
  };
}

function toGatewayExercise(row: LocalEjercicio): GatewayExercise {
  return {
    id: row.id,
    source_id: `local-${row.id}`,
    name: row.nombre,
    body_part: row.grupo_muscular[0] ?? 'General',
    equipment: row.equipamiento[0] ?? 'Ninguno',
    target: row.grupo_muscular[0] ?? 'General',
    muscle_group: row.grupo_muscular.join(', '),
    image_url: IMG,
    gif_url: IMG,
  };
}

const catalog = ejerciciosData as LocalEjercicio[];

export function mockSearchExercises(term: string): ExerciseSearchItem[] {
  const q = term.trim().toLowerCase();
  return catalog
    .filter((e) => e.nombre.toLowerCase().includes(q))
    .slice(0, 20)
    .map(toSearchItem);
}

export function mockListExercises(params: ExerciseListParams): {
  items: ExerciseListItem[];
  meta: { total: number; hasNextPage: boolean; hasPreviousPage: boolean };
} {
  let rows = catalog;
  if (params.name?.trim()) {
    const q = params.name.trim().toLowerCase();
    rows = rows.filter((e) => e.nombre.toLowerCase().includes(q));
  }
  const items = rows.slice(0, params.limit ?? 20).map(toListItem);
  return {
    items,
    meta: { total: items.length, hasNextPage: false, hasPreviousPage: false },
  };
}

export function mockExerciseDetail(exerciseId: string): ExerciseDetail {
  const id = Number(exerciseId.replace(/^local-/, ''));
  const row = catalog.find((e) => e.id === id) ?? catalog[0];
  const base = toListItem(row);
  return {
    ...base,
    imageUrls: { '360p': IMG, '480p': IMG, '720p': IMG, '1080p': IMG },
    videoUrl: IMG,
    overview: row.nombre,
    instructions: ['Posición inicial estable.', 'Ejecuta el movimiento con control.', 'Vuelve a la posición inicial.'],
    exerciseTips: [],
    variations: [],
    relatedExerciseIds: [],
  };
}

function parseEqFilter(raw: string | undefined): string | undefined {
  if (!raw?.startsWith('eq.')) return undefined;
  return raw.slice(3);
}

export function mockQueryGatewayExercises(body: {
  filters?: Record<string, string>;
  limit?: number;
  page?: number;
}): { data: GatewayExercise[]; pagination?: ExerciseQueryResult['pagination'] } {
  let rows = catalog;
  const nameFilter = body.filters?.name;
  if (nameFilter?.includes('*')) {
    const term = nameFilter.replace(/ilike\.\*/gi, '').replace(/\*/g, '').toLowerCase();
    if (term) rows = rows.filter((e) => e.nombre.toLowerCase().includes(term));
  }
  const idEq = parseEqFilter(body.filters?.id);
  if (idEq) {
    const id = Number(idEq);
    rows = rows.filter((e) => e.id === id);
  }
  const bodyPart = parseEqFilter(body.filters?.body_part);
  if (bodyPart) {
    rows = rows.filter((e) => e.grupo_muscular[0] === bodyPart);
  }
  const equipment = parseEqFilter(body.filters?.equipment);
  if (equipment) {
    rows = rows.filter((e) => (e.equipamiento[0] ?? 'Ninguno') === equipment);
  }
  const target = parseEqFilter(body.filters?.target);
  if (target) {
    rows = rows.filter((e) => e.grupo_muscular.includes(target));
  }
  const muscleGroup = parseEqFilter(body.filters?.muscle_group);
  if (muscleGroup) {
    rows = rows.filter((e) => e.categoria === muscleGroup);
  }
  const limit = body.limit ?? 30;
  const page = body.page ?? 1;
  const start = (page - 1) * limit;
  const slice = rows.slice(start, start + limit).map(toGatewayExercise);
  const totalPages = Math.max(1, Math.ceil(rows.length / limit));
  return {
    data: slice,
    pagination: {
      page,
      size: limit,
      total_records: rows.length,
      total_pages: totalPages,
    },
  };
}

export function mockCatalogReferenceItems(
  table: 'body_parts' | 'equipment' | 'target_muscles' | 'muscle_groups',
): ReferenceItem[] {
  const kind =
    table === 'body_parts'
      ? 'bodyparts'
      : table === 'equipment'
        ? 'equipments'
        : table === 'target_muscles'
          ? 'muscles'
          : 'types';
  return mockReferenceItems(kind);
}

export function mockReferenceItems(kind: 'bodyparts' | 'equipments' | 'muscles' | 'types'): ReferenceItem[] {
  const names = new Set<string>();
  for (const e of catalog) {
    if (kind === 'bodyparts' || kind === 'muscles') {
      e.grupo_muscular.forEach((g) => names.add(g));
    } else if (kind === 'equipments') {
      e.equipamiento.forEach((x) => names.add(x || 'Ninguno'));
    } else {
      names.add(e.categoria);
    }
  }
  return [...names].slice(0, 12).map((name) => ({ name, imageUrl: IMG }));
}
