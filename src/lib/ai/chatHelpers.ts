import type {
  EjercicioRutina,
  GenerateRoutineApiResponse,
  GenerateRoutineRequest,
  ResolvedRoutineDraft,
} from '../../types';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  draft?: ResolvedRoutineDraft;
  status?: 'pending' | 'error';
}

export interface ChatPrefs {
  nivel: string;
  duracion_min: number;
  equipamiento: string;
  limitaciones: string;
}

const uid = (): string =>
  `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const createUserMessage = (content: string): ChatMessage => ({
  id: uid(),
  role: 'user',
  content: content.trim(),
  createdAt: Date.now(),
});

export const createAssistantPending = (): ChatMessage => ({
  id: uid(),
  role: 'assistant',
  content: 'Buscando ejercicios en ExerciseDB y armando tu rutina…',
  createdAt: Date.now(),
  status: 'pending',
});

export const createAssistantError = (message: string): ChatMessage => ({
  id: uid(),
  role: 'assistant',
  content: message,
  createdAt: Date.now(),
  status: 'error',
});

export const createAssistantDraft = (
  draft: ResolvedRoutineDraft,
  summary: string,
): ChatMessage => ({
  id: uid(),
  role: 'assistant',
  content: summary,
  createdAt: Date.now(),
  draft,
});

/** Construye el payload para el backend, incluyendo historial como contexto. */
export const buildGenerateRequest = (
  latestUserText: string,
  prefs: ChatPrefs,
  history: ChatMessage[],
): GenerateRoutineRequest => {
  const prior = history
    .filter((m) => m.role === 'user' || (m.role === 'assistant' && m.draft))
    .slice(-6)
    .map((m) => {
      if (m.role === 'user') return `Usuario: ${m.content}`;
      const names = m.draft?.exercises.map((e: EjercicioRutina) => e.nombre).join(', ') ?? '';
      return `Asistente (rutina previa: ${m.draft?.rutina.nombre ?? 'n/a'} — ${names}): ${m.content}`;
    })
    .join('\n');

  const objetivo = prior
    ? `${prior}\nUsuario: ${latestUserText}\n\nGenera o ajusta la rutina según el último mensaje del usuario.`
    : latestUserText;

  return {
    objetivo: objetivo.slice(0, 500),
    nivel: prefs.nivel || undefined,
    duracion_min: prefs.duracion_min,
    equipamiento: prefs.equipamiento || undefined,
    limitaciones: prefs.limitaciones || undefined,
  };
};

export const summarizeDraft = (
  draft: ResolvedRoutineDraft,
  apiMeta?: GenerateRoutineApiResponse,
): string => {
  const matched = draft.exercises.filter((e: ResolvedRoutineDraft['exercises'][number]) => e.matchStatus === 'matched').length;
  const total = draft.exercises.length;
  const days = draft.dias_entrenamiento.join(', ');
  const reason = apiMeta?.razonamiento?.trim();

  const base = `Propongo «${draft.rutina.nombre}» (${draft.rutina.dificultad}, ${draft.rutina.duracion_min} min). ${matched}/${total} ejercicios enlazados con ExerciseDB. Días: ${days || 'a definir'}.`;
  return reason ? `${base}\n\n${reason}` : `${base}\n\nPuedes pedir cambios (más cardio, menos peso, otro enfoque) o guardar la rutina.`;
};

export const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Cuéntame tu objetivo (nivel, días, equipo, lesiones). Generaré una rutina y enlazaré cada ejercicio con ExerciseDB para que puedas guardarla o refinarla en el chat.',
  createdAt: Date.now(),
};
