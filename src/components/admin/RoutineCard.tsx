import { Pencil, Trash2, Clock, Target, Zap, Dumbbell, Flame } from 'lucide-react';
import type { Rutina } from '../../types';

interface Props {
  rutina: Rutina;
  onEdit: (rutina: Rutina) => void;
  onDelete: (id: number) => void;
}

const getDificultadStyle = (dificultad: string) => {
  const d = dificultad.toLowerCase();
  if (d.includes('avanzado')) return { bg: 'from-red-500/15 to-orange-500/10', text: 'text-red-400', badge: 'bg-gradient-to-r from-red-500 to-orange-500' };
  if (d.includes('intermedio')) return { bg: 'from-yellow-500/15 to-amber-500/10', text: 'text-yellow-400', badge: 'bg-gradient-to-r from-yellow-500 to-amber-500' };
  if (d.includes('bajo') || d.includes('principiante')) return { bg: 'from-green-500/15 to-emerald-500/10', text: 'text-green-400', badge: 'bg-gradient-to-r from-green-500 to-emerald-500' };
  return { bg: 'from-blue-500/15 to-cyan-500/10', text: 'text-blue-400', badge: 'bg-gradient-to-r from-blue-500 to-cyan-500' };
};

const getCategoriaGradient = (categoria: string) => {
  const c = categoria.toLowerCase();
  if (c.includes('fuerza') || c.includes('push') || c.includes('pull')) return 'from-orange-500 via-red-500 to-red-600';
  if (c.includes('cardio') || c.includes('resistencia') || c.includes('hiit')) return 'from-red-500 via-pink-500 to-rose-600';
  if (c.includes('funcional') || c.includes('hyrox')) return 'from-yellow-400 via-amber-500 to-orange-500';
  if (c.includes('core') || c.includes('abdominal')) return 'from-purple-500 via-pink-500 to-fuchsia-600';
  if (c.includes('movilidad') || c.includes('recuperacion')) return 'from-cyan-400 via-blue-500 to-indigo-600';
  return 'from-emerald-400 via-cyan-500 to-blue-500';
};

const getCategoriaIcon = (categoria: string) => {
  const c = categoria.toLowerCase();
  if (c.includes('fuerza') || c.includes('push') || c.includes('pull')) return '💪';
  if (c.includes('cardio') || c.includes('resistencia') || c.includes('hiit')) return '🔥';
  if (c.includes('funcional') || c.includes('hyrox')) return '⚡';
  if (c.includes('core') || c.includes('abdominal')) return '🎯';
  if (c.includes('movilidad') || c.includes('recuperacion')) return '🧘';
  return '🏋️';
};

export const RoutineCard = ({ rutina, onEdit, onDelete }: Props) => {
  const diffStyle = getDificultadStyle(rutina.dificultad);
  const catGradient = getCategoriaGradient(rutina.categoria);
  const catIcon = getCategoriaIcon(rutina.categoria);
  const totalSeries = rutina.ejercicios.reduce((acc, e) => acc + e.series, 0);

  return (
    <div className="group relative overflow-hidden rounded-3xl border transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: '0 4px 24px var(--shadow-color)' }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(0, 212, 255, 0.08) 100%)' }} />
      
      <div className="relative">
        <div className={`h-2 w-full bg-gradient-to-r ${catGradient}`} />
        
        <div className="p-5">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${catGradient} flex items-center justify-center text-3xl shadow-xl`}>
                {catIcon}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--bg-tertiary)] border-2 border-[var(--border-color)] flex items-center justify-center">
                <Dumbbell className="w-3 h-3" style={{ color: 'var(--accent-green)' }} />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent-green)' }}>
                  {rutina.categoria}
                </span>
                <div className={`px-2 py-0.5 rounded text-xs font-bold text-white ${diffStyle.badge}`}>
                  {rutina.dificultad}
                </div>
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {rutina.nombre}
              </h3>
            </div>
          </div>
          
          <div className={`p-4 rounded-2xl mb-4 border ${diffStyle.bg}`} style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                    <Clock className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{rutina.duracion_min}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>min</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                    <Target className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
                  </div>
                  <div>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{rutina.ejercicios.length}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ejercicios</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
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
          
          <p className="text-sm mb-4 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {rutina.descripcion}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {rutina.ejercicios.slice(0, 3).map((_, idx) => (
                <div 
                  key={idx}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-green)]/10 to-[var(--accent-blue)]/10 border border-[var(--border-color)] flex items-center justify-center"
                >
                  <Flame className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
                </div>
              ))}
              {rutina.ejercicios.length > 3 && (
                <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                  +{rutina.ejercicios.length - 3}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(rutina)}
                className="p-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-blue-500/20 transition-all"
                title="Editar"
              >
                <Pencil className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
              </button>
              <button
                onClick={() => onDelete(rutina.id)}
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
