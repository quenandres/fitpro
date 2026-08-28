import type { ReactNode } from 'react';
import { AnatomyMuscleHeatmapMini } from '../anatomy/AnatomyMuscleHeatmapMini';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface Props {
  showMuscleMap: boolean;
  hasSessions: boolean;
  muscleCounts: Record<string, number>;
  dateLabel: string;
  dayLabel?: ReactNode;
  normalContent: ReactNode;
}

/** Contenido demo de mapa muscular dentro de una celda del calendario de actividad. */
export function HeatmapMuscleCellContent({
  showMuscleMap,
  hasSessions,
  muscleCounts,
  dateLabel,
  dayLabel,
  normalContent,
}: Props) {
  const isMobile = useIsMobile();

  if (!showMuscleMap || !hasSessions || isMobile) {
    return <>{normalContent}</>;
  }

  return (
    <>
      {dayLabel != null ? (
        <span className="fp-tracking-day-num--corner">{dayLabel}</span>
      ) : null}
      <div className="fp-tracking-cell-muscle-mini">
        <AnatomyMuscleHeatmapMini
          counts={muscleCounts}
          ariaLabel={`Demo mapa muscular ${dateLabel}`}
        />
      </div>
    </>
  );
}
