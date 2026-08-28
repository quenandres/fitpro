import { useMemo } from 'react';
import type { HeatmapCell } from '../../utils/trackingUtils';
import {
  TRACKING_MODALIDAD_LABELS,
  buildHeatmapCells,
  formatSessionTooltip,
  getHeatmapDayLabels,
} from '../../utils/trackingUtils';
import type { SesionEntrenamiento } from '../../types';
import { useIsMobile } from '../../hooks/useMediaQuery';

interface ActivityHeatmapProps {
  sesiones: SesionEntrenamiento[];
}

function cellClass(modalidad: HeatmapCell['modalidad']): string {
  if (!modalidad) return 'fp-tracking-cell fp-tracking-cell--empty';
  return `fp-tracking-cell fp-tracking-cell--${modalidad}`;
}

export function ActivityHeatmap({ sesiones }: ActivityHeatmapProps) {
  const isMobile = useIsMobile();
  const weeks = isMobile ? 26 : 52;

  const grid = useMemo(
    () => buildHeatmapCells(sesiones, weeks),
    [sesiones, weeks],
  );

  const dayLabels = getHeatmapDayLabels();

  return (
    <div className="fp-tracking-heatmap-wrap">
      <div className="fp-tracking-heatmap-scroll">
        <div className="fp-tracking-heatmap">
          {grid.map((row, rowIndex) => (
            <div key={dayLabels[rowIndex]} className="fp-tracking-heatmap-row">
              <span className="fp-tracking-day-label">{dayLabels[rowIndex]}</span>
              <div className="fp-tracking-heatmap-cells">
                {row.map((cell) => (
                  <div
                    key={cell.date}
                    className={cellClass(cell.modalidad)}
                    title={formatSessionTooltip(cell.sesiones)}
                    aria-label={
                      cell.sesiones.length > 0
                        ? formatSessionTooltip(cell.sesiones).replace(/\n/g, ', ')
                        : `Sin actividad ${cell.date}`
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ul className="fp-tracking-legend">
        <li>
          <span className="fp-tracking-cell fp-tracking-cell--empty fp-tracking-legend-swatch" />
          Sin actividad
        </li>
        {(['fuerza', 'isometrico', 'otro'] as const).map((mod) => (
          <li key={mod}>
            <span
              className={`fp-tracking-cell fp-tracking-cell--${mod} fp-tracking-legend-swatch`}
            />
            {TRACKING_MODALIDAD_LABELS[mod]}
          </li>
        ))}
      </ul>
    </div>
  );
}
