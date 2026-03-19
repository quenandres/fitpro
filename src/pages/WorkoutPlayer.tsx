import { useNavigate } from 'react-router-dom';
import { Play, Pause, SkipForward, SkipBack, CheckCircle, X, Trophy, Dumbbell } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useUnits } from '../hooks/useUnits';

export const WorkoutPlayer = () => {
  const navigate = useNavigate();
  const { formatearValor } = useUnits();
  const {
    rutinaActual, ejercicioActualIndex, serieActual, isPaused, isActive,
    seriesCompletadas, getProgreso, completarSerie, siguienteEjercicio,
    ejercicioAnterior, togglePausa, terminarWorkout, reiniciar,
  } = useWorkoutStore();

  /* ── Sin rutina ───────────────────────────────────── */
  if (!rutinaActual) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--bg-app)' }}>
        <div className="fp-card text-center" style={{ maxWidth: 360, width: '100%', padding: 32, borderRadius: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--brand-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Dumbbell size={28} color="var(--brand)" />
          </div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 20 }}>No hay entrenamiento activo</p>
          <button className="fp-btn fp-btn-primary" style={{ width: '100%', padding: '12px' }} onClick={() => navigate('/')}>
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  const ejercicio       = rutinaActual.ejercicios[ejercicioActualIndex];
  const progreso        = getProgreso();
  const esUltimo        = ejercicioActualIndex === rutinaActual.ejercicios.length - 1;

  /* ── Completado ───────────────────────────────────── */
  if (!isActive && seriesCompletadas > 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'var(--bg-app)' }}>
        <div className="fp-card animate-scale-in text-center" style={{ maxWidth: 360, width: '100%', padding: 32, borderRadius: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--brand-dim)', border: '2px solid rgba(34,197,94,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Trophy size={32} color="var(--brand)" />
          </div>
          <h1 className="font-sora text-gradient" style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
            ¡Completado!
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
            {rutinaActual.nombre}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {[
              { val: seriesCompletadas,           lbl: 'Series',     accent: 'var(--brand)'        },
              { val: rutinaActual.ejercicios.length, lbl: 'Ejercicios', accent: 'var(--accent-blue)' },
            ].map(({ val, lbl, accent }) => (
              <div key={lbl} style={{ padding: '14px 10px', borderRadius: 13, background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <p className="font-sora" style={{ fontSize: 32, fontWeight: 700, color: accent, lineHeight: 1, marginBottom: 4 }}>{val}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lbl}</p>
              </div>
            ))}
          </div>

          <button
            className="fp-btn fp-btn-primary"
            style={{ width: '100%', padding: '13px' }}
            onClick={() => { reiniciar(); navigate('/'); }}
          >
            Finalizar y Volver
          </button>
        </div>
      </div>
    );
  }

  /* ── Player activo ────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>

      {/* Top bar */}
      <header style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          className="fp-btn fp-btn-ghost"
          style={{ width: 40, height: 40, padding: 0, borderRadius: 11, background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}
          onClick={terminarWorkout}
        >
          <X size={16} color="var(--text-secondary)" />
        </button>

        <div style={{ padding: '6px 16px', borderRadius: 11, background: 'var(--bg-elevated)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Progreso</p>
          <p className="font-sora text-gradient" style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>{progreso}%</p>
        </div>

        <div style={{ padding: '6px 14px', borderRadius: 11, background: 'var(--bg-elevated)', border: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Ejercicio</p>
          <p className="font-sora" style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand)', lineHeight: 1 }}>
            {ejercicioActualIndex + 1}/{rutinaActual.ejercicios.length}
          </p>
        </div>
      </header>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px' }}>
        {/* Exercise name */}
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.07em', textAlign: 'center', marginBottom: 8 }}>
          Ejercicio actual
        </p>
        <h1
          className="font-sora"
          style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.2, marginBottom: 32 }}
        >
          {ejercicio.nombre}
        </h1>

        {/* Serie counter */}
        <div
          className="fp-card"
          style={{ padding: '28px 20px', borderRadius: 20, textAlign: 'center', marginBottom: 24, borderColor: 'rgba(34,197,94,.2)' }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Serie</p>
          <p className="font-sora" style={{ fontSize: 72, fontWeight: 800, lineHeight: 1, marginBottom: 4 }}>
            <span className="text-gradient">{serieActual}</span>
            <span style={{ fontSize: 32, color: 'var(--text-muted)', fontWeight: 600 }}> / {ejercicio.series}</span>
          </p>
          <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)' }}>
            {formatearValor(ejercicio.valor, ejercicio.unidad_id)}
          </p>
        </div>

        {/* Progress bar */}
        <div className="fp-progress-track" style={{ marginBottom: 8 }}>
          <div className="fp-progress-fill" style={{ width: `${progreso}%` }} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', marginBottom: 32 }}>
          {seriesCompletadas} series completadas
        </p>
      </div>

      {/* Controls */}
      <div style={{ padding: '0 20px 32px' }}>
        {/* Skip controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 14 }}>
          <button
            className="fp-btn fp-btn-secondary"
            style={{ width: 56, height: 56, padding: 0, borderRadius: 14 }}
            onClick={ejercicioAnterior}
            disabled={ejercicioActualIndex === 0}
          >
            <SkipBack size={20} />
          </button>

          {/* Pause / play */}
          <button
            onClick={togglePausa}
            style={{
              width: 80, height: 80, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: isPaused ? 'var(--brand)' : 'var(--bg-overlay)',
              color: isPaused ? '#fff' : 'var(--text-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: isPaused ? 'none' : '1px solid var(--border)',
              boxShadow: isPaused ? 'var(--shadow-brand)' : 'var(--shadow-sm)',
              transition: 'all .2s',
            }}
          >
            {isPaused ? <Play size={28} /> : <Pause size={28} />}
          </button>

          <button
            className="fp-btn fp-btn-secondary"
            style={{ width: 56, height: 56, padding: 0, borderRadius: 14 }}
            onClick={siguienteEjercicio}
            disabled={esUltimo}
          >
            <SkipForward size={20} />
          </button>
        </div>

        {/* Complete serie button */}
        <button
          className="fp-btn fp-btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: 14, borderRadius: 14, gap: 8, opacity: isPaused ? 0.5 : 1 }}
          onClick={completarSerie}
          disabled={isPaused}
        >
          <CheckCircle size={18} />
          Completar Serie {serieActual}/{ejercicio.series}
        </button>
      </div>
    </div>
  );
};
