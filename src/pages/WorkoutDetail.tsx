import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Flame } from 'lucide-react';
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

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      
      <main className="pt-16 pb-24 px-4 max-w-md mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 transition-colors" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft className="w-5 h-5" /><span>Volver</span>
        </button>

        <div className="rounded-2xl p-6 border mb-6" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <span className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--accent-green)' }}>{rutina.categoria}</span>
          <h1 className="text-2xl font-bold mt-1 mb-2" style={{ color: 'var(--text-primary)' }}>{rutina.nombre}</h1>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{rutina.descripcion}</p>
          
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
              <Clock className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
              <span>{rutina.duracion_min} min</span>
            </div>
            <div className="flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
              <Flame className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
              <span>{rutina.ejercicios.length} ejercicios</span>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Ejercicios</h2>
        
        <div className="space-y-3 mb-6">
          {rutina.ejercicios.map((ej, idx) => (
            <div key={idx} className="rounded-xl p-4 border flex justify-between items-center" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>#{idx + 1}</span>
                <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{ej.nombre}</h3>
              </div>
              <div className="text-right">
                <span className="font-semibold" style={{ color: 'var(--accent-green)' }}>{ej.series} × {formatearValor(ej.valor, ej.unidad_id)}</span>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleIniciar} className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors" style={{ background: 'var(--accent-green)', color: '#000' }}>
          <Play className="w-5 h-5" />Iniciar Entrenamiento
        </button>
      </main>
    </div>
  );
};
