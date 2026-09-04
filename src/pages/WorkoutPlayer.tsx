import { useNavigate } from 'react-router-dom';
import { Play, Pause, SkipForward, SkipBack, CheckCircle, X, Trophy, Dumbbell } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useUnits } from '../hooks/useUnits';
import { AppShell } from '../components/layout/AppShell';

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
      <AppShell hideBottomNav width="narrow">
        <div className="flex items-center justify-center min-h-[55dvh] py-8">
          <div className="fp-card text-center w-full" style={{ padding: 32, borderRadius: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--brand-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Dumbbell size={28} color="var(--brand)" />
            </div>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 20 }}>No hay entrenamiento activo</p>
            <button className="fp-btn fp-btn-primary w-full py-3" onClick={() => navigate('/')}>
              Volver al Inicio
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  const ejercicio = rutinaActual.ejercicios[ejercicioActualIndex];
  const progreso = getProgreso();
  const esUltimo = ejercicioActualIndex === rutinaActual.ejercicios.length - 1;

  /* ── Completado ───────────────────────────────────── */
  if (!isActive && seriesCompletadas > 0) {
    return (
      <AppShell hideBottomNav width="narrow">
        <div className="flex items-center justify-center min-h-[55dvh] py-8">
          <div className="fp-card animate-scale-in text-center w-full" style={{ padding: 32, borderRadius: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--brand-dim)', border: '2px solid rgba(34,197,94,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trophy size={32} color="var(--brand)" />
            </div>
            <h1 className="font-sora text-gradient text-[28px] font-bold mb-1">
              ¡Completado!
            </h1>
            <p className="text-sm text-secondary mb-6">{rutinaActual.nombre}</p>

            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {[
                { val: seriesCompletadas, lbl: 'Series', accent: 'var(--brand)' },
                { val: rutinaActual.ejercicios.length, lbl: 'Ejercicios', accent: 'var(--accent-blue)' },
              ].map(({ val, lbl, accent }) => (
                <div key={lbl} className="p-3.5 rounded-[13px] bg-overlay border border-line text-center">
                  <p className="font-sora text-[32px] font-bold leading-none mb-1" style={{ color: accent }}>{val}</p>
                  <p className="text-[11px] text-muted">{lbl}</p>
                </div>
              ))}
            </div>

            <button
              className="fp-btn fp-btn-primary w-full py-3"
              onClick={() => { reiniciar(); navigate('/'); }}
            >
              Finalizar y Volver
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  /* ── Player activo ────────────────────────────────── */
  return (
    <AppShell hideBottomNav width="narrow">
      <div className="flex flex-col min-h-[calc(100dvh-130px)]">

        {/* Top bar */}
        <header className="flex items-center justify-between py-3.5 px-1">
          <button
            type="button"
            className="fp-btn fp-btn-ghost w-10 h-10 p-0 rounded-[11px] bg-overlay border border-line"
            onClick={terminarWorkout}
            aria-label="Cerrar entrenamiento"
          >
            <X size={16} color="var(--text-secondary)" />
          </button>

          <div className="px-4 py-1.5 rounded-[11px] bg-elevated border border-line text-center">
            <p className="text-[9px] font-semibold text-muted uppercase tracking-wider mb-0.5">Progreso</p>
            <p className="font-sora text-gradient text-lg font-bold leading-none">{progreso}%</p>
          </div>

          <div className="px-3.5 py-1.5 rounded-[11px] bg-elevated border border-line text-center">
            <p className="text-[9px] font-semibold text-muted uppercase tracking-wider mb-0.5">Ejercicio</p>
            <p className="font-sora text-sm font-bold text-brand leading-none">
              {ejercicioActualIndex + 1}/{rutinaActual.ejercicios.length}
            </p>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center px-2 sm:px-6">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider text-center mb-2">
            Ejercicio actual
          </p>
          <h1 className="font-sora text-2xl sm:text-[28px] font-bold tracking-tight text-primary break-words text-center leading-tight mb-8">
            {ejercicio.nombre}
          </h1>

          <div
            className="fp-card text-center mb-6 rounded-[20px] py-7 px-5"
            style={{ borderColor: 'rgba(34,197,94,.2)' }}
          >
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Serie</p>
            <p className="font-sora text-6xl sm:text-7xl font-extrabold leading-none mb-1">
              <span className="text-gradient">{serieActual}</span>
              <span className="text-2xl sm:text-[32px] text-muted font-semibold"> / {ejercicio.series}</span>
            </p>
            <p className="text-lg font-semibold text-secondary">
              {formatearValor(ejercicio.valor, ejercicio.unidad_id)}
            </p>
          </div>

          <div className="fp-progress-track mb-2">
            <div className="fp-progress-fill" style={{ width: `${progreso}%` }} />
          </div>
          <p className="text-[11px] text-muted text-right mb-8">
            {seriesCompletadas} series completadas
          </p>
        </div>

        {/* Controls */}
        <div className="px-1 sm:px-5 pb-2">
          <div className="flex justify-center gap-4 mb-3.5">
            <button
              type="button"
              className="fp-btn fp-btn-secondary w-14 h-14 p-0 rounded-[14px]"
              onClick={ejercicioAnterior}
              disabled={ejercicioActualIndex === 0}
              aria-label="Ejercicio anterior"
            >
              <SkipBack size={20} />
            </button>

            <button
              type="button"
              onClick={togglePausa}
              className="fp-btn flex items-center justify-center w-20 h-20 rounded-full p-0"
              style={{
                background: isPaused ? 'var(--brand)' : 'var(--bg-overlay)',
                color: isPaused ? '#fff' : 'var(--text-primary)',
                border: isPaused ? 'none' : '1px solid var(--border)',
                boxShadow: isPaused ? 'var(--shadow-brand)' : 'var(--shadow-sm)',
              }}
              aria-label={isPaused ? 'Reanudar entrenamiento' : 'Pausar entrenamiento'}
            >
              {isPaused ? <Play size={28} /> : <Pause size={28} />}
            </button>

            <button
              type="button"
              className="fp-btn fp-btn-secondary w-14 h-14 p-0 rounded-[14px]"
              onClick={siguienteEjercicio}
              disabled={esUltimo}
              aria-label="Siguiente ejercicio"
            >
              <SkipForward size={20} />
            </button>
          </div>

          <button
            className="fp-btn fp-btn-primary w-full py-3.5 text-sm rounded-[14px] gap-2"
            style={{ opacity: isPaused ? 0.5 : 1 }}
            onClick={completarSerie}
            disabled={isPaused}
          >
            <CheckCircle size={18} />
            Completar Serie {serieActual}/{ejercicio.series}
          </button>
        </div>
      </div>
    </AppShell>
  );
};
