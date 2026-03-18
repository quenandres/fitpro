import React from 'react';
import { Search, Dumbbell, Users, Ruler, Plus } from 'lucide-react';

interface EmptyStateProps {
  type: 'rutinas' | 'ejercicios' | 'unidades' | 'search' | 'filter';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  type, 
  title, 
  description, 
  action 
}) => {
  const configs = {
    rutinas: {
      icon: <Dumbbell className="w-16 h-16" />,
      defaultTitle: 'No hay rutinas aún',
      defaultDesc: 'Crea tu primera rutina de entrenamiento para comenzar',
    },
    ejercicios: {
      icon: <Users className="w-16 h-16" />,
      defaultTitle: 'No hay ejercicios aún',
      defaultDesc: 'Agrega ejercicios a tu biblioteca',
    },
    unidades: {
      icon: <Ruler className="w-16 h-16" />,
      defaultTitle: 'No hay unidades aún',
      defaultDesc: 'Configura las unidades de medición',
    },
    search: {
      icon: <Search className="w-16 h-16" />,
      defaultTitle: 'No se encontraron resultados',
      defaultDesc: 'Intenta con otros términos de búsqueda',
    },
    filter: {
      icon: <Search className="w-16 h-16" />,
      defaultTitle: 'No hay resultados para filtros',
      defaultDesc: 'Intenta cambiar los filtros seleccionados',
    },
  };

  const config = configs[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 text-orange-500/50">
        {config.icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="text-gray-400 max-w-md mb-6">
        {description || config.defaultDesc}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="
            flex items-center gap-2 px-6 py-3 rounded-xl
            bg-gradient-to-r from-orange-500 to-orange-600
            text-white font-semibold
            hover:scale-105 active:scale-95
            transition-transform duration-200
          "
        >
          <Plus className="w-5 h-5" />
          {action.label}
        </button>
      )}
    </div>
  );
};

// Stats Card for Dashboard
interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'orange' | 'blue' | 'green' | 'purple';
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend,
  color = 'orange' 
}) => {
  const colors = {
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400',
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
  };

  return (
    <div className={`
      relative overflow-hidden
      p-5 rounded-2xl
      bg-gradient-to-br ${colors[color]}
      border
      backdrop-blur-xl
    `}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-white/10">
          {icon}
        </div>
      </div>
    </div>
  );
};
