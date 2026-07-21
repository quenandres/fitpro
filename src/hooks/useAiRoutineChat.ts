import { useCallback, useRef, useState } from 'react';

import { generateRoutineWithAI } from '../lib/ai/deepseek';
import {
  buildGenerateRequest,
  createAssistantDraft,
  createAssistantError,
  createAssistantPending,
  createUserMessage,
  summarizeDraft,
  WELCOME_MESSAGE,
  type ChatMessage,
  type ChatPrefs,
} from '../lib/ai/chatHelpers';
import { resolveExercisesAgainstApi } from '../utils/resolveExercisesAgainstApi';
import { sanitizeTrainingDays } from '../utils/aiRoutineAdapter';
import { validateGenerateRoutineInput } from '../utils/validators';
import type { ResolvedRoutineDraft } from '../types';

const DEFAULT_PREFS: ChatPrefs = {
  nivel: '',
  duracion_min: 45,
  equipamiento: '',
  limitaciones: '',
};

export const useAiRoutineChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [prefs, setPrefs] = useState<ChatPrefs>(DEFAULT_PREFS);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeDraft, setActiveDraft] = useState<ResolvedRoutineDraft | null>(null);
  const abortRef = useRef(0);

  const sendMessage = useCallback(
    async (rawText?: string) => {
      const text = (rawText ?? input).trim();
      if (text.length < 10 || loading) return;

      const requestId = ++abortRef.current;
      const userMsg = createUserMessage(text);
      const pending = createAssistantPending();

      setInput('');
      setLoading(true);
      setMessages((prev) => [...prev, userMsg, pending]);

      try {
        const historyForContext = [...messages, userMsg];
        const payload = buildGenerateRequest(text, prefs, historyForContext);

        const validationErrors = validateGenerateRoutineInput(payload);
        if (validationErrors.length > 0) {
          throw new Error(validationErrors[0]?.message ?? 'Datos inválidos para generar la rutina');
        }

        const generated = await generateRoutineWithAI(payload);

        if (requestId !== abortRef.current) return;

        const withDays = {
          ...generated,
          dias_entrenamiento: sanitizeTrainingDays(generated.dias_entrenamiento),
        };

        const draft = await resolveExercisesAgainstApi(withDays);
        if (requestId !== abortRef.current) return;

        const summary = summarizeDraft(draft, withDays);
        const assistantMsg = createAssistantDraft(draft, summary);

        setMessages((prev) =>
          prev.map((m) => (m.id === pending.id ? assistantMsg : m)),
        );
        setActiveDraft(draft);
      } catch (err) {
        if (requestId !== abortRef.current) return;
        const message =
          err instanceof Error ? err.message : 'No se pudo generar la rutina';
        const errorMsg = createAssistantError(message);
        setMessages((prev) =>
          prev.map((m) => (m.id === pending.id ? errorMsg : m)),
        );
      } finally {
        if (requestId === abortRef.current) setLoading(false);
      }
    },
    [input, loading, messages, prefs],
  );

  const resetChat = useCallback(() => {
    abortRef.current += 1;
    setMessages([WELCOME_MESSAGE]);
    setActiveDraft(null);
    setInput('');
    setLoading(false);
  }, []);

  return {
    messages,
    prefs,
    setPrefs,
    input,
    setInput,
    loading,
    activeDraft,
    setActiveDraft,
    sendMessage,
    resetChat,
  };
};
