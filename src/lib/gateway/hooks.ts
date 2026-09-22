import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ClientLink, GatewayPlanTree } from './training.service';
import { fetchClientHistorial, listTrainerClients } from './training.service';
import { queryExercises } from './exercises.service';
import type { PlanUsuario, Usuario } from '../../types';
import { createEmptyPlanUsuario } from '../../utils/planGatewayAdapter';
import { clampFrecuencia } from '../../utils/planScheduleUtils';
import type { RolComunidad, TipoPost, TipoReaccion } from '../../types/community';
import {
  addComentario,
  cancelarEvento,
  confirmarEvento,
  createComunidad,
  createEvento,
  createPublicacion,
  deleteEvento,
  deletePublicacion,
  getComunidad,
  getEvento,
  joinComunidad,
  leaveComunidad,
  listComunidades,
  listEventos,
  listMiembros,
  listPublicaciones,
  removeMiembro,
  toggleReaccion,
  updateMiembro,
  updatePublicacion,
  type TabExplorar,
} from './comunidades.service';

export const comunidadesKeys = {
  all: ['comunidades'] as const,
  list: (tab: TabExplorar, q: string) => [...comunidadesKeys.all, 'list', tab, q] as const,
  detail: (id: string) => [...comunidadesKeys.all, 'detail', id] as const,
  members: (id: string) => [...comunidadesKeys.all, 'members', id] as const,
  posts: (id: string) => [...comunidadesKeys.all, 'posts', id] as const,
  events: (id: string, estado: 'proximos' | 'pasados') =>
    [...comunidadesKeys.all, 'events', id, estado] as const,
  event: (comunidadId: string, eventoId: string) =>
    [...comunidadesKeys.all, 'event', comunidadId, eventoId] as const,
};

export function useComunidadesList(tab: TabExplorar, q: string) {
  return useQuery({
    queryKey: comunidadesKeys.list(tab, q),
    queryFn: () => listComunidades({ tab, q }),
  });
}

export function useComunidad(comunidadId: string | undefined) {
  return useQuery({
    queryKey: comunidadesKeys.detail(comunidadId ?? ''),
    queryFn: () => getComunidad(comunidadId!),
    enabled: Boolean(comunidadId),
  });
}

export function useComunidadMiembros(comunidadId: string | undefined) {
  return useQuery({
    queryKey: comunidadesKeys.members(comunidadId ?? ''),
    queryFn: () => listMiembros(comunidadId!),
    enabled: Boolean(comunidadId),
  });
}

export function useComunidadPosts(comunidadId: string | undefined) {
  return useQuery({
    queryKey: comunidadesKeys.posts(comunidadId ?? ''),
    queryFn: () => listPublicaciones(comunidadId!),
    enabled: Boolean(comunidadId),
  });
}

export function useComunidadEventos(
  comunidadId: string | undefined,
  estado: 'proximos' | 'pasados',
) {
  return useQuery({
    queryKey: comunidadesKeys.events(comunidadId ?? '', estado),
    queryFn: () => listEventos(comunidadId!, estado),
    enabled: Boolean(comunidadId),
  });
}

export function useComunidadEvento(comunidadId: string, eventoId: string) {
  return useQuery({
    queryKey: comunidadesKeys.event(comunidadId, eventoId),
    queryFn: () => getEvento(comunidadId, eventoId),
    enabled: Boolean(comunidadId && eventoId),
  });
}

function invalidateComunidad(qc: ReturnType<typeof useQueryClient>, id: string) {
  void qc.invalidateQueries({ queryKey: comunidadesKeys.all });
  void qc.invalidateQueries({ queryKey: comunidadesKeys.detail(id) });
}

export function useJoinComunidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: joinComunidad,
    onSuccess: (_d, id) => invalidateComunidad(qc, id),
  });
}

export function useLeaveComunidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: leaveComunidad,
    onSuccess: (_d, id) => invalidateComunidad(qc, id),
  });
}

export function useCreateComunidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createComunidad,
    onSuccess: () => void qc.invalidateQueries({ queryKey: comunidadesKeys.all }),
  });
}

export function useCreatePublicacion(comunidadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { texto: string; tipo: TipoPost }) =>
      createPublicacion(comunidadId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: comunidadesKeys.posts(comunidadId) });
      void qc.invalidateQueries({ queryKey: comunidadesKeys.detail(comunidadId) });
    },
  });
}

export function useToggleReaccion(comunidadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, tipo }: { postId: string; tipo?: TipoReaccion }) =>
      toggleReaccion(comunidadId, postId, tipo),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: comunidadesKeys.posts(comunidadId) }),
  });
}

export function useAddComentario(comunidadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, texto }: { postId: string; texto: string }) =>
      addComentario(comunidadId, postId, texto),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: comunidadesKeys.posts(comunidadId) }),
  });
}

export function useUpdatePublicacion(comunidadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, fijado }: { postId: string; fijado: boolean }) =>
      updatePublicacion(comunidadId, postId, { fijado }),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: comunidadesKeys.posts(comunidadId) }),
  });
}

export function useDeletePublicacion(comunidadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => deletePublicacion(comunidadId, postId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: comunidadesKeys.posts(comunidadId) });
      void qc.invalidateQueries({ queryKey: comunidadesKeys.detail(comunidadId) });
    },
  });
}

export function useUpdateMiembro(comunidadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      rol,
      suspendido,
    }: {
      userId: string;
      rol?: RolComunidad;
      suspendido?: boolean;
    }) => updateMiembro(comunidadId, userId, { rol, suspendido }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: comunidadesKeys.members(comunidadId) });
      void qc.invalidateQueries({ queryKey: comunidadesKeys.detail(comunidadId) });
    },
  });
}

export function useRemoveMiembro(comunidadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeMiembro(comunidadId, userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: comunidadesKeys.members(comunidadId) });
      void qc.invalidateQueries({ queryKey: comunidadesKeys.detail(comunidadId) });
    },
  });
}

export function useCreateEvento(comunidadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof createEvento>[1]) =>
      createEvento(comunidadId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: comunidadesKeys.events(comunidadId, 'proximos') });
      void qc.invalidateQueries({ queryKey: comunidadesKeys.detail(comunidadId) });
    },
  });
}

export function useConfirmarEvento(comunidadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventoId: string) => confirmarEvento(comunidadId, eventoId),
    onSuccess: (_d, eventoId) => {
      void qc.invalidateQueries({ queryKey: comunidadesKeys.events(comunidadId, 'proximos') });
      void qc.invalidateQueries({ queryKey: comunidadesKeys.event(comunidadId, eventoId) });
    },
  });
}

export function useCancelarEvento(comunidadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventoId: string) => cancelarEvento(comunidadId, eventoId),
    onSuccess: (_d, eventoId) => {
      void qc.invalidateQueries({ queryKey: comunidadesKeys.events(comunidadId, 'proximos') });
      void qc.invalidateQueries({ queryKey: comunidadesKeys.event(comunidadId, eventoId) });
    },
  });
}

export function useDeleteEvento(comunidadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventoId: string) => deleteEvento(comunidadId, eventoId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: comunidadesKeys.events(comunidadId, 'proximos') });
      void qc.invalidateQueries({ queryKey: comunidadesKeys.detail(comunidadId) });
    },
  });
}

export function useTrainerClients() {
  return useQuery({
    queryKey: ['trainer-clients'],
    queryFn: async () => {
      const { clients } = await listTrainerClients();
      return clients;
    },
    staleTime: 30_000,
  });
}

export function useClientHistorial(clientUuid: string | undefined) {
  return useQuery({
    queryKey: ['client-historial', clientUuid],
    queryFn: () => fetchClientHistorial(clientUuid!),
    enabled: Boolean(clientUuid),
    staleTime: 15_000,
  });
}

export function useGatewayExerciseBrowse(
  search: string,
  filters: { bodyPart?: string; equipment?: string; muscle?: string },
) {
  const term = search.trim();
  return useQuery({
    queryKey: ['gateway-exercises-browse', term, filters],
    queryFn: () => {
      const f: Record<string, string> = {};
      if (term.length >= 2) f.name = `ilike.*${term}*`;
      if (filters.bodyPart) f.body_part = `eq.${filters.bodyPart}`;
      if (filters.equipment) f.equipment = `eq.${filters.equipment}`;
      if (filters.muscle) f.target = `eq.${filters.muscle}`;
      return queryExercises({ filters: f, limit: 30, page: 1 });
    },
    enabled: term.length >= 2 || Boolean(filters.bodyPart || filters.equipment || filters.muscle),
  });
}

function planTreeToPlanUsuario(id: number, tree: GatewayPlanTree): PlanUsuario {
  const semanas = tree.semanas ?? [];
  const sesionesSemana = semanas[0]?.sesiones.length ?? 3;
  return {
    id,
    nombre: tree.nombre || 'Plan activo',
    descripcion: '',
    semanas: Math.max(semanas.length, 1),
    dias_entrenar_semana: clampFrecuencia(sesionesSemana || 3),
    modo: 'sesiones_variables',
    progresion: 'fijo',
    rutinas_asignadas: [],
    ejercicios_personalizados: [],
    programacion_semanal: semanas.map((week) => ({
      semana: week.numero,
      sesiones: week.sesiones.map((session, index) => ({
        orden: index + 1,
        nombre: session.nombre || `Sesión ${index + 1}`,
        rutina_id: session.ejercicios.length > 0 ? 0 : null,
        rutina_nombre: session.ejercicios.length > 0 ? session.nombre : '',
        ejercicios_personalizados: session.ejercicios.map((exercise) => ({
          ejercicio_id: Number(exercise.ejercicio_id),
          nombre: exercise.nombre,
          series: exercise.series,
          valor: exercise.repeticiones,
          unidad_id: 1,
          peso_objetivo_kg: exercise.peso_objetivo_kg ?? undefined,
        })),
      })),
    })),
  };
}

export function mapClientLinksToUsuarios(links: ClientLink[]): Usuario[] {
  return links.map((link, index) => {
    const id = index + 1;
    const sesiones = link.plan?.semanas?.[0]?.sesiones.length ?? 3;
    return {
      id,
      client_uuid: link.client_id,
      nombre: link.profile?.full_name?.trim() || `Cliente ${index + 1}`,
      email: '',
      objetivo: 'General',
      nivel: 'Intermedio',
      dias_entrenar: clampFrecuencia(sesiones || 3),
      plan: link.plan?.semanas?.length
        ? planTreeToPlanUsuario(id, link.plan)
        : createEmptyPlanUsuario(id),
    };
  });
}
