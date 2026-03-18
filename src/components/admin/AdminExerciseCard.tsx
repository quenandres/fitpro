import { Pencil, Trash2, Video, Target, TrendingUp } from 'lucide-react';
import type { Ejercicio } from '../../types';

interface Props {
  ejercicio: Ejercicio;
  onEdit: (ejercicio: Ejercicio) => void;
  onDelete: (id: number) => void;
}

const getDifficultyStyle = (dificultad: string) => {
  const d = dificultad.toLowerCase();
  if (d.includes('avanzado')) return { 
    bg: 'from-red-500/15 to-orange-500/10', 
    text: 'text-red-400', 
    badge: 'bg-gradient-to-r from-red-500 to-orange-500',
    level: 3
  };
  if (d.includes('intermedio')) return { 
    bg: 'from-yellow-500/15 to-amber-500/10', 
    text: 'text-yellow-400', 
    badge: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    level: 2
  };
  return { 
    bg: 'from-green-500/15 to-emerald-500/10', 
    text: 'text-green-400', 
    badge: 'bg-gradient-to-r from-green-500 to-emerald-500',
    level: 1
  };
};

const getCategoryGradient = (categoria: string) => {
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

export const AdminExerciseCard = ({ ejercicio, onEdit, onDelete }: Props) => {
  const diffStyle = getDifficultyStyle(ejercicio.dificultad);
  const catStyle = getCategoryGradient(ejercicio.categoria);

  return (
    <div className="group relative overflow-hidden rounded-3xl border transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: '0 4px 24px var(--shadow-color)' }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(0, 212, 255, 0.08) 100%)' }} />
      
      <div className="relative">
        <div className={`h-1.5 w-full bg-gradient-to-r ${catStyle.gradient}`} />
        
        <div className="p-5">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative flex-shrink-0">
              <div 
                className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${catStyle.gradient} flex items-center justify-center text-3xl shadow-xl overflow-hidden`}
                style={{ boxShadow: `0 8px 24px ${catStyle.shadow}` }}
              >
                {ejercicio.imagen ? (
                  <img src={ejercicio.imagen} alt={ejercicio.nombre} className="w-full h-full object-cover" />
                ) : (
                  <span>{catStyle.icon}</span>
                )}
              </div>
              {ejercicio.videos && ejercicio.videos.length > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Video className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-blue)' }}>
                  {ejercicio.categoria}
                </span>
                <div className={`px-2 py-0.5 rounded text-xs font-bold text-white ${diffStyle.badge}`}>
                  {ejercicio.dificultad}
                </div>
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                {ejercicio.nombre}
              </h3>
              <div className="flex items-center gap-1">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
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
          
          <div className={`p-4 rounded-2xl mb-4 border ${diffStyle.bg}`} style={{ borderColor: 'var(--border-color)' }}>
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
            {ejercicio.grupo_muscular.slice(0, 3).map((muscle, idx) => (
              <span 
                key={muscle}
                className="text-xs px-3 py-1.5 rounded-xl font-semibold bg-gradient-to-r text-white"
                style={{ backgroundImage: `linear-gradient(to right, ${muscleColors[idx % muscleColors.length].split(' ')[0]}, ${muscleColors[idx % muscleColors.length].split(' ')[1]})` }}
              >
                {muscle}
              </span>
            ))}
            {ejercicio.grupo_muscular.length > 3 && (
              <span className="text-xs px-3 py-1.5 rounded-xl font-semibold" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                +{ejercicio.grupo_muscular.length - 3}
              </span>
            )}
          </div>
          
          {ejercicio.descripcion && (
            <p className="text-sm mb-4 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {ejercicio.descripcion}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {ejercicio.equipamiento.slice(0, 2).map(eq => (
                <span key={eq} className="text-xs px-2 py-1 rounded-lg font-medium" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
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
              <button
                onClick={() => onEdit(ejercicio)}
                className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-blue-500/20 transition-all"
                title="Editar"
              >
                <Pencil className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
              </button>
              <button
                onClick={() => onDelete(ejercicio.id)}
                className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-red-500/20 transition-all"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
