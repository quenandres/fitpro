import { useMemo, useState } from 'react';
import { Sparkles, LoaderCircle, CalendarDays, Save, PencilLine, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Navbar, BottomNav } from '../components/layout/Navbar';
import { useDataStore } from '../store/useDataStore';
import type { GenerateRoutineApiResponse, GenerateRoutineRequest } from '../types';
import { validateGenerateRoutineInput } from '../utils/validators';
import { generateRoutineWithAI } from '../lib/ai/deepseek';
import { sanitizeTrainingDays } from '../utils/aiRoutineAdapter';

const defaultForm: GenerateRoutineRequest = {
  objetivo: '',
  nivel: '',
  duracion_min: 45,
  equipamiento: '',
  limitaciones: '',
};

export const AIRoutinePage = () => {
  const navigate = useNavigate();
  const { addRutina, rutinas } = useDataStore();
  const [form, setForm] = useState<GenerateRoutineRequest>(defaultForm);
  const [result, setResult] = useState<GenerateRoutineApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedRoutineId, setSavedRoutineId] = useState<number | null>(null);

  const errors = useMemo(() => validateGenerateRoutineInput(form), [form]);
  const objectiveError = errors.find((item) => item.field === 'objetivo')?.message;

  const handleGenerate = async () => {
    const validation = validateGenerateRoutineInput(form);
    if (validation.length > 0) {
      setError(validation[0].message);
      return;
    }

    setLoading(true);
    setError(null);
    setSavedRoutineId(null);
    try {
      const generated = await generateRoutineWithAI(form);
      setResult({
        ...generated,
        dias_entrenamiento: sanitizeTrainingDays(generated.dias_entrenamiento),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar la rutina');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoutine = () => {
    if (!result) return;
    const nextId = Math.max(0, ...rutinas.map((routine) => routine.id)) + 1;
    addRutina(result.rutina);
    setSavedRoutineId(nextId);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      <Navbar />
      <BottomNav />

      <main className="max-w-md mx-auto" style={{ paddingTop: 70, paddingBottom: 88, paddingLeft: 16, paddingRight: 16 }}>
        <section className="animate-slide-up" style={{ paddingTop: 20, paddingBottom: 14 }}>
          <span className="badge badge-brand" style={{ fontSize: 11, padding: '3px 10px' }}>
            <Sparkles size={11} style={{ marginRight: 4 }} />
            Generador IA
          </span>
          <h1 className="font-sora" style={{ marginTop: 10, fontSize: 28, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Rutina desde tu objetivo
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
            Describe tu meta y FitPro creara una rutina con ejercicios existentes y dias de entrenamiento sugeridos.
          </p>
        </section>

        <section className="fp-card animate-slide-up delay-100" style={{ borderRadius: 14, padding: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              Objetivo
            </label>
            <textarea
              className="fp-input"
              rows={5}
              value={form.objetivo}
              placeholder="Ejemplo: quiero ganar masa muscular en tren inferior, entrenar 4 dias, sesiones de 45 min y cuidar rodillas."
              onChange={(event) => setForm((prev) => ({ ...prev, objetivo: event.target.value }))}
              style={{
                resize: 'vertical',
                minHeight: 110,
                borderColor: objectiveError ? 'var(--accent-red)' : undefined,
              }}
            />
            {objectiveError && (
              <p style={{ fontSize: 11, color: 'var(--accent-red)' }}>{objectiveError}</p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Nivel
                </label>
                <select
                  className="fp-input"
                  value={form.nivel}
                  onChange={(event) => setForm((prev) => ({ ...prev, nivel: event.target.value }))}
                >
                  <option value="">Automatico</option>
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block' }}>
                  Duracion por sesion
                </label>
                <input
                  type="number"
                  className="fp-input"
                  value={form.duracion_min ?? 45}
                  min={5}
                  max={120}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, duracion_min: Number(event.target.value) || 45 }))
                  }
                />
              </div>
            </div>

            <input
              className="fp-input"
              value={form.equipamiento}
              placeholder="Equipamiento disponible (opcional)"
              onChange={(event) => setForm((prev) => ({ ...prev, equipamiento: event.target.value }))}
            />
            <input
              className="fp-input"
              value={form.limitaciones}
              placeholder="Limitaciones o lesiones (opcional)"
              onChange={(event) => setForm((prev) => ({ ...prev, limitaciones: event.target.value }))}
            />

            <button className="fp-btn fp-btn-primary" style={{ width: '100%', justifyContent: 'center', gap: 8 }} onClick={handleGenerate} disabled={loading}>
              {loading ? <LoaderCircle size={15} className="animate-spin" /> : <Bot size={15} />}
              {loading ? 'Generando rutina...' : 'Generar rutina con IA'}
            </button>
          </div>
        </section>

        {error && (
          <div className="fp-card animate-slide-up" style={{ marginTop: 12, borderRadius: 12, padding: 12, borderColor: 'rgba(248,81,73,.45)' }}>
            <p style={{ fontSize: 12, color: 'var(--accent-red)' }}>{error}</p>
          </div>
        )}

        {result && (
          <section className="fp-card animate-slide-up delay-150" style={{ marginTop: 14, borderRadius: 14, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <h2 className="font-sora" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                {result.rutina.nombre}
              </h2>
              <span className="badge badge-brand">{result.rutina.dificultad}</span>
            </div>
            <p style={{ marginTop: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
              {result.rutina.descripcion}
            </p>

            <div style={{ marginTop: 12, padding: 10, borderRadius: 10, background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}>
              <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>
                <CalendarDays size={12} style={{ marginRight: 4, display: 'inline' }} />
                Dias de entrenamiento sugeridos
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.dias_entrenamiento.map((day) => (
                  <span key={day} className="badge badge-brand">{day}</span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {result.rutina.ejercicios.map((exercise, index) => (
                <div key={`${exercise.nombre}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 10px', borderRadius: 10, background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{exercise.nombre}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{exercise.series} x {exercise.valor}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              <button className="fp-btn fp-btn-primary" style={{ width: '100%', justifyContent: 'center', gap: 7 }} onClick={handleSaveRoutine}>
                <Save size={14} />
                Guardar rutina
              </button>
              {savedRoutineId && (
                <button
                  className="fp-btn fp-btn-secondary"
                  style={{ width: '100%', justifyContent: 'center', gap: 7 }}
                  onClick={() => navigate(`/admin/rutina?id=${savedRoutineId}`)}
                >
                  <PencilLine size={14} />
                  Editar manualmente
                </button>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
