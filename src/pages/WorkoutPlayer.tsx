import { useNavigate } from 'react-router-dom';
import { Play, Pause, SkipForward, SkipBack, CheckCircle, X, Trophy, Zap, Dumbbell } from 'lucide-react';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useUnits } from '../hooks/useUnits';

export const WorkoutPlayer = () => {
  const navigate = useNavigate();
  const { formatearValor } = useUnits();
  
  const { rutinaActual, ejercicioActualIndex, serieActual, isPaused, isActive, seriesCompletadas, getProgreso, completarSerie, siguienteEjercicio, ejercicioAnterior, togglePausa, terminarWorkout, reiniciar } = useWorkoutStore();

  if (!rutinaActual) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="relative overflow-hidden rounded-3xl p-8 text-center max-w-sm border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[var(--accent-green)]/20 to-[var(--accent-blue)]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-purple)]/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)] flex items-center justify-center shadow-2xl animate-pulse-glow">
              <Dumbbell className="w-12 h-12 text-black" />
            </div>
            <p className="text-lg mb-6 font-medium" style={{ color: 'var(--text-secondary)' }}>No hay entrenamiento activo</p>
            <button 
              onClick={() => navigate('/')} 
              className="px-8 py-4 rounded-2xl font-bold text-black transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))', boxShadow: '0 8px 30px var(--glow-green)' }}
            >
              Volver al Inicio
            </button>
          </div>
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
        <div className="relative overflow-hidden rounded-3xl p-8 text-center max-w-sm w-full border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[var(--accent-green)]/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-[var(--accent-blue)]/20 to-transparent rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)] flex items-center justify-center shadow-2xl animate-bounce-3d">
              <Trophy className="w-14 h-14 text-black" />
            </div>
            <h1 className="text-4xl font-bold mb-2 text-gradient">Completado!</h1>
            <p className="text-lg mb-8 font-medium" style={{ color: 'var(--text-secondary)' }}>{rutinaActual.nombre}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8 p-5 rounded-2xl glass-effect">
              <div className="text-center p-4 rounded-xl glass-effect">
                <p className="text-5xl font-black mb-1" style={{ color: 'var(--accent-green)' }}>{seriesCompletadas}</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Series</p>
              </div>
              <div className="text-center p-4 rounded-xl glass-effect">
                <p className="text-5xl font-black mb-1" style={{ color: 'var(--accent-blue)' }}>{rutinaActual.ejercicios.length}</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Ejercicios</p>
              </div>
            </div>
            
            <button 
              onClick={() => { reiniciar(); navigate('/'); }} 
              className="w-full py-4 rounded-2xl font-bold text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))', boxShadow: '0 8px 30px var(--glow-green)' }}
            >
              Finalizar y Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col" 
      style={{ 
        background: 'var(--bg-primary)',
        backgroundImage: 'radial-gradient(ellipse at 50% 0%, var(--glow-green) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, var(--glow-blue) 0%, transparent 50%)' 
      }}
    >
      <header className="p-4 flex justify-between items-center">
        <button 
          onClick={terminarWorkout} 
          className="w-12 h-12 rounded-2xl glass-effect flex items-center justify-center transition-all hover:scale-110"
          style={{ color: 'var(--text-secondary)' }}
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="px-6 py-3 rounded-2xl glass-effect text-center">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Progreso</p>
          <p className="text-2xl font-black text-gradient">{progreso}%</p>
        </div>
        
        <div className="w-12 h-12 rounded-2xl glass-effect flex items-center justify-center">
          <span className="text-sm font-bold" style={{ color: 'var(--accent-green)' }}>{ejercicioActualIndex + 1}/{rutinaActual.ejercicios.length}</span>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>
            Ejercicio <span className="font-bold" style={{ color: 'var(--accent-green)' }}>{ejercicioActualIndex + 1}</span> de {rutinaActual.ejercicios.length}
          </p>
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-10 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {ejercicio.nombre}
          </h1>
          
          <div className="relative inline-block rounded-3xl p-10 glass-effect">
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-blue)] rounded-3xl opacity-20 blur" />
            <div className="relative">
              <p className="text-8xl font-black animate-pulse-glow" style={{ color: 'var(--accent-green)', textShadow: '0 0 40px var(--glow-green)' }}>
                {serieActual}
                <span className="text-4xl" style={{ color: 'var(--text-muted)' }}> / {ejercicio.series}</span>
              </p>
              <p className="text-2xl mt-4 font-bold" style={{ color: 'var(--text-secondary)' }}>
                {formatearValor(ejercicio.valor, ejercicio.unidad_id)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="h-3 rounded-full overflow-hidden glass-effect">
            <div 
              className="h-full transition-all duration-500 rounded-full animate-pulse-glow-blue" 
              style={{ 
                width: `${progreso}%`, 
                background: 'linear-gradient(90deg, var(--accent-green), var(--accent-blue))',
                boxShadow: '0 0 20px var(--glow-green)'
              }} 
            />
          </div>
        </div>
      </div>
      
      <div className="p-6 pb-8">
        <div className="flex justify-center gap-5 mb-6">
          <button 
            onClick={ejercicioAnterior} 
            disabled={ejercicioActualIndex === 0} 
            className="w-16 h-16 rounded-2xl glass-effect flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30"
          >
            <SkipBack className="w-7 h-7" style={{ color: 'var(--text-primary)' }} />
          </button>
          
          <button 
            onClick={togglePausa} 
            className="w-24 h-24 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl"
            style={{ 
              background: isPaused ? 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))' : 'var(--bg-secondary)',
              boxShadow: isPaused ? '0 0 50px var(--glow-green)' : '0 8px 30px var(--shadow-color)',
              border: isPaused ? 'none' : '3px solid var(--border-color)'
            }}
          >
            {isPaused ? <Play className="w-10 h-10 text-black" /> : <Pause className="w-10 h-10" style={{ color: 'var(--text-primary)' }} />}
          </button>
          
          <button 
            onClick={siguienteEjercicio} 
            disabled={esUltimoEjercicio} 
            className="w-16 h-16 rounded-2xl glass-effect flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30"
          >
            <SkipForward className="w-7 h-7" style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>
        
        <button 
          onClick={completarSerie} 
          disabled={isPaused} 
          className="w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          style={{ 
            background: isPaused ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))', 
            color: isPaused ? 'var(--text-muted)' : 'black', 
            boxShadow: isPaused ? 'none' : '0 8px 30px var(--glow-green)' 
          }}
        >
          <CheckCircle className="w-7 h-7" />
          <span className="text-lg">Completar Serie {serieActual}/{ejercicio.series}</span>
        </button>
      </div>
    </div>
  );
};
