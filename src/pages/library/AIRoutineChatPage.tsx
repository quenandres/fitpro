import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  CalendarDays,
  LoaderCircle,
  PencilLine,
  Plus,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAiRoutineChat } from '../../hooks/useAiRoutineChat';
import { useDataStore } from '../../store/useDataStore';
import { draftToRutinaPayload } from '../../utils/resolveExercisesAgainstApi';
import { routineFormPath } from '../../utils/inferRoutineFormLevel';
import { ExerciseDetailModal } from '../../components/exercise/ExerciseDetailModal';
import type { ResolvedExercise, RoutineFormLevel } from '../../types';
import { RoutineCreationMethodTabs } from '../../components/library/routines/RoutineCreationMethodTabs';
import { RoutineCreationLayout } from '../../components/library/routines/RoutineCreationLayout';
import { AIRoutineAssistantPanel } from '../../components/library/routines/AIRoutineAssistantPanel';
import {
  AI_PROMPT_TEMPLATES,
  AI_SYNTHESIS_MODES,
  PROMPT_MODIFIER_CHIPS,
} from '../../data/routineBuilderMock';
import { RoutineCreationChrome } from '../../components/library/routines/RoutineCreationChrome';
import { ROUTES } from '../../routes/paths';

const ExerciseRow = ({
  exercise,
  onPreview,
}: {
  exercise: ResolvedExercise;
  onPreview: (id: string) => void;
}) => (
  <article className="fp-card relative overflow-hidden" style={{ padding: '10px 10px 10px 13px' }}>
    <div className="fp-accent-bar" style={{ background: 'var(--accent-blue)' }} aria-hidden />
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          overflow: 'hidden',
          flexShrink: 0,
          background: 'var(--accent-blue-dim)',
          border: '1px solid color-mix(in srgb, var(--accent-blue) 22%, transparent)',
        }}
      >
        {exercise.imageUrl ? (
          <img
            src={exercise.imageUrl}
            alt=""
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : null}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="font-sora truncate" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
          {exercise.nombre}
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {exercise.series} × {exercise.valor}
          {exercise.proposedName ? ` · IA: ${exercise.proposedName}` : ''}
        </p>
      </div>
      <span
        className={`badge ${exercise.matchStatus === 'matched' ? 'badge-blue' : ''}`}
        style={
          exercise.matchStatus === 'matched'
            ? { fontSize: 9, padding: '2px 6px', flexShrink: 0 }
            : {
                fontSize: 9,
                padding: '2px 6px',
                flexShrink: 0,
                background: 'color-mix(in srgb, var(--accent-red) 12%, transparent)',
                color: 'var(--accent-red)',
                border: '1px solid color-mix(in srgb, var(--accent-red) 30%, transparent)',
              }
        }
      >
        {exercise.matchStatus === 'matched' ? 'Catálogo' : 'Sin match'}
      </span>
      {exercise.exerciseDbId ? (
        <button
          type="button"
          className="fp-btn fp-btn-ghost"
          style={{ padding: 6 }}
          onClick={() => onPreview(exercise.exerciseDbId!)}
          aria-label="Ver detalle"
        >
          <Sparkles size={14} color="var(--accent-blue)" />
        </button>
      ) : null}
    </div>
  </article>
);

export const AIRoutineChatPage = () => {
  const navigate = useNavigate();
  const addRutina = useDataStore((s) => s.addRutina);
  const {
    messages,
    prefs,
    setPrefs,
    input,
    setInput,
    loading,
    activeDraft,
    sendMessage,
    resetChat,
    usuarios,
    selectedCliente,
  } = useAiRoutineChat();

  const [savedRoutineId, setSavedRoutineId] = useState<number | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [precisionLevel, setPrecisionLevel] = useState<RoutineFormLevel>('intermedia');
  const [mesocycleWeeks, setMesocycleWeeks] = useState(8);
  const [synthesisId, setSynthesisId] = useState<string>(AI_SYNTHESIS_MODES[0].id);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const synthesisPrefix =
    AI_SYNTHESIS_MODES.find((m) => m.id === synthesisId)?.prefix ?? '';

  const handleSend = () => {
    const composed = `${synthesisPrefix}${input}`.trim();
    void sendMessage(composed);
  };

  const appendChip = (text: string) => {
    setInput((prev) => `${prev}${prev.trim() ? ' ' : ''}${text}`.trim());
  };

  const handleSave = () => {
    if (!activeDraft) return;
    const id = addRutina(draftToRutinaPayload(activeDraft));
    setSavedRoutineId(id);
  };

  const visibleChips = PROMPT_MODIFIER_CHIPS.filter(
    (c) => !('levels' in c) || c.levels.includes(precisionLevel),
  );

  const canSend = input.trim().length >= 10 && !loading;

  const main = (
    <>
      <RoutineCreationChrome
        crumbs={[
          { label: 'Rutinas', to: ROUTES.library.rutinas },
          { label: 'Nueva rutina', to: ROUTES.library.rutinasNueva },
          { label: 'Asistente IA' },
        ]}
        title="Generar rutina con IA"
        subtitle="Describe objetivos, nivel, equipo y restricciones. El asistente propone un borrador para validar contra el catálogo."
        badges={
          <span className="badge badge-brand" style={{ fontSize: 10, padding: '3px 8px' }}>
            <Sparkles size={10} style={{ marginRight: 3 }} />
            Activo
          </span>
        }
        aside={
          <button
            type="button"
            className="fp-btn fp-btn-ghost"
            style={{ gap: 6, fontSize: 12 }}
            onClick={resetChat}
          >
            <RefreshCw size={14} />
            Nuevo chat
          </button>
        }
      />

      <div className="fp-card mb-4" style={{ padding: 14 }}>
        <label className="fp-cal-label" htmlFor="ia-prompt">
          Instrucción y objetivos
        </label>
        <textarea
          id="ia-prompt"
          className="fp-input mt-2 w-full"
          rows={4}
          value={input}
          placeholder="Ej: Atleta intermedio, hipertrofia de torso, 4 días, 45 min, cuidado lumbar…"
          onChange={(e) => setInput(e.target.value)}
          style={{ resize: 'vertical', fontSize: 13 }}
          disabled={loading}
        />

        <p className="fp-cal-label mt-3 mb-2">Modificadores rápidos</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {visibleChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              className="fp-btn fp-btn-secondary"
              style={{ fontSize: 11, padding: '5px 10px', gap: 4 }}
              onClick={() => appendChip(chip.text)}
            >
              <Plus size={12} />
              {chip.label}
            </button>
          ))}
        </div>

        <p className="fp-cal-label mb-2">Modo de síntesis</p>
        <div className="grid gap-2 mb-3">
          {AI_SYNTHESIS_MODES.map((mode) => {
            const active = synthesisId === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSynthesisId(mode.id)}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 11,
                  cursor: 'pointer',
                  border: `1px solid ${active ? 'var(--accent-blue)' : 'var(--border)'}`,
                  background: active ? 'var(--accent-blue-dim)' : 'var(--bg-elevated)',
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{mode.title}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{mode.desc}</p>
              </button>
            );
          })}
        </div>

        <p className="fp-cal-label mb-2">Plantillas de prompt</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {AI_PROMPT_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              className="fp-btn fp-btn-ghost"
              style={{ fontSize: 11, padding: '5px 10px' }}
              onClick={() => setInput(t.text)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="fp-btn fp-btn-primary w-full"
          style={{ justifyContent: 'center', gap: 7 }}
          disabled={!canSend}
          onClick={handleSend}
        >
          {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
          Generar rutina
        </button>
        {input.trim().length > 0 && input.trim().length < 10 ? (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Escribe al menos 10 caracteres.
          </p>
        ) : null}
      </div>

      <article className="fp-card relative overflow-hidden" style={{ padding: 16, marginBottom: 18, minHeight: 200 }}>
        <div className="fp-accent-bar" style={{ background: 'var(--accent-blue)' }} aria-hidden />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 3 }}>
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: 'min(92%, 640px)',
                }}
              >
                <div
                  className="fp-card"
                  style={{
                    padding: '12px 14px',
                    background: isUser
                      ? 'var(--accent-blue-dim)'
                      : msg.status === 'error'
                        ? 'color-mix(in srgb, var(--accent-red) 8%, var(--bg-card))'
                        : 'var(--bg-elevated)',
                    borderColor: isUser
                      ? 'color-mix(in srgb, var(--accent-blue) 30%, transparent)'
                      : msg.status === 'error'
                        ? 'color-mix(in srgb, var(--accent-red) 35%, transparent)'
                        : 'var(--border)',
                  }}
                >
                  {!isUser ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        marginBottom: 6,
                        fontSize: 10,
                        fontWeight: 600,
                        color: msg.status === 'error' ? 'var(--accent-red)' : 'var(--accent-blue)',
                        textTransform: 'uppercase',
                        letterSpacing: '.04em',
                      }}
                    >
                      {msg.status === 'error' ? (
                        <AlertCircle size={11} />
                      ) : msg.status === 'pending' ? (
                        <LoaderCircle size={11} className="animate-spin" />
                      ) : (
                        <Bot size={11} />
                      )}
                      FitPro IA
                    </div>
                  ) : null}
                  <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </p>

                  {msg.draft ? (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        <p className="font-sora" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {msg.draft.rutina.nombre}
                        </p>
                        <span className="badge badge-blue">{msg.draft.rutina.dificultad}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                        {msg.draft.rutina.descripcion}
                      </p>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
                        <CalendarDays size={12} />
                        {msg.draft.dias_entrenamiento.join(' · ')}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {msg.draft.exercises.map((ex, i) => (
                          <ExerciseRow key={`${ex.nombre}-${i}`} exercise={ex} onPreview={setPreviewId} />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </article>

      {activeDraft ? (
        <article
          className="fp-card relative overflow-hidden"
          style={{
            padding: 16,
            marginBottom: 18,
            display: 'grid',
            gap: 10,
            borderColor: 'color-mix(in srgb, var(--accent-blue) 30%, transparent)',
          }}
        >
          <div className="fp-accent-bar" style={{ background: 'var(--brand)' }} aria-hidden />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', paddingLeft: 3 }}>
            Rutina activa:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{activeDraft.rutina.nombre}</strong>
            {' · '}
            {activeDraft.exercises.filter((e) => e.matchStatus === 'matched').length}/
            {activeDraft.exercises.length} con catálogo
          </p>
          <button
            type="button"
            className="fp-btn fp-btn-primary w-full"
            style={{ justifyContent: 'center', gap: 7 }}
            onClick={handleSave}
            disabled={loading}
          >
            <Save size={14} />
            Guardar rutina
          </button>
          {savedRoutineId !== null ? (
            <button
              type="button"
              className="fp-btn fp-btn-secondary w-full"
              style={{ justifyContent: 'center', gap: 7 }}
              onClick={() => navigate(routineFormPath(precisionLevel, savedRoutineId))}
            >
              <PencilLine size={14} />
              Editar en constructor ({precisionLevel})
            </button>
          ) : null}
        </article>
      ) : null}

      <ExerciseDetailModal exerciseId={previewId} onClose={() => setPreviewId(null)} />
    </>
  );

  return (
    <div>
      <RoutineCreationMethodTabs />
      <RoutineCreationLayout
        main={main}
        sidebar={
          <AIRoutineAssistantPanel
            precisionLevel={precisionLevel}
            onPrecisionChange={setPrecisionLevel}
            prefs={prefs}
            setPrefs={setPrefs}
            usuarios={usuarios}
            selectedCliente={selectedCliente}
            mesocycleWeeks={mesocycleWeeks}
            onMesocycleWeeksChange={setMesocycleWeeks}
          />
        }
      />
    </div>
  );
};
