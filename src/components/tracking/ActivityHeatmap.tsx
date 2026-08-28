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
import type { Ejercicio, Rutina, SesionEntrenamiento } from '../../types';
import { aggregateSessionMuscleLoad } from '../../utils/sessionMuscleLoad';
import { HeatmapMuscleCellContent } from './HeatmapMuscleCellContent';

interface ActivityHeatmapProps {
  sesiones: SesionEntrenamiento[];
  period: TrackingPeriod;
  anchorDate: Date;
  /** Prueba: mapa muscular por día (semana, mes, trimestre — solo desktop). */
  showMuscleMap?: boolean;
  rutinas?: Rutina[];
  ejercicios?: Ejercicio[];
}

const MUSCLE_MAP_PERIODS: TrackingPeriod[] = ['semana', 'mes', 'trimestre'];

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

function weekCellClass(modalidad: HeatmapCell['modalidad'], showMuscleMap: boolean, hasSessions: boolean): string {
  const base = modalidad
    ? `fp-tracking-week-cell fp-tracking-week-cell--${modalidad}`
    : 'fp-tracking-week-cell fp-tracking-week-cell--empty';
  return showMuscleMap && hasSessions ? `${base} fp-tracking-week-cell--muscles` : base;
}

function monthCellClass(
  modalidad: HeatmapCell['modalidad'],
  inMonth: boolean,
  showMuscleMap: boolean,
  hasSessions: boolean,
): string {
  if (!inMonth) return 'fp-tracking-month-cell fp-tracking-month-cell--pad';
  const base = modalidad
    ? `fp-tracking-month-cell fp-tracking-month-cell--${modalidad}`
    : 'fp-tracking-month-cell fp-tracking-month-cell--empty';
  return showMuscleMap && hasSessions ? `${base} fp-tracking-month-cell--muscles` : base;
}

function rangeCellClass(modalidad: HeatmapCell['modalidad'], showMuscleMap: boolean, hasSessions: boolean): string {
  const base = modalidad
    ? `fp-tracking-range-cell fp-tracking-range-cell--${modalidad}`
    : 'fp-tracking-range-cell fp-tracking-range-cell--empty';
  return showMuscleMap && hasSessions ? `${base} fp-tracking-range-cell--muscles` : base;
}

function WeekHeatmap({
  sesiones,
  anchorDate,
  showMuscleMap,
  rutinas,
  ejercicios,
}: {
  sesiones: SesionEntrenamiento[];
  anchorDate: Date;
  showMuscleMap: boolean;
  rutinas: Rutina[];
  ejercicios: Ejercicio[];
}) {
  const cells = useMemo(() => buildWeekCells(sesiones, anchorDate), [sesiones, anchorDate]);
  const dayLabels = getHeatmapDayLabels();

  return (
    <div className={`fp-tracking-week-grid${showMuscleMap ? ' fp-tracking-week-grid--muscles' : ''}`}>
      {cells.map((cell, i) => {
        const dayNum = parseFechaLocal(cell.date).getDate();
        const hasSessions = cell.sesiones.length > 0;
        const muscleCounts = hasSessions
          ? aggregateSessionMuscleLoad(cell.sesiones, rutinas, ejercicios)
          : {};

        return (
          <div key={cell.date} className="fp-tracking-week-day">
            <span className="fp-tracking-week-day-label">{dayLabels[i]}</span>
            <div
              className={weekCellClass(cell.modalidad, showMuscleMap, hasSessions)}
              title={formatSessionTooltip(cell.sesiones)}
              aria-label={
                hasSessions
                  ? formatSessionTooltip(cell.sesiones).replace(/\n/g, ', ')
                  : `Sin actividad ${cell.date}`
              }
            >
              <HeatmapMuscleCellContent
                showMuscleMap={showMuscleMap}
                hasSessions={hasSessions}
                muscleCounts={muscleCounts}
                dateLabel={cell.date}
                dayLabel={dayNum}
                normalContent={<span className="fp-tracking-week-day-num">{dayNum}</span>}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MonthHeatmap({
  sesiones,
  anchorDate,
  showMuscleMap,
  rutinas,
  ejercicios,
}: {
  sesiones: SesionEntrenamiento[];
  anchorDate: Date;
  showMuscleMap: boolean;
  rutinas: Rutina[];
  ejercicios: Ejercicio[];
}) {
  const grid = useMemo(
    () => buildMonthCalendarGrid(sesiones, anchorDate),
    [sesiones, anchorDate],
  );
  const dayLabels = getHeatmapDayLabels();

  return (
    <div className={`fp-tracking-month-wrap${showMuscleMap ? ' fp-tracking-month-wrap--muscles' : ''}`}>
      <div className="fp-tracking-month-head">
        {dayLabels.map((label) => (
          <span key={label} className="fp-tracking-month-head-cell">{label}</span>
        ))}
      </div>
      {grid.map((week, wi) => (
        <div key={`w-${wi}`} className="fp-tracking-month-row">
          {week.map((cell, di) => {
            const hasSessions = cell.inMonth && cell.sesiones.length > 0;
            const muscleCounts = hasSessions
              ? aggregateSessionMuscleLoad(cell.sesiones, rutinas, ejercicios)
              : {};

            return (
              <div
                key={`${wi}-${di}`}
                className={monthCellClass(cell.modalidad, cell.inMonth, showMuscleMap, hasSessions)}
                title={cell.inMonth ? formatSessionTooltip(cell.sesiones) : undefined}
                aria-hidden={!cell.inMonth}
              >
                {cell.inMonth ? (
                  <HeatmapMuscleCellContent
                    showMuscleMap={showMuscleMap}
                    hasSessions={hasSessions}
                    muscleCounts={muscleCounts}
                    dateLabel={cell.date}
                    dayLabel={cell.dayNum}
                    normalContent={<span className="fp-tracking-month-day-num">{cell.dayNum}</span>}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function RangeHeatmap({
  sesiones,
  period,
  anchorDate,
  showMuscleMap,
  rutinas,
  ejercicios,
}: {
  sesiones: SesionEntrenamiento[];
  period: TrackingPeriod;
  anchorDate: Date;
  showMuscleMap: boolean;
  rutinas: Rutina[];
  ejercicios: Ejercicio[];
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
      className={[
        'fp-tracking-range-wrap',
        weekCount > 20 ? 'fp-tracking-range-wrap--scroll' : '',
        showMuscleMap ? 'fp-tracking-range-wrap--muscles' : '',
      ]
        .filter(Boolean)
        .join(' ')}
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
              {row.map((cell) => {
                const hasSessions = cell.sesiones.length > 0;
                const muscleCounts = hasSessions
                  ? aggregateSessionMuscleLoad(cell.sesiones, rutinas, ejercicios)
                  : {};

                return (
                  <div
                    key={cell.date}
                    className={rangeCellClass(cell.modalidad, showMuscleMap, hasSessions)}
                    title={formatSessionTooltip(cell.sesiones)}
                    aria-label={
                      hasSessions
                        ? formatSessionTooltip(cell.sesiones).replace(/\n/g, ', ')
                        : `Sin actividad ${cell.date}`
                    }
                  >
                    <HeatmapMuscleCellContent
                      showMuscleMap={showMuscleMap}
                      hasSessions={hasSessions}
                      muscleCounts={muscleCounts}
                      dateLabel={cell.date}
                      normalContent={null}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityHeatmap({
  sesiones,
  period,
  anchorDate,
  showMuscleMap = false,
  rutinas = [],
  ejercicios = [],
}: ActivityHeatmapProps) {
  const periodHint = TRACKING_PERIOD_LABELS[period];
  const muscleMapActive = showMuscleMap && MUSCLE_MAP_PERIODS.includes(period);

  return (
    <div className="fp-tracking-heatmap-wrap">
      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
        Vista {periodHint.toLowerCase()} · color por modalidad dominante del día
      </p>

      {muscleMapActive ? (
        <p
          className="text-[11px] mb-3 rounded-lg px-2.5 py-2 leading-snug"
          style={{
            background: 'rgba(240,136,62,.12)',
            border: '1px solid rgba(240,136,62,.3)',
            color: 'var(--text-secondary)',
          }}
        >
          <strong style={{ color: '#f0883e' }}>Demo interna</strong> — mapa muscular por día
          (prototipo, solo desktop). Vistas semana, mes y trimestre. No representa datos reales.
        </p>
      ) : null}

      {period === 'semana' ? (
        <WeekHeatmap
          sesiones={sesiones}
          anchorDate={anchorDate}
          showMuscleMap={muscleMapActive}
          rutinas={rutinas}
          ejercicios={ejercicios}
        />
      ) : period === 'mes' ? (
        <MonthHeatmap
          sesiones={sesiones}
          anchorDate={anchorDate}
          showMuscleMap={muscleMapActive}
          rutinas={rutinas}
          ejercicios={ejercicios}
        />
      ) : (
        <RangeHeatmap
          sesiones={sesiones}
          period={period}
          anchorDate={anchorDate}
          showMuscleMap={muscleMapActive && period === 'trimestre'}
          rutinas={rutinas}
          ejercicios={ejercicios}
        />
      )}

      <HeatmapLegend />
    </div>
  );
}
