import { Clock, Flame, ChevronRight } from 'lucide-react';
import type { Rutina } from '../../types';
import { Link } from 'react-router-dom';

interface Props {
  rutina: Rutina;
}

const getDificultadColor = (dificultad: string) => {
  const d = dificultad.toLowerCase();
  if (d.includes('avanzado')) return { bg: 'bg-red-500/20', text: 'text-red-400', glow: 'rgba(239, 68, 68, 0.3)' };
  if (d.includes('intermedio')) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', glow: 'rgba(234, 179, 8, 0.3)' };
  if (d.includes('bajo') || d.includes('principiante')) return { bg: 'bg-green-500/20', text: 'text-green-400', glow: 'rgba(34, 197, 94, 0.3)' };
  return { bg: 'bg-[var(--accent-blue)]/20', text: 'text-[var(--accent-blue)]', glow: 'var(--glow-blue)' };
};

const getCategoriaIcon = (categoria: string) => {
  const c = categoria.toLowerCase();
  if (c.includes('fuerza') || c.includes('push') || c.includes('pull')) return '💪';
  if (c.includes('cardio') || c.includes('resistencia') || c.includes('hiit')) return '🔥';
  if (c.includes('funcional') || c.includes('hyrox')) return '⚡';
  if (c.includes('core') || c.includes('abdominal')) return '🎯';
  if (c.includes('movilidad') || c.includes('recuperacion')) return '🧘';
  if (c.includes('metabólico') || c.includes('crossfit')) return '⏱';
  if (c.includes('peso')) return '🏋️';
  return '🏃';
};

export const WorkoutCard = ({ rutina }: Props) => {
  const diffStyle = getDificultadColor(rutina.dificultad);

  return (
    <Link
      to={`/workout/${rutina.id}`}
      className="block group"
    >
      <div 
        className="card-3d rounded-3xl p-5 border relative overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          boxShadow: '0 10px 40px var(--shadow-color)'
        }}
      >
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${diffStyle.glow} 0%, transparent 70%)`
          }}
        />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl animate-float"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-green) 0%, var(--accent-blue) 100%)',
                  boxShadow: '0 4px 15px var(--glow-green)'
                }}
              >
                {getCategoriaIcon(rutina.categoria)}
              </div>
              <div>
                <span 
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--accent-green)' }}
                >
                  {rutina.categoria}
                </span>
                <h3 
                  className="text-lg font-bold mt-0.5 transition-all duration-300 group-hover:scale-105"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {rutina.nombre}
                </h3>
              </div>
            </div>
            <span 
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${diffStyle.bg} ${diffStyle.text}`}
              style={{ boxShadow: `0 0 15px ${diffStyle.glow}` }}
            >
              {rutina.dificultad}
            </span>
          </div>
          
          <p 
            className="text-sm mb-4 line-clamp-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {rutina.descripcion}
          </p>
          
          <div 
            className="flex items-center gap-4 text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <Clock className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
              <span className="font-medium">{rutina.duracion_min} min</span>
            </div>
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <Flame className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
              <span className="font-medium">{rutina.ejercicios.length} ejercicios</span>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300"
              style={{ 
                background: 'var(--bg-tertiary)',
                boxShadow: '0 0 20px var(--glow-green)'
              }}
            >
              <ChevronRight 
                className="w-5 h-5" 
                style={{ color: 'var(--accent-green)' }} 
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
