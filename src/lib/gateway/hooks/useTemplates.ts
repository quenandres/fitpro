import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  formToGatewaySavePayload,
  rutinaPayloadToGatewaySavePayload,
  templateToRutina,
} from '../adapters/templateAdapter';
import { listExercises } from '../exercises.service';
import {
  deleteTemplate,
  getTemplate,
  listTemplates,
  saveTemplate,
} from '../templates.service';
import { gatewayKeys, GATEWAY_STALE_TIME } from '../queryKeys';
import type { Rutina } from '../../../types';
import type { RoutineFormData } from '../../../types';

async function buildExerciseNameMap(): Promise<Map<number, string>> {
  const rows = await listExercises({ limit: 500 });
  return new Map(rows.map((r) => [r.id, r.name]));
}

async function templatesToRutinas(): Promise<Rutina[]> {
  const [summaries, nameMap] = await Promise.all([listTemplates(), buildExerciseNameMap()]);
  const rutinas: Rutina[] = [];
  for (const summary of summaries) {
    const tree = await getTemplate(summary.id);
    rutinas.push(templateToRutina(tree, nameMap));
  }
  return rutinas;
}

export function useTemplates(enabled = true) {
  return useQuery({
    queryKey: gatewayKeys.templates.list(),
    queryFn: templatesToRutinas,
    enabled,
    staleTime: GATEWAY_STALE_TIME,
  });
}

export function useTemplate(id: string | undefined) {
  return useQuery({
    queryKey: gatewayKeys.templates.detail(id ?? ''),
    queryFn: async () => {
      const [tree, nameMap] = await Promise.all([getTemplate(id!), buildExerciseNameMap()]);
      return templateToRutina(tree, nameMap);
    },
    enabled: Boolean(id),
    staleTime: GATEWAY_STALE_TIME,
  });
}

export function useTemplateMutations() {
  const qc = useQueryClient();

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: gatewayKeys.templates.all() });
  };

  const createFromForm = useMutation({
    mutationFn: async (form: RoutineFormData) => {
      const nameMap = await buildExerciseNameMap();
      const exerciseIdByName = new Map([...nameMap.entries()].map(([id, name]) => [name, id]));
      const payload = formToGatewaySavePayload(form, exerciseIdByName);
      const saved = await saveTemplate(payload);
      return saved.id;
    },
    onSuccess: invalidate,
  });

  const updateFromForm = useMutation({
    mutationFn: async ({ id, form }: { id: string; form: RoutineFormData }) => {
      const nameMap = await buildExerciseNameMap();
      const exerciseIdByName = new Map([...nameMap.entries()].map(([id, name]) => [name, id]));
      const payload = formToGatewaySavePayload(form, exerciseIdByName, id);
      const saved = await saveTemplate(payload);
      return saved.id;
    },
    onSuccess: invalidate,
  });

  const createFromRutina = useMutation({
    mutationFn: async (rutina: Omit<Rutina, 'id'>) => {
      const nameMap = await buildExerciseNameMap();
      const exerciseIdByName = new Map([...nameMap.entries()].map(([id, name]) => [name, id]));
      const payload = rutinaPayloadToGatewaySavePayload(rutina, exerciseIdByName);
      const saved = await saveTemplate(payload);
      return saved.id;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: invalidate,
  });

  return {
    createFromForm,
    updateFromForm,
    createFromRutina,
    remove,
    invalidate,
  };
}

export type { TemplateDto } from '../schemas/templates';
