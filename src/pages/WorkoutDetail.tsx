import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Flame, Target, Zap, ChevronRight } from 'lucide-react';
import { useDataStore } from '../store/useDataStore';
import { useUnits } from '../hooks/useUnits';
import { Navbar } from '../components/layout/Navbar';
import { useWorkoutStore } from '../store/useWorkoutStore';

export const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatearValor } = useUnits();
  const iniciarWorkout = useWorkoutStore(s => s.iniciarWorkout);
  const rutinas = useDataStore(state => state.rutinas);

  const rutina = rutinas.find(r => r.id === Number(id));

  if (!rutina) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Rutina no encontrada</p>
      </div>
    );
  }

  const handleIniciar = () => {
    iniciarWorkout(rutina);
    navigate('/player');
  };

  const totalSeries = rutina.ejercicios.reduce((acc, e) => acc + e.series, 0);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      
      <main className="pt-16 pb-24 px-4 max-w-md mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 mb-6 transition-all hover:scale-105"
          style={{ color: 'var(--text-secondary)' }}
        >
          <div className="w-10 h-10 rounded-xl glass-effect flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span>Volver</span>
        </button>

        <div className="relative overflow-hidden rounded-3xl p-6 mb-8 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[var(--accent-green)]/20 to-[var(--accent-blue)]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-purple)]/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider" style={{ background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))', color: 'black' }}>
                {rutina.categoria}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold mb-3 tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {rutina.nombre}
            </h1>
            
            <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {rutina.descripcion}
            </p>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 rounded-2xl glass-effect text-center">
                <Clock className="w-6 h-6 mx-auto mb-1" style={{ color: 'var(--accent-blue)' }} />
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{rutina.duracion_min}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>minutos</p>
              </div>
              <div className="p-3 rounded-2xl glass-effect text-center">
                <Target className="w-6 h-6 mx-auto mb-1" style={{ color: 'var(--accent-green)' }} />
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{rutina.ejercicios.length}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ejercicios</p>
              </div>
              <div className="p-3 rounded-2xl glass-effect text-center">
                <Zap className="w-6 h-6 mx-auto mb-1" style={{ color: 'var(--accent-purple)' }} />
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalSeries}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>series</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 rounded-2xl glass-effect">
              <Flame className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{rutina.dificultad}</span>
              <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ background: 'var(--accent-green)', color: 'black' }}>
                {rutina.dificultad}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Target className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
            Ejercicios
          </h2>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full glass-effect" style={{ color: 'var(--text-muted)' }}>
            {rutina.ejercicios.length} total
          </span>
        </div>
        
        <div className="space-y-3 mb-8">
          {rutina.ejercicios.map((ej, idx) => (
            <div 
              key={idx} 
              className="group relative overflow-hidden rounded-2xl p-4 border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `linear-gradient(135deg, rgba(0,255,136,0.05) 0%, transparent 100%)` }} />
              
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-green)]/20 to-[var(--accent-blue)]/20 flex items-center justify-center">
                  <span className="text-lg font-bold" style={{ color: 'var(--accent-green)' }}>{idx + 1}</span>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold transition-all group-hover:translate-x-1" style={{ color: 'var(--text-primary)' }}>
                    {ej.nombre}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {ej.series} series × {formatearValor(ej.valor, ej.unidad_id)}
                  </p>
                </div>
                
                <div className="w-14 h-10 rounded-xl bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-blue)] flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-black">{ej.series}×</span>
                </div>
                
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-20">
          <button 
            onClick={handleIniciar} 
            className="w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))', boxShadow: '0 8px 30px var(--glow-green)', color: 'black' }}
          >
            <Play className="w-6 h-6" />
            <span className="text-lg">Iniciar Entrenamiento</span>
          </button>
        </div>
      </main>
    </div>
  );
};
