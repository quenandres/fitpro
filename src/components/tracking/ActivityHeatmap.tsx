import { useMemo } from 'react';
import type { HeatmapCell } from '../../utils/trackingUtils';
import {
  TRACKING_MODALIDAD_LABELS,
  TRACKING_PERIOD_LABELS,
  buildHeatmapCellsForRange,
  buildMonthCalendarGrid,
  buildWeekCells,
  formatSessionTooltip,
  getHeatmapDayLabels,
  getPeriodRange,
  parseFechaLocal,
  type TrackingPeriod,
} from '../../utils/trackingUtils';
import type { SesionEntrenamiento } from '../../types';

interface ActivityHeatmapProps {
  sesiones: SesionEntrenamiento[];
  period: TrackingPeriod;
  anchorDate: Date;
}

function HeatmapLegend() {
  return (
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
  );
}

function weekCellClass(modalidad: HeatmapCell['modalidad']): string {
  if (!modalidad) return 'fp-tracking-week-cell fp-tracking-week-cell--empty';
  return `fp-tracking-week-cell fp-tracking-week-cell--${modalidad}`;
}

function WeekHeatmap({ sesiones, anchorDate }: { sesiones: SesionEntrenamiento[]; anchorDate: Date }) {
  const cells = useMemo(() => buildWeekCells(sesiones, anchorDate), [sesiones, anchorDate]);
  const dayLabels = getHeatmapDayLabels();

  return (
    <div className="fp-tracking-week-grid">
      {cells.map((cell, i) => {
        const dayNum = parseFechaLocal(cell.date).getDate();
        return (
          <div key={cell.date} className="fp-tracking-week-day">
            <span className="fp-tracking-week-day-label">{dayLabels[i]}</span>
            <div
              className={weekCellClass(cell.modalidad)}
              title={formatSessionTooltip(cell.sesiones)}
              aria-label={
                cell.sesiones.length > 0
                  ? formatSessionTooltip(cell.sesiones).replace(/\n/g, ', ')
                  : `Sin actividad ${cell.date}`
              }
            >
              <span className="fp-tracking-week-day-num">{dayNum}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function monthCellClass(modalidad: HeatmapCell['modalidad']): string {
  if (!modalidad) return 'fp-tracking-month-cell fp-tracking-month-cell--empty';
  return `fp-tracking-month-cell fp-tracking-month-cell--${modalidad}`;
}

function MonthHeatmap({ sesiones, anchorDate }: { sesiones: SesionEntrenamiento[]; anchorDate: Date }) {
  const grid = useMemo(
    () => buildMonthCalendarGrid(sesiones, anchorDate),
    [sesiones, anchorDate],
  );
  const dayLabels = getHeatmapDayLabels();

  return (
    <div className="fp-tracking-month-wrap">
      <div className="fp-tracking-month-head">
        {dayLabels.map((label) => (
          <span key={label} className="fp-tracking-month-head-cell">{label}</span>
        ))}
      </div>
      {grid.map((week, wi) => (
        <div key={`w-${wi}`} className="fp-tracking-month-row">
          {week.map((cell, di) => (
            <div
              key={`${wi}-${di}`}
              className={cell.inMonth
                ? monthCellClass(cell.modalidad)
                : 'fp-tracking-month-cell fp-tracking-month-cell--pad'}
              title={cell.inMonth ? formatSessionTooltip(cell.sesiones) : undefined}
              aria-hidden={!cell.inMonth}
            >
              {cell.inMonth ? (
                <span className="fp-tracking-month-day-num">{cell.dayNum}</span>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function rangeCellClass(modalidad: HeatmapCell['modalidad']): string {
  if (!modalidad) return 'fp-tracking-range-cell fp-tracking-range-cell--empty';
  return `fp-tracking-range-cell fp-tracking-range-cell--${modalidad}`;
}

function RangeHeatmap({
  sesiones,
  period,
  anchorDate,
}: {
  sesiones: SesionEntrenamiento[];
  period: TrackingPeriod;
  anchorDate: Date;
}) {
  const range = useMemo(() => getPeriodRange(period, anchorDate), [period, anchorDate]);
  const grid = useMemo(
    () => buildHeatmapCellsForRange(sesiones, range.desde, range.hasta),
    [sesiones, range.desde, range.hasta],
  );
  const dayLabels = getHeatmapDayLabels();
  const weekCount = grid[0]?.length ?? 0;

  return (
    <div
      className={`fp-tracking-range-wrap${weekCount > 20 ? ' fp-tracking-range-wrap--scroll' : ''}`}
    >
      <div
        className="fp-tracking-range-grid"
        style={{ '--tracking-weeks': weekCount } as React.CSSProperties}
      >
        {grid.map((row, rowIndex) => (
          <div key={dayLabels[rowIndex]} className="fp-tracking-range-row">
            <span className="fp-tracking-range-day-label">{dayLabels[rowIndex]}</span>
            <div
              className="fp-tracking-range-cells"
              style={{ '--tracking-weeks': weekCount } as React.CSSProperties}
            >
              {row.map((cell) => (
                <div
                  key={cell.date}
                  className={rangeCellClass(cell.modalidad)}
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
  );
}

export function ActivityHeatmap({ sesiones, period, anchorDate }: ActivityHeatmapProps) {
  const periodHint = TRACKING_PERIOD_LABELS[period];

  return (
    <div className="fp-tracking-heatmap-wrap">
      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
        Vista {periodHint.toLowerCase()} · color por modalidad dominante del día
      </p>

      {period === 'semana' ? (
        <WeekHeatmap sesiones={sesiones} anchorDate={anchorDate} />
      ) : period === 'mes' ? (
        <MonthHeatmap sesiones={sesiones} anchorDate={anchorDate} />
      ) : (
        <RangeHeatmap sesiones={sesiones} period={period} anchorDate={anchorDate} />
      )}

      <HeatmapLegend />
    </div>
  );
}
