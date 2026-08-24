import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  CalendarDays,
  LoaderCircle,
  PencilLine,
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
import { routineEditPath } from '../../utils/inferRoutineFormLevel';
import { ExerciseDetailModal } from '../../components/exercise/ExerciseDetailModal';
import type { ResolvedExercise } from '../../types';

const LIBRARY_ACCENT = '#58a6ff';

const ExerciseRow = ({
  exercise,
  onPreview,
}: {
  exercise: ResolvedExercise;
  onPreview: (id: string) => void;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 10px',
      borderRadius: 10,
      background: 'var(--bg-overlay)',
      border: '1px solid var(--border-subtle)',
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 9,
        overflow: 'hidden',
        flexShrink: 0,
        background: 'rgba(88,166,255,.12)',
        border: '1px solid rgba(88,166,255,.2)',
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
      <p
        className="font-sora truncate"
        style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}
      >
        {exercise.nombre}
      </p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {exercise.series} × {exercise.valor}
        {exercise.proposedName ? ` · IA: ${exercise.proposedName}` : ''}
      </p>
    </div>
    <span
      className="badge"
      style={{
        fontSize: 9,
        padding: '2px 6px',
        background:
          exercise.matchStatus === 'matched'
            ? 'rgba(88,166,255,.14)'
            : 'rgba(248,81,73,.12)',
        color:
          exercise.matchStatus === 'matched' ? LIBRARY_ACCENT : 'var(--accent-red)',
        border: `1px solid ${
          exercise.matchStatus === 'matched'
            ? 'rgba(88,166,255,.3)'
            : 'rgba(248,81,73,.3)'
        }`,
        flexShrink: 0,
      }}
    >
      {exercise.matchStatus === 'matched' ? 'API' : 'Sin match'}
    </span>
    {exercise.exerciseDbId && (
      <button
        type="button"
        className="fp-btn fp-btn-ghost"
        style={{ padding: 6, borderRadius: 8 }}
        onClick={() => onPreview(exercise.exerciseDbId!)}
        aria-label="Ver detalle"
      >
        <Sparkles size={13} color={LIBRARY_ACCENT} />
      </button>
    )}
  </div>
);

export const AIRoutineChatPage = () => {
  const navigate = useNavigate();
  const addRutina = useDataStore((s) => s.addRutina);
  const rutinas = useDataStore((s) => s.rutinas);
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
  } = useAiRoutineChat();

  const [savedRoutineId, setSavedRoutineId] = useState<number | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [showPrefs, setShowPrefs] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSave = () => {
    if (!activeDraft) return;
    const id = addRutina(draftToRutinaPayload(activeDraft));
    setSavedRoutineId(id);
  };

  const canSend = input.trim().length >= 10 && !loading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 8 }}>
      <section className="animate-slide-up" style={{ paddingBottom: 4 }}>
        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
            <Bot size={10} style={{ marginRight: 3 }} />
            Rutina IA
          </span>
          <button
            type="button"
            className="fp-btn fp-btn-ghost"
            style={{ marginLeft: 'auto', padding: '4px 8px', fontSize: 11, gap: 4 }}
            onClick={resetChat}
          >
            <RefreshCw size={12} /> Nuevo chat
          </button>
        </div>
        <h1
          className="font-sora"
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '-.02em',
            color: 'var(--text-primary)',
            marginBottom: 4,
          }}
        >
          Chat de rutinas
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Describe tu objetivo. Cada ejercicio se resuelve contra ExerciseDB antes de guardar.
        </p>
      </section>

      <div className="fp-card" style={{ borderRadius: 13, padding: '10px 12px' }}>
        <button
          type="button"
          onClick={() => setShowPrefs((v) => !v)}
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            color: 'var(--text-secondary)',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Preferencias (nivel, duración, equipo)
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
            {showPrefs ? 'Ocultar' : 'Mostrar'}
          </span>
        </button>
        {showPrefs && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              marginTop: 10,
            }}
          >
            <select
              className="fp-input"
              value={prefs.nivel}
              onChange={(e) => setPrefs((p) => ({ ...p, nivel: e.target.value }))}
            >
              <option value="">Nivel automático</option>
              <option value="Principiante">Principiante</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
            <input
              type="number"
              className="fp-input"
              min={5}
              max={120}
              value={prefs.duracion_min}
              onChange={(e) =>
                setPrefs((p) => ({
                  ...p,
                  duracion_min: Number(e.target.value) || 45,
                }))
              }
            />
            <input
              className="fp-input"
              style={{ gridColumn: '1 / -1' }}
              placeholder="Equipamiento (opcional)"
              value={prefs.equipamiento}
              onChange={(e) => setPrefs((p) => ({ ...p, equipamiento: e.target.value }))}
            />
            <input
              className="fp-input"
              style={{ gridColumn: '1 / -1' }}
              placeholder="Limitaciones o lesiones (opcional)"
              value={prefs.limitaciones}
              onChange={(e) => setPrefs((p) => ({ ...p, limitaciones: e.target.value }))}
            />
          </div>
        )}
      </div>

      <div
        className="animate-slide-up delay-100"
        style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 280 }}
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '92%',
              }}
            >
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: isUser
                    ? 'rgba(88,166,255,.16)'
                    : msg.status === 'error'
                      ? 'rgba(248,81,73,.1)'
                      : 'var(--bg-elevated)',
                  border: `1px solid ${
                    isUser
                      ? 'rgba(88,166,255,.3)'
                      : msg.status === 'error'
                        ? 'rgba(248,81,73,.35)'
                        : 'var(--border)'
                  }`,
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      marginBottom: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      color: msg.status === 'error' ? 'var(--accent-red)' : LIBRARY_ACCENT,
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
                )}
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.content}
                </p>

                {msg.draft && (
                  <div style={{ marginTop: 10 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <p
                        className="font-sora"
                        style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}
                      >
                        {msg.draft.rutina.nombre}
                      </p>
                      <span className="badge badge-blue">{msg.draft.rutina.dificultad}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      {msg.draft.rutina.descripcion}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 5,
                        marginBottom: 10,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          color: 'var(--text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                        }}
                      >
                        <CalendarDays size={11} />
                        {msg.draft.dias_entrenamiento.join(' · ')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {msg.draft.exercises.map((ex, i) => (
                        <ExerciseRow
                          key={`${ex.nombre}-${i}`}
                          exercise={ex}
                          onPreview={setPreviewId}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {activeDraft && (
        <div
          className="fp-card animate-slide-up"
          style={{
            borderRadius: 13,
            padding: 12,
            borderColor: 'rgba(88,166,255,.3)',
            display: 'grid',
            gap: 8,
          }}
        >
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            Rutina activa: <strong style={{ color: 'var(--text-primary)' }}>{activeDraft.rutina.nombre}</strong>
            {' · '}
            {activeDraft.exercises.filter((e) => e.matchStatus === 'matched').length}/
            {activeDraft.exercises.length} con ExerciseDB
          </p>
          <button
            type="button"
            className="fp-btn fp-btn-primary"
            style={{ width: '100%', justifyContent: 'center', gap: 7 }}
            onClick={handleSave}
            disabled={loading}
          >
            <Save size={14} />
            Guardar rutina
          </button>
          {savedRoutineId !== null && (() => {
            const saved = rutinas.find((r) => r.id === savedRoutineId);
            if (!saved) return null;
            return (
            <button
              type="button"
              className="fp-btn fp-btn-secondary"
              style={{ width: '100%', justifyContent: 'center', gap: 7 }}
              onClick={() => navigate(routineEditPath(saved))}
            >
              <PencilLine size={14} />
              Editar rutina
            </button>
            );
          })()}
        </div>
      )}

      <div
        className="fp-card"
        style={{
          borderRadius: 14,
          padding: 10,
          position: 'sticky',
          bottom: 72,
          zIndex: 10,
          background: 'var(--bg-card)',
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            className="fp-input"
            rows={2}
            value={input}
            placeholder="Ej: hipertrofia tren inferior, 4 días, 45 min, cuidando rodillas…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void sendMessage();
              }
            }}
            style={{ resize: 'none', flex: 1, minHeight: 52, fontSize: 13 }}
            disabled={loading}
          />
          <button
            type="button"
            className="fp-btn fp-btn-primary"
            style={{
              width: 44,
              height: 44,
              padding: 0,
              borderRadius: 12,
              flexShrink: 0,
              opacity: canSend ? 1 : 0.5,
            }}
            disabled={!canSend}
            onClick={() => void sendMessage()}
            aria-label="Enviar"
          >
            {loading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        {input.trim().length > 0 && input.trim().length < 10 && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            Escribe al menos 10 caracteres para generar.
          </p>
        )}
      </div>

      <ExerciseDetailModal exerciseId={previewId} onClose={() => setPreviewId(null)} />
    </div>
  );
};
