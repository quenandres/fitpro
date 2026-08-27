import { Calendar, MessageSquare, Users } from 'lucide-react';
import type { Comunidad } from '../../../types/community';

interface CommunityStatsProps {
  comunidad: Comunidad;
  className?: string;
}

/** Fila compacta de métricas: miembros, publicaciones, eventos. */
export function CommunityStats({ comunidad, className = '' }: CommunityStatsProps) {
  const items = [
    { icon: Users, value: comunidad.miembrosCount, label: 'miembros' },
    { icon: MessageSquare, value: comunidad.postsCount, label: 'posts' },
    { icon: Calendar, value: comunidad.eventosCount, label: 'eventos' },
  ];

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {items.map(({ icon: Icon, value, label }) => (
        <div key={label} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          <Icon size={13} />
          <span style={{ color: 'var(--text-primary)' }}>{value}</span>
          {label}
        </div>
      ))}
    </div>
  );
}
