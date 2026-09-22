import { gatewayFetch } from './client';

export type RoutineTemplate = {
  id: string;
  owner_id: string;
  nombre: string;
  categoria?: string;
  dificultad?: string;
  duracion_min?: number;
  descripcion?: string;
  semanas?: number;
  tipo?: string;
  rest_between_sets?: number;
  notes?: string;
  status?: string;
};

export async function listTemplates(): Promise<RoutineTemplate[]> {
  const rows = await gatewayFetch<RoutineTemplate[]>('/api/routines/templates?select=*&order=updated_at.desc');
  return rows ?? [];
}

export async function createTemplate(payload: Record<string, unknown>): Promise<RoutineTemplate> {
  return gatewayFetch<RoutineTemplate>('/api/routines/templates', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { Prefer: 'return=representation' },
  });
}

export async function createRoutine(payload: Record<string, unknown>): Promise<{
  template: RoutineTemplate;
  plan: unknown;
}> {
  return gatewayFetch('/api/routines', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function saveRoutineBlockTree(templateId: string, payload: {
  week: { numero: number; dia: number; nombre: string };
  exercises: Array<{
    exercise_id: number;
    orden: number;
    series: number;
    repeticiones: number;
    peso_kg?: number;
  }>;
}): Promise<void> {
  const week = await gatewayFetch<{ id: string }>('/api/routines/template_weeks', {
    method: 'POST',
    body: JSON.stringify({
      template_id: templateId,
      semana: payload.week.numero,
    }),
    headers: { Prefer: 'return=representation' },
  });

  const day = await gatewayFetch<{ id: string }>('/api/routines/template_days', {
    method: 'POST',
    body: JSON.stringify({
      week_id: week.id,
      dia: payload.week.dia,
      nombre: payload.week.nombre,
    }),
    headers: { Prefer: 'return=representation' },
  });

  const block = await gatewayFetch<{ id: string }>('/api/routines/blocks', {
    method: 'POST',
    body: JSON.stringify({
      day_id: day.id,
      tipo: 'normal',
      orden: 1,
      rondas: 1,
    }),
    headers: { Prefer: 'return=representation' },
  });

  for (const ex of payload.exercises) {
    const item = await gatewayFetch<{ id: string }>('/api/routines/block_items', {
      method: 'POST',
      body: JSON.stringify({
        block_id: block.id,
        exercise_id: ex.exercise_id,
        orden: ex.orden,
      }),
      headers: { Prefer: 'return=representation' },
    });

    for (let n = 1; n <= ex.series; n += 1) {
      await gatewayFetch('/api/routines/set_defs', {
        method: 'POST',
        body: JSON.stringify({
          block_item_id: item.id,
          tipo: 'working',
          orden: n,
          reps: ex.repeticiones,
          peso_kg: ex.peso_kg ?? null,
          unit_code: 'reps',
        }),
      });
    }
  }
}
