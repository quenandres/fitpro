import { Activity, Flame, Dumbbell, Timer } from 'lucide-react';
import type { SesionEntrenamiento } from '../../types';
import { calcStreak, countByModalidad } from '../../utils/trackingUtils';
import { KpiCard } from '../admin/dashboard/KpiCard';

interface TrackingStatsProps {
  sesiones: SesionEntrenamiento[];
}

export function TrackingStats({ sesiones }: TrackingStatsProps) {
  const counts = countByModalidad(sesiones);
  const streak = calcStreak(sesiones);

  const items = [
    { icon: Activity, label: 'Sesiones (12 sem)', value: sesiones.length, accent: '#22c55e' },
    { icon: Flame, label: 'Racha actual', value: streak, accent: '#f0883e' },
    { icon: Dumbbell, label: 'Fuerza', value: counts.fuerza, accent: '#f0883e' },
    { icon: Timer, label: 'Isométrico', value: counts.isometrico, accent: '#58a6ff' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 min-w-0">
      {items.map(({ icon, label, value, accent }) => (
        <KpiCard key={label} icon={icon} label={label} value={value} accent={accent} />
      ))}
    </div>
  );
}
