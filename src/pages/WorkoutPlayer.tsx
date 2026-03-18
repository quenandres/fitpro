import { useNavigate } from 'react-router-dom';
import { Play, Pause, SkipForward, SkipBack, CheckCircle, X, Trophy, Zap } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useUnits } from '../hooks/useUnits';

export const WorkoutPlayer = () => {
  const navigate = useNavigate();
  const { formatearValor } = useUnits();
  
  const { rutinaActual, ejercicioActualIndex, serieActual, isPaused, isActive, seriesCompletadas, getProgreso, completarSerie, siguienteEjercicio, ejercicioAnterior, togglePausa, terminarWorkout, reiniciar } = useWorkoutStore();

  if (!rutinaActual) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="neumorphic p-8 rounded-3xl text-center max-w-sm" style={{ background: 'var(--bg-secondary)' }}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center animate-pulse-glow" style={{ background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))' }}>
            <Zap className="w-10 h-10 text-white" />
          </div>
          <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>No hay entrenamiento activo</p>
          <button onClick={() => navigate('/')} className="btn-3d px-8 py-3 rounded-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))', boxShadow: '0 4px 20px var(--glow-green)' }}>Volver al Inicio</button>
        </div>
      </div>
    );
  }

  const ejercicio = rutinaActual.ejercicios[ejercicioActualIndex];
  const progreso = getProgreso();
  const esUltimoEjercicio = ejercicioActualIndex === rutinaActual.ejercicios.length - 1;

  if (!isActive && seriesCompletadas > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="neumorphic p-8 rounded-3xl text-center max-w-sm w-full" style={{ background: 'var(--bg-secondary)' }}>
          <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center animate-bounce-3d" style={{ background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))', boxShadow: '0 0 40px var(--glow-green)' }}>
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gradient">Completado!</h1>
          <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>{rutinaActual.nombre}</p>
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-2xl" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="text-center"><p className="text-4xl font-bold" style={{ color: 'var(--accent-green)' }}>{seriesCompletadas}</p><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Series</p></div>
            <div className="text-center"><p className="text-4xl font-bold" style={{ color: 'var(--accent-blue)' }}>{rutinaActual.ejercicios.length}</p><p className="text-sm" style={{ color: 'var(--text-muted)' }}>Ejercicios</p></div>
          </div>
          <button onClick={() => { reiniciar(); navigate('/'); }} className="btn-3d w-full py-4 rounded-xl font-bold text-white" style={{ background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))', boxShadow: '0 4px 20px var(--glow-green)' }}>Finalizar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)', backgroundImage: 'radial-gradient(ellipse at 50% 0%, var(--glow-green) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, var(--glow-blue) 0%, transparent 50%)' }}>
      <header className="p-4 flex justify-between items-center">
        <button onClick={terminarWorkout} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}><X className="w-6 h-6" /></button>
        <div className="px-4 py-2 rounded-full" style={{ background: 'var(--bg-secondary)', boxShadow: '0 0 20px var(--glow-green)' }}><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Progreso</p><p className="text-lg font-bold text-gradient">{progreso}%</p></div>
        <div className="w-10" />
      </header>
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="mb-2"><p style={{ color: 'var(--text-secondary)' }}>Ejercicio <span className="font-bold" style={{ color: 'var(--accent-blue)' }}>{ejercicioActualIndex + 1}</span> de {rutinaActual.ejercicios.length}</p></div>
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>{ejercicio.nombre}</h1>
          <div className="inline-block rounded-3xl p-8 neumorphic" style={{ background: 'var(--bg-secondary)' }}>
            <p className="text-7xl font-black animate-pulse-glow" style={{ color: 'var(--accent-green)', textShadow: '0 0 40px var(--glow-green)' }}>{serieActual}<span className="text-3xl" style={{ color: 'var(--text-muted)' }}> / {ejercicio.series}</span></p>
            <p className="text-xl mt-3 font-medium" style={{ color: 'var(--text-secondary)' }}>{formatearValor(ejercicio.valor, ejercicio.unidad_id)}</p>
          </div>
        </div>
        <div className="mb-8"><div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}><div className="h-full transition-all duration-500 rounded-full animate-pulse-glow-blue" style={{ width: `${progreso}%`, background: 'linear-gradient(90deg, var(--accent-green), var(--accent-blue))', boxShadow: '0 0 20px var(--glow-green)' }} /></div></div>
      </div>
      <div className="p-6 pb-8">
        <div className="flex justify-center gap-4 mb-6">
          <button onClick={ejercicioAnterior} disabled={ejercicioActualIndex === 0} className="w-14 h-14 rounded-2xl flex items-center justify-center disabled:opacity-30" style={{ background: 'var(--bg-secondary)', boxShadow: '0 4px 20px var(--shadow-color)' }}><SkipBack className="w-6 h-6" style={{ color: 'var(--text-primary)' }} /></button>
          <button onClick={togglePausa} className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: isPaused ? 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))' : 'var(--bg-secondary)', boxShadow: isPaused ? '0 0 40px var(--glow-green)' : '0 4px 20px var(--shadow-color)', border: isPaused ? 'none' : '2px solid var(--border-color)' }}>{isPaused ? <Play className="w-8 h-8 text-white" /> : <Pause className="w-8 h-8" style={{ color: 'var(--text-primary)' }} />}</button>
          <button onClick={siguienteEjercicio} disabled={esUltimoEjercicio} className="w-14 h-14 rounded-2xl flex items-center justify-center disabled:opacity-30" style={{ background: 'var(--bg-secondary)', boxShadow: '0 4px 20px var(--shadow-color)' }}><SkipForward className="w-6 h-6" style={{ color: 'var(--text-primary)' }} /></button>
        </div>
        <button onClick={completarSerie} disabled={isPaused} className="btn-3d w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 disabled:opacity-50" style={{ background: isPaused ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))', color: isPaused ? 'var(--text-muted)' : 'white', boxShadow: isPaused ? 'none' : '0 8px 30px var(--glow-green)' }}><CheckCircle className="w-6 h-6" />Completar Serie {serieActual}/{ejercicio.series}</button>
      </div>
    </div>
  );
};
