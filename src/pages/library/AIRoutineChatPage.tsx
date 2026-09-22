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

const TOOLBAR_CARD_STYLE = {
  padding: 14,
  marginBottom: 18,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 12,
};

const ExerciseRow = ({
  exercise,
  onPreview,
}: {
  exercise: ResolvedExercise;
  onPreview: (id: string) => void;
}) => (
  <article
    className="fp-card relative overflow-hidden"
    style={{ padding: '10px 10px 10px 13px' }}
  >
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
        <p
          className="font-sora truncate"
          style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}
        >
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
    usuarios,
    selectedCliente,
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
    <div>
      <section style={{ paddingBottom: 14 }}>
        <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
          <Sparkles size={10} style={{ marginRight: 3 }} />
          Biblioteca
        </span>
        <h1
          className="font-sora"
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '-.02em',
            color: 'var(--text-primary)',
            marginTop: 8,
            marginBottom: 4,
          }}
        >
          Rutina IA
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Elige un cliente y describe el objetivo. La IA valida cada ejercicio contra el catálogo
          Supabase vía gym-gateway.
        </p>
      </section>

      <div className="fp-card" style={TOOLBAR_CARD_STYLE}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={() => setShowPrefs((v) => !v)}
            className="fp-btn fp-btn-secondary"
            style={{ gap: 6, fontSize: 12 }}
          >
            Preferencias
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
              {showPrefs ? 'Ocultar' : 'Mostrar'}
            </span>
          </button>
          <button
            type="button"
            className="fp-btn fp-btn-ghost sm:ml-auto"
            style={{ gap: 6, fontSize: 12, marginLeft: 'auto' }}
            onClick={resetChat}
          >
            <RefreshCw size={14} />
            Nuevo chat
          </button>
        </div>

        {showPrefs ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 10,
            }}
          >
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="fp-cal-label" htmlFor="ia-cliente">
                Cliente
              </label>
              <select
                id="ia-cliente"
                className="fp-input mt-2 w-full"
                value={prefs.clienteId ?? ''}
                onChange={(e) => {
                  const id = e.target.value ? Number(e.target.value) : null;
                  const user = id != null ? usuarios.find((u) => u.id === id) : undefined;
                  setPrefs((p) => ({
                    ...p,
                    clienteId: id,
                    edad: user?.edad ?? '',
                    nivel: user?.nivel?.toString() ?? p.nivel,
                  }));
                }}
              >
                <option value="">Sin cliente (solo prefs manuales)</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre}
                    {u.peso_kg ? ` · ${u.peso_kg} kg` : ''}
                  </option>
                ))}
              </select>
              {selectedCliente ? (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                  {selectedCliente.objetivo}
                  {selectedCliente.dias_entrenar
                    ? ` · ${selectedCliente.dias_entrenar} días/semana`
                    : ''}
                </p>
              ) : null}
            </div>
            <div>
              <label className="fp-cal-label" htmlFor="ia-edad">
                Edad
              </label>
              <input
                id="ia-edad"
                type="number"
                className="fp-input mt-2 w-full"
                min={10}
                max={100}
                placeholder={selectedCliente?.edad?.toString() ?? 'Opcional'}
                value={prefs.edad}
                onChange={(e) =>
                  setPrefs((p) => ({
                    ...p,
                    edad: e.target.value === '' ? '' : Number(e.target.value) || '',
                  }))
                }
              />
            </div>
            <div>
              <label className="fp-cal-label" htmlFor="ia-nivel">
                Nivel
              </label>
              <select
                id="ia-nivel"
                className="fp-input mt-2 w-full"
                value={prefs.nivel}
                onChange={(e) => setPrefs((p) => ({ ...p, nivel: e.target.value }))}
              >
                <option value="">Automático</option>
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
            <div>
              <label className="fp-cal-label" htmlFor="ia-duracion">
                Duración (min)
              </label>
              <input
                id="ia-duracion"
                type="number"
                className="fp-input mt-2 w-full"
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
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="fp-cal-label" htmlFor="ia-equipo">
                Equipamiento
              </label>
              <input
                id="ia-equipo"
                className="fp-input mt-2 w-full"
                placeholder="Opcional"
                value={prefs.equipamiento}
                onChange={(e) => setPrefs((p) => ({ ...p, equipamiento: e.target.value }))}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="fp-cal-label" htmlFor="ia-limitaciones">
                Limitaciones o lesiones
              </label>
              <input
                id="ia-limitaciones"
                className="fp-input mt-2 w-full"
                placeholder="Opcional"
                value={prefs.limitaciones}
                onChange={(e) => setPrefs((p) => ({ ...p, limitaciones: e.target.value }))}
              />
            </div>
          </div>
        ) : null}
      </div>

      <article
        className="fp-card relative overflow-hidden"
        style={{ padding: 16, marginBottom: 18, minHeight: 280 }}
      >
        <div className="fp-accent-bar" style={{ background: 'var(--accent-blue)' }} aria-hidden />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 3 }}>
          {messages.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Cuéntame el objetivo, días por semana y equipo disponible para proponer la rutina.
            </p>
          ) : null}

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
                  <p
                    style={{
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {msg.content}
                  </p>

                  {msg.draft ? (
                    <div style={{ marginTop: 12 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 8,
                          flexWrap: 'wrap',
                        }}
                      >
                        <p
                          className="font-sora"
                          style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}
                        >
                          {msg.draft.rutina.nombre}
                        </p>
                        <span className="badge badge-blue">{msg.draft.rutina.dificultad}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                        {msg.draft.rutina.descripcion}
                      </p>
                      <span
                        style={{
                          fontSize: 12,
                          color: 'var(--text-secondary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          marginBottom: 10,
                        }}
                      >
                        <CalendarDays size={12} />
                        {msg.draft.dias_entrenamiento.join(' · ')}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {msg.draft.exercises.map((ex, i) => (
                          <ExerciseRow
                            key={`${ex.nombre}-${i}`}
                            exercise={ex}
                            onPreview={setPreviewId}
                          />
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
            {activeDraft.exercises.length} con ExerciseDB
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
          {savedRoutineId !== null ? (() => {
            const saved = rutinas.find((r) => r.id === savedRoutineId);
            if (!saved) return null;
            return (
              <button
                type="button"
                className="fp-btn fp-btn-secondary w-full"
                style={{ justifyContent: 'center', gap: 7 }}
                onClick={() => navigate(routineEditPath(saved))}
              >
                <PencilLine size={14} />
                Editar rutina
              </button>
            );
          })() : null}
        </article>
      ) : null}

      <div className="fp-card sticky bottom-[72px] md:bottom-4 z-10" style={{ padding: 14 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
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
            aria-label="Mensaje para generar rutina"
          />
          <button
            type="button"
            className="fp-btn fp-btn-primary"
            style={{
              width: 44,
              height: 44,
              padding: 0,
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
        {input.trim().length > 0 && input.trim().length < 10 ? (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Escribe al menos 10 caracteres para generar.
          </p>
        ) : null}
      </div>

      <ExerciseDetailModal exerciseId={previewId} onClose={() => setPreviewId(null)} />
    </div>
  );
};
