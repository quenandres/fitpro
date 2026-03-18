import { ChevronRight, Award, TrendingUp, Target } from 'lucide-react';
import type { Ejercicio } from '../../types';

interface Props {
  ejercicio: Ejercicio;
  onClick: () => void;
}

const getDifficultyStyle = (dificultad: string) => {
  const d = dificultad.toLowerCase();
  if (d.includes('avanzado')) return { 
    bg: 'from-red-500/15 to-orange-500/10', 
    text: 'text-red-400', 
    border: 'border-red-500/40',
    badge: 'bg-gradient-to-r from-red-500 to-orange-500',
    level: 3
  };
  if (d.includes('intermedio')) return { 
    bg: 'from-yellow-500/15 to-amber-500/10', 
    text: 'text-yellow-400', 
    border: 'border-yellow-500/40',
    badge: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    level: 2
  };
  return { 
    bg: 'from-green-500/15 to-emerald-500/10', 
    text: 'text-green-400', 
    border: 'border-green-500/40',
    badge: 'bg-gradient-to-r from-green-500 to-emerald-500',
    level: 1
  };
};

const getCategoryStyle = (categoria: string) => {
  const c = categoria.toLowerCase();
  if (c.includes('fuerza')) return { gradient: 'from-orange-500 via-red-500 to-red-600', shadow: 'rgba(249, 115, 22, 0.5)', icon: '💪' };
  if (c.includes('cardio')) return { gradient: 'from-red-500 via-pink-500 to-rose-600', shadow: 'rgba(244, 63, 94, 0.5)', icon: '🔥' };
  if (c.includes('funcional')) return { gradient: 'from-yellow-400 via-amber-500 to-orange-500', shadow: 'rgba(245, 158, 11, 0.5)', icon: '⚡' };
  if (c.includes('core')) return { gradient: 'from-purple-500 via-pink-500 to-fuchsia-600', shadow: 'rgba(168, 85, 247, 0.5)', icon: '🎯' };
  return { gradient: 'from-emerald-400 via-cyan-500 to-blue-500', shadow: 'rgba(16, 185, 129, 0.5)', icon: '🏋️' };
};

const muscleColors = [
  'from-emerald-400 to-green-500',
  'from-cyan-400 to-blue-500',
  'from-purple-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-red-500',
];

export const ExerciseCard = ({ ejercicio, onClick }: Props) => {
  const diffStyle = getDifficultyStyle(ejercicio.dificultad);
  const catStyle = getCategoryStyle(ejercicio.categoria);

  return (
    <div 
      onClick={onClick} 
      className="group relative overflow-hidden rounded-3xl border transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: '0 4px 24px var(--shadow-color)' }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(0, 212, 255, 0.08) 100%)` }} />
      
      <div className="relative">
        <div className={`h-1.5 w-full bg-gradient-to-r ${catStyle.gradient}`} />
        
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div 
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${catStyle.gradient} flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-transform duration-300`} 
                  style={{ boxShadow: `0 8px 24px ${catStyle.shadow}` }}
                >
                  {catStyle.icon}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] flex items-center justify-center">
                  <Award className="w-3 h-3" style={{ color: diffStyle.text }} />
                </div>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-blue)' }}>
                  {ejercicio.categoria}
                </span>
                <h3 className="text-lg font-bold mt-0.5 transition-all duration-300 group-hover:translate-x-1" style={{ color: 'var(--text-primary)' }}>
                  {ejercicio.nombre}
                </h3>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white ${diffStyle.badge} shadow-lg`}>
                {ejercicio.dificultad}
              </div>
              <div className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1.5 h-1.5 rounded-full transition-all"
                    style={{ 
                      background: i < diffStyle.level 
                        ? (diffStyle.text.includes('red') ? '#ef4444' : diffStyle.text.includes('yellow') ? '#eab308' : '#22c55e')
                        : 'var(--bg-tertiary)'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className={`p-4 rounded-2xl mb-4 border ${diffStyle.bg} ${diffStyle.border}`}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                    <Target className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{ejercicio.grupo_muscular.length}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>músculos</p>
                  </div>
                </div>
                <div className="w-px h-10" style={{ background: 'var(--border-color)' }} />
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{ejercicio.equipamiento.length}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>equipos</p>
                  </div>
                </div>
              </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {ejercicio.grupo_muscular.slice(0, 4).map((muscle, idx) => (
              <span 
                key={muscle}
                className="text-xs px-3 py-1.5 rounded-xl font-semibold bg-gradient-to-r text-white"
                style={{ backgroundImage: `linear-gradient(to right, ${muscleColors[idx % muscleColors.length].split(' ')[0]}, ${muscleColors[idx % muscleColors.length].split(' ')[1]})` }}
              >
                {muscle}
              </span>
            ))}
            {ejercicio.grupo_muscular.length > 4 && (
              <span className="text-xs px-3 py-1.5 rounded-xl font-semibold" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                +{ejercicio.grupo_muscular.length - 4}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {ejercicio.equipamiento.slice(0, 2).map(eq => (
                <span key={eq} className="text-xs px-2 py-1 rounded-lg font-medium glass-effect" style={{ color: 'var(--text-secondary)' }}>
                  {eq}
                </span>
              ))}
              {ejercicio.equipamiento.length > 2 && (
                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  +{ejercicio.equipamiento.length - 2}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Detalles</span>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-green)]/20 to-[var(--accent-blue)]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ChevronRight className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
