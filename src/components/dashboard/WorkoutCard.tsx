import { Clock, Flame, ChevronRight, Zap, Target, Dumbbell } from 'lucide-react';
import type { Rutina } from '../../types';
import { Link } from 'react-router-dom';

interface Props {
  rutina: Rutina;
}

const getDificultadStyle = (dificultad: string) => {
  const d = dificultad.toLowerCase();
  if (d.includes('avanzado')) return { 
    bg: 'from-red-500/20 to-orange-500/10', 
    text: 'text-red-400', 
    border: 'border-red-500/40',
    badge: 'bg-gradient-to-r from-red-500 to-orange-500',
    glow: 'rgba(239, 68, 68, 0.3)'
  };
  if (d.includes('intermedio')) return { 
    bg: 'from-yellow-500/20 to-amber-500/10', 
    text: 'text-yellow-400', 
    border: 'border-yellow-500/40',
    badge: 'bg-gradient-to-r from-yellow-500 to-amber-500',
    glow: 'rgba(234, 179, 8, 0.3)'
  };
  if (d.includes('bajo') || d.includes('principiante')) return { 
    bg: 'from-green-500/20 to-emerald-500/10', 
    text: 'text-green-400', 
    border: 'border-green-500/40',
    badge: 'bg-gradient-to-r from-green-500 to-emerald-500',
    glow: 'rgba(34, 197, 94, 0.3)'
  };
  return { 
    bg: 'from-blue-500/20 to-cyan-500/10', 
    text: 'text-blue-400', 
    border: 'border-blue-500/40',
    badge: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    glow: 'rgba(59, 130, 246, 0.3)'
  };
};

const getCategoriaStyle = (categoria: string) => {
  const c = categoria.toLowerCase();
  if (c.includes('fuerza') || c.includes('push') || c.includes('pull')) return { icon: '💪', gradient: 'from-orange-500 via-red-500 to-red-600', shadow: 'rgba(249, 115, 22, 0.4)' };
  if (c.includes('cardio') || c.includes('resistencia') || c.includes('hiit')) return { icon: '🔥', gradient: 'from-red-500 via-pink-500 to-rose-600', shadow: 'rgba(244, 63, 94, 0.4)' };
  if (c.includes('funcional') || c.includes('hyrox')) return { icon: '⚡', gradient: 'from-yellow-400 via-amber-500 to-orange-500', shadow: 'rgba(245, 158, 11, 0.4)' };
  if (c.includes('core') || c.includes('abdominal')) return { icon: '🎯', gradient: 'from-purple-500 via-pink-500 to-fuchsia-600', shadow: 'rgba(168, 85, 247, 0.4)' };
  if (c.includes('movilidad') || c.includes('recuperacion')) return { icon: '🧘', gradient: 'from-cyan-400 via-blue-500 to-indigo-600', shadow: 'rgba(34, 211, 238, 0.4)' };
  if (c.includes('metabólico') || c.includes('crossfit')) return { icon: '⏱', gradient: 'from-green-500 via-teal-500 to-emerald-600', shadow: 'rgba(20, 184, 166, 0.4)' };
  if (c.includes('peso')) return { icon: '🏋️', gradient: 'from-blue-500 via-indigo-500 to-violet-600', shadow: 'rgba(99, 102, 241, 0.4)' };
  return { icon: '🏃', gradient: 'from-emerald-400 via-cyan-500 to-blue-500', shadow: 'rgba(16, 185, 129, 0.4)' };
};

export const WorkoutCard = ({ rutina }: Props) => {
  const diffStyle = getDificultadStyle(rutina.dificultad);
  const catStyle = getCategoriaStyle(rutina.categoria);
  const totalSeries = rutina.ejercicios.reduce((acc, e) => acc + e.series, 0);

  return (
    <Link to={`/workout/${rutina.id}`} className="block group">
      <div className="relative overflow-hidden rounded-3xl border transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-2xl" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: '0 4px 24px var(--shadow-color)' }}>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at 50% 0%, ${diffStyle.glow} 0%, transparent 60%)` }} />
        
        <div className="relative">
          <div className={`h-2 w-full bg-gradient-to-r ${catStyle.gradient}`} />
          
          <div className="p-5">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${catStyle.gradient} flex items-center justify-center text-3xl shadow-xl animate-float`} style={{ boxShadow: `0 8px 24px ${catStyle.shadow}` }}>
                    {catStyle.icon}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-blue)] flex items-center justify-center">
                    <Dumbbell className="w-3 h-3 text-black" />
                  </div>
                </div>
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${diffStyle.text}`}>
                    {rutina.categoria}
                  </span>
                  <h3 className="text-xl font-bold mt-0.5 transition-all duration-300 group-hover:translate-x-1" style={{ color: 'var(--text-primary)' }}>
                    {rutina.nombre}
                  </h3>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white ${diffStyle.badge} shadow-lg`}>
                {rutina.dificultad}
              </div>
            </div>
            
            <p className="text-sm mb-5 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {rutina.descripcion}
            </p>
            
            <div className={`p-4 rounded-2xl mb-5 border ${diffStyle.bg} ${diffStyle.border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                      <Clock className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
                    </div>
                    <div>
                      <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{rutina.duracion_min}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>minutos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                      <Target className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
                    </div>
                    <div>
                      <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{rutina.ejercicios.length}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ejercicios</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                      <Zap className="w-5 h-5" style={{ color: 'var(--accent-purple)' }} />
                    </div>
                    <div>
                      <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{totalSeries}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>series</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {rutina.ejercicios.slice(0, 4).map((_, idx) => (
                  <div 
                    key={idx} 
                    className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--accent-green)]/10 to-[var(--accent-blue)]/10 border border-[var(--border-color)] flex items-center justify-center"
                    style={{ transform: `rotate(${idx * 3}deg)` }}
                  >
                    <Flame className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                  </div>
                ))}
                {rutina.ejercicios.length > 4 && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                    +{rutina.ejercicios.length - 4}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Ver rutina</span>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-green)] to-[var(--accent-blue)] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                  <ChevronRight className="w-6 h-6 text-black" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
