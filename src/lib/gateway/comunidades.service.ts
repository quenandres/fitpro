import * as demo from '../../demo/comunidades-demo';
import { isMockMode } from '../mock-mode';
import { gatewayFetch } from './client';
import type {
  Comunidad,
  EventoComunidad,
  MiembroComunidad,
  Post,
  RolComunidad,
  TipoPost,
  TipoReaccion,
} from '../../types/community';

export type TabExplorar = 'para-ti' | 'mis-comunidades' | 'descubrir';

export async function listComunidades(params: {
  tab?: TabExplorar;
  q?: string;
}): Promise<Comunidad[]> {
  if (isMockMode()) return demo.demoListComunidades(params);
  const search = new URLSearchParams();
  if (params.tab) search.set('tab', params.tab);
  if (params.q?.trim()) search.set('q', params.q.trim());
  const qs = search.toString();
  return gatewayFetch<Comunidad[]>(`/api/comunidades${qs ? `?${qs}` : ''}`);
}

export async function getComunidad(id: string): Promise<Comunidad & {
  esMiembro: boolean;
  miRol: RolComunidad | null;
  suspendido?: boolean;
}> {
  if (isMockMode()) return demo.demoGetComunidad(id);
  return gatewayFetch(`/api/comunidades/${id}`);
}

export async function createComunidad(body: {
  nombre: string;
  descripcion: string;
  categoria: string;
  visibilidad: string;
  reglas?: string[];
  portadaUrl?: string;
  avatarUrl?: string;
}): Promise<Comunidad> {
  if (isMockMode()) return demo.demoCreateComunidad(body);
  return gatewayFetch('/api/comunidades', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function joinComunidad(id: string): Promise<Comunidad> {
  if (isMockMode()) return demo.demoJoinComunidad(id);
  return gatewayFetch(`/api/comunidades/${id}/unirse`, { method: 'POST' });
}

export async function leaveComunidad(id: string): Promise<void> {
  if (isMockMode()) {
    demo.demoLeaveComunidad(id);
    return;
  }
  await gatewayFetch<void>(`/api/comunidades/${id}/salir`, { method: 'DELETE' });
}

export async function listMiembros(comunidadId: string): Promise<MiembroComunidad[]> {
  if (isMockMode()) return demo.demoListMiembros(comunidadId);
  return gatewayFetch(`/api/comunidades/${comunidadId}/miembros`);
}

export async function updateMiembro(
  comunidadId: string,
  userId: string,
  body: { rol?: RolComunidad; suspendido?: boolean },
): Promise<MiembroComunidad> {
  if (isMockMode()) return demo.demoUpdateMiembro(comunidadId, userId, body);
  return gatewayFetch(`/api/comunidades/${comunidadId}/miembros/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function removeMiembro(comunidadId: string, userId: string): Promise<void> {
  if (isMockMode()) {
    demo.demoRemoveMiembro(comunidadId, userId);
    return;
  }
  await gatewayFetch<void>(`/api/comunidades/${comunidadId}/miembros/${userId}`, {
    method: 'DELETE',
  });
}

export async function listPublicaciones(comunidadId: string): Promise<Post[]> {
  if (isMockMode()) return demo.demoListPublicaciones(comunidadId);
  return gatewayFetch(`/api/comunidades/${comunidadId}/publicaciones`);
}

export async function createPublicacion(
  comunidadId: string,
  body: { texto: string; tipo: TipoPost },
): Promise<Post> {
  if (isMockMode()) return demo.demoCreatePublicacion(comunidadId, body);
  return gatewayFetch(`/api/comunidades/${comunidadId}/publicaciones`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function toggleReaccion(
  comunidadId: string,
  postId: string,
  tipo: TipoReaccion = 'like',
): Promise<Post> {
  if (isMockMode()) return demo.demoToggleReaccion(comunidadId, postId, tipo);
  return gatewayFetch(`/api/comunidades/${comunidadId}/publicaciones/${postId}/reaccion`, {
    method: 'POST',
    body: JSON.stringify({ tipo }),
  });
}

export async function addComentario(
  comunidadId: string,
  postId: string,
  texto: string,
): Promise<Post> {
  if (isMockMode()) return demo.demoAddComentario(comunidadId, postId, texto);
  return gatewayFetch(`/api/comunidades/${comunidadId}/publicaciones/${postId}/comentarios`, {
    method: 'POST',
    body: JSON.stringify({ texto }),
  });
}

export async function updatePublicacion(
  comunidadId: string,
  postId: string,
  body: { fijado?: boolean },
): Promise<Post> {
  if (isMockMode()) return demo.demoUpdatePublicacion(comunidadId, postId, body);
  return gatewayFetch(`/api/comunidades/${comunidadId}/publicaciones/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deletePublicacion(comunidadId: string, postId: string): Promise<void> {
  if (isMockMode()) {
    demo.demoDeletePublicacion(comunidadId, postId);
    return;
  }
  await gatewayFetch<void>(`/api/comunidades/${comunidadId}/publicaciones/${postId}`, {
    method: 'DELETE',
  });
}

export async function listEventos(
  comunidadId: string,
  estado: 'proximos' | 'pasados' = 'proximos',
): Promise<EventoComunidad[]> {
  if (isMockMode()) return demo.demoListEventos(comunidadId, estado);
  return gatewayFetch(`/api/comunidades/${comunidadId}/eventos?estado=${estado}`);
}

export async function getEvento(comunidadId: string, eventoId: string): Promise<EventoComunidad> {
  if (isMockMode()) return demo.demoGetEvento(comunidadId, eventoId);
  return gatewayFetch(`/api/comunidades/${comunidadId}/eventos/${eventoId}`);
}

export async function createEvento(
  comunidadId: string,
  body: {
    titulo: string;
    descripcion?: string;
    lugar?: string;
    inicioEn: string;
    finEn: string;
    cupoMax?: number | null;
  },
): Promise<EventoComunidad> {
  if (isMockMode()) return demo.demoCreateEvento(comunidadId, body);
  return gatewayFetch(`/api/comunidades/${comunidadId}/eventos`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function confirmarEvento(
  comunidadId: string,
  eventoId: string,
): Promise<EventoComunidad> {
  if (isMockMode()) return demo.demoConfirmarEvento(comunidadId, eventoId);
  return gatewayFetch(`/api/comunidades/${comunidadId}/eventos/${eventoId}/confirmar`, {
    method: 'POST',
  });
}

export async function cancelarEvento(
  comunidadId: string,
  eventoId: string,
): Promise<EventoComunidad> {
  if (isMockMode()) return demo.demoCancelarEvento(comunidadId, eventoId);
  return gatewayFetch(`/api/comunidades/${comunidadId}/eventos/${eventoId}/confirmar`, {
    method: 'DELETE',
  });
}

export async function deleteEvento(comunidadId: string, eventoId: string): Promise<void> {
  if (isMockMode()) {
    demo.demoDeleteEvento(comunidadId, eventoId);
    return;
  }
  await gatewayFetch<void>(`/api/comunidades/${comunidadId}/eventos/${eventoId}`, {
    method: 'DELETE',
  });
}
