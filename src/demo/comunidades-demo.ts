import type { TabExplorar } from '../lib/gateway/comunidades.service';
import { DEMO_TRAINER_USER } from '../lib/mock-mode';
import type {
  Comunidad,
  EventoComunidad,
  MiembroComunidad,
  Post,
  RolComunidad,
  TipoPost,
  TipoReaccion,
} from '../types/community';

const TRAINER_ID = DEMO_TRAINER_USER.id;
const PLACEHOLDER = 'https://placehold.co/400x200/png';
const AVATAR = 'https://placehold.co/64x64/png';

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(18, 0, 0, 0);
  return d.toISOString();
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

type State = {
  comunidades: Comunidad[];
  posts: Post[];
  eventos: EventoComunidad[];
  miembros: MiembroComunidad[];
};

let state: State | null = null;

export function resetComunidadesDemoState(): void {
  state = null;
}

function ensureState(): State {
  if (!state) {
    state = {
      comunidades: [
        {
          id: 'demo-com-fuerza',
          nombre: 'Fuerza CDMX',
          descripcion:
            'Comunidad de entrenamiento de fuerza en Ciudad de México. Técnica, progresión y apoyo entre miembros.',
          categoria: 'fuerza',
          visibilidad: 'publica',
          portadaUrl: PLACEHOLDER,
          avatarUrl: AVATAR,
          miembrosCount: 128,
          postsCount: 2,
          eventosCount: 1,
          reglas: ['Respeta la técnica', 'Sin spam'],
          liderIds: [TRAINER_ID],
          creadaEn: isoDaysAgo(90),
          esMiembro: true,
          miRol: 'leader',
        },
        {
          id: 'demo-com-running',
          nombre: 'Running matutino',
          descripcion: 'Salidas en grupo antes del trabajo.',
          categoria: 'running',
          visibilidad: 'publica',
          portadaUrl: PLACEHOLDER,
          avatarUrl: AVATAR,
          miembrosCount: 64,
          postsCount: 1,
          eventosCount: 1,
          reglas: ['Puntualidad'],
          liderIds: ['demo-run-mod'],
          creadaEn: isoDaysAgo(45),
          esMiembro: false,
          miRol: null,
        },
      ],
      posts: [
        {
          id: 'post-1',
          comunidadId: 'demo-com-fuerza',
          autorId: TRAINER_ID,
          tipo: 'anuncio',
          texto: 'Este sábado clínica de sentadilla. Confirma asistencia en eventos.',
          media: [],
          reacciones: [{ tipo: 'like', miembroId: 'demo-m1' }],
          comentarios: [],
          fijado: true,
          creadoEn: isoDaysAgo(2),
          autorNombre: 'Laura Méndez',
        },
        {
          id: 'post-2',
          comunidadId: 'demo-com-fuerza',
          autorId: 'demo-client-valentina',
          tipo: 'logro',
          texto: 'Valentina Ruiz compartió un PR en sentadilla — 70 kg × 5.',
          media: [],
          reacciones: [{ tipo: 'like', miembroId: TRAINER_ID }],
          comentarios: [],
          creadoEn: isoDaysAgo(4),
          autorNombre: 'Valentina Ruiz',
        },
        {
          id: 'post-3',
          comunidadId: 'demo-com-running',
          autorId: 'demo-run-mod',
          tipo: 'general',
          texto: 'Domingo 8 km — ritmo 6:00/km.',
          media: [],
          reacciones: [],
          comentarios: [],
          creadoEn: isoDaysAgo(3),
          autorNombre: 'Marco Reyes',
        },
      ],
      eventos: [
        {
          id: 'ev-1',
          comunidadId: 'demo-com-fuerza',
          titulo: 'Clínica de sentadilla',
          descripcion: 'Grupos de 4, revisión de técnica.',
          lugar: 'Gimnasio Centro',
          inicioEn: isoDaysFromNow(3),
          finEn: isoDaysFromNow(3),
          cupoMax: 16,
          participantes: [{ miembroId: TRAINER_ID, estado: 'confirmado' }],
          creadoPorId: TRAINER_ID,
          estadoParticipacion: 'confirmado',
        },
        {
          id: 'ev-2',
          comunidadId: 'demo-com-running',
          titulo: 'Rodaje suave 8 km',
          descripcion: 'Salida 6:30',
          lugar: 'Parque México',
          inicioEn: isoDaysFromNow(5),
          finEn: isoDaysFromNow(5),
          cupoMax: 30,
          participantes: [],
          estadoParticipacion: 'ninguno',
        },
        {
          id: 'ev-past',
          comunidadId: 'demo-com-fuerza',
          titulo: 'Meetup de progresión',
          descripcion: 'Sesión del mes pasado.',
          lugar: 'Sala B',
          inicioEn: isoDaysAgo(14),
          finEn: isoDaysAgo(14),
          cupoMax: 20,
          participantes: [],
          estadoParticipacion: 'ninguno',
        },
      ],
      miembros: [
        {
          id: TRAINER_ID,
          comunidadId: 'demo-com-fuerza',
          nombre: 'Laura Méndez',
          avatarUrl: AVATAR,
          rol: 'leader',
          unidoEn: isoDaysAgo(120),
        },
        {
          id: 'demo-client-valentina',
          comunidadId: 'demo-com-fuerza',
          nombre: 'Valentina Ruiz',
          avatarUrl: AVATAR,
          rol: 'member',
          unidoEn: isoDaysAgo(30),
        },
        {
          id: 'demo-run-mod',
          comunidadId: 'demo-com-running',
          nombre: 'Marco Reyes',
          avatarUrl: AVATAR,
          rol: 'moderator',
          unidoEn: isoDaysAgo(40),
        },
      ],
    };
  }
  return state;
}

function findComunidad(id: string): Comunidad {
  const c = ensureState().comunidades.find((x) => x.id === id);
  if (!c) throw new Error('Comunidad no encontrada');
  return c;
}

function clonePost(p: Post): Post {
  return {
    ...p,
    media: [...p.media],
    reacciones: [...p.reacciones],
    comentarios: p.comentarios.map((c) => ({ ...c })),
  };
}

export function demoListComunidades(params: {
  tab?: TabExplorar;
  q?: string;
}): Comunidad[] {
  let list = [...ensureState().comunidades];
  const tab = params.tab ?? 'para-ti';
  if (tab === 'mis-comunidades') list = list.filter((c) => c.esMiembro);
  if (tab === 'descubrir') list = list.filter((c) => !c.esMiembro);
  const q = params.q?.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        c.descripcion.toLowerCase().includes(q),
    );
  }
  return list;
}

export function demoGetComunidad(id: string): Comunidad & {
  esMiembro: boolean;
  miRol: RolComunidad | null;
} {
  const c = findComunidad(id);
  return {
    ...c,
    esMiembro: c.esMiembro ?? false,
    miRol: c.miRol ?? null,
  };
}

export function demoCreateComunidad(body: {
  nombre: string;
  descripcion: string;
  categoria: string;
  visibilidad: string;
}): Comunidad {
  const c: Comunidad = {
    id: `demo-com-${Date.now()}`,
    nombre: body.nombre,
    descripcion: body.descripcion,
    categoria: body.categoria as Comunidad['categoria'],
    visibilidad: body.visibilidad as Comunidad['visibilidad'],
    portadaUrl: PLACEHOLDER,
    avatarUrl: AVATAR,
    miembrosCount: 1,
    postsCount: 0,
    eventosCount: 0,
    reglas: [],
    liderIds: [TRAINER_ID],
    creadaEn: new Date().toISOString(),
    esMiembro: true,
    miRol: 'leader',
  };
  ensureState().comunidades.unshift(c);
  return c;
}

export function demoJoinComunidad(id: string): Comunidad {
  const c = findComunidad(id);
  c.esMiembro = true;
  c.miRol = 'member';
  c.miembrosCount += 1;
  return { ...c };
}

export function demoLeaveComunidad(id: string): void {
  const c = findComunidad(id);
  c.esMiembro = false;
  c.miRol = null;
  c.miembrosCount = Math.max(0, c.miembrosCount - 1);
}

export function demoListMiembros(comunidadId: string): MiembroComunidad[] {
  return ensureState()
    .miembros.filter((m) => m.comunidadId === comunidadId)
    .map((m) => ({ ...m }));
}

export function demoUpdateMiembro(
  comunidadId: string,
  userId: string,
  body: { rol?: RolComunidad; suspendido?: boolean },
): MiembroComunidad {
  const m = ensureState().miembros.find(
    (x) => x.comunidadId === comunidadId && x.id === userId,
  );
  if (!m) throw new Error('Miembro no encontrado');
  if (body.rol) m.rol = body.rol;
  if (body.suspendido !== undefined) m.suspendido = body.suspendido;
  return { ...m };
}

export function demoRemoveMiembro(comunidadId: string, userId: string): void {
  ensureState().miembros = ensureState().miembros.filter(
    (m) => !(m.comunidadId === comunidadId && m.id === userId),
  );
  findComunidad(comunidadId).miembrosCount = Math.max(
    0,
    findComunidad(comunidadId).miembrosCount - 1,
  );
}

export function demoListPublicaciones(comunidadId: string): Post[] {
  return ensureState()
    .posts.filter((p) => p.comunidadId === comunidadId)
    .map(clonePost);
}

export function demoCreatePublicacion(
  comunidadId: string,
  body: { texto: string; tipo: TipoPost },
): Post {
  const post: Post = {
    id: `post-${Date.now()}`,
    comunidadId,
    autorId: TRAINER_ID,
    tipo: body.tipo,
    texto: body.texto,
    media: [],
    reacciones: [],
    comentarios: [],
    creadoEn: new Date().toISOString(),
    autorNombre: 'Laura Méndez',
  };
  ensureState().posts.unshift(post);
  findComunidad(comunidadId).postsCount += 1;
  return clonePost(post);
}

export function demoToggleReaccion(
  comunidadId: string,
  postId: string,
  tipo: TipoReaccion = 'like',
): Post {
  const post = ensureState().posts.find(
    (p) => p.comunidadId === comunidadId && p.id === postId,
  );
  if (!post) throw new Error('Publicación no encontrada');
  const idx = post.reacciones.findIndex((r) => r.miembroId === TRAINER_ID);
  if (idx >= 0) post.reacciones.splice(idx, 1);
  else post.reacciones.push({ tipo, miembroId: TRAINER_ID });
  return clonePost(post);
}

export function demoAddComentario(
  comunidadId: string,
  postId: string,
  texto: string,
): Post {
  const post = ensureState().posts.find(
    (p) => p.comunidadId === comunidadId && p.id === postId,
  );
  if (!post) throw new Error('Publicación no encontrada');
  post.comentarios.push({
    id: `c-${Date.now()}`,
    postId,
    autorId: TRAINER_ID,
    texto,
    creadoEn: new Date().toISOString(),
    autorNombre: 'Laura Méndez',
  });
  return clonePost(post);
}

export function demoUpdatePublicacion(
  comunidadId: string,
  postId: string,
  body: { fijado?: boolean },
): Post {
  const post = ensureState().posts.find(
    (p) => p.comunidadId === comunidadId && p.id === postId,
  );
  if (!post) throw new Error('Publicación no encontrada');
  if (body.fijado !== undefined) post.fijado = body.fijado;
  return clonePost(post);
}

export function demoDeletePublicacion(comunidadId: string, postId: string): void {
  ensureState().posts = ensureState().posts.filter(
    (p) => !(p.comunidadId === comunidadId && p.id === postId),
  );
  findComunidad(comunidadId).postsCount = Math.max(
    0,
    findComunidad(comunidadId).postsCount - 1,
  );
}

export function demoListEventos(
  comunidadId: string,
  estado: 'proximos' | 'pasados',
): EventoComunidad[] {
  const now = Date.now();
  return ensureState()
    .eventos.filter((e) => e.comunidadId === comunidadId)
    .filter((e) => {
      const t = new Date(e.inicioEn).getTime();
      return estado === 'proximos' ? t >= now : t < now;
    })
    .map((e) => ({ ...e, participantes: [...e.participantes] }));
}

export function demoGetEvento(
  comunidadId: string,
  eventoId: string,
): EventoComunidad {
  const ev = ensureState().eventos.find(
    (e) => e.comunidadId === comunidadId && e.id === eventoId,
  );
  if (!ev) throw new Error('Evento no encontrado');
  return { ...ev, participantes: [...ev.participantes] };
}

export function demoCreateEvento(
  comunidadId: string,
  body: {
    titulo: string;
    descripcion?: string;
    lugar?: string;
    inicioEn: string;
    finEn: string;
    cupoMax?: number | null;
  },
): EventoComunidad {
  const ev: EventoComunidad = {
    id: `ev-${Date.now()}`,
    comunidadId,
    titulo: body.titulo,
    descripcion: body.descripcion ?? '',
    lugar: body.lugar ?? '',
    inicioEn: body.inicioEn,
    finEn: body.finEn,
    cupoMax: body.cupoMax ?? null,
    participantes: [],
    creadoPorId: TRAINER_ID,
    estadoParticipacion: 'ninguno',
  };
  ensureState().eventos.push(ev);
  findComunidad(comunidadId).eventosCount += 1;
  return { ...ev };
}

export function demoConfirmarEvento(
  comunidadId: string,
  eventoId: string,
): EventoComunidad {
  const ev = demoGetEvento(comunidadId, eventoId);
  if (!ev.participantes.some((p) => p.miembroId === TRAINER_ID)) {
    ev.participantes.push({ miembroId: TRAINER_ID, estado: 'confirmado' });
  }
  const stored = ensureState().eventos.find((e) => e.id === eventoId)!;
  stored.participantes = [...ev.participantes];
  stored.estadoParticipacion = 'confirmado';
  return demoGetEvento(comunidadId, eventoId);
}

export function demoCancelarEvento(
  comunidadId: string,
  eventoId: string,
): EventoComunidad {
  const stored = ensureState().eventos.find(
    (e) => e.comunidadId === comunidadId && e.id === eventoId,
  );
  if (!stored) throw new Error('Evento no encontrado');
  stored.participantes = stored.participantes.filter(
    (p) => p.miembroId !== TRAINER_ID,
  );
  stored.estadoParticipacion = 'ninguno';
  return demoGetEvento(comunidadId, eventoId);
}

export function demoDeleteEvento(comunidadId: string, eventoId: string): void {
  ensureState().eventos = ensureState().eventos.filter(
    (e) => !(e.comunidadId === comunidadId && e.id === eventoId),
  );
  findComunidad(comunidadId).eventosCount = Math.max(
    0,
    findComunidad(comunidadId).eventosCount - 1,
  );
}
