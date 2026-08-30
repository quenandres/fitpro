import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { HeatmapCell } from '../../utils/trackingUtils';
import {
  MONTH_FULL,
  TRACKING_MODALIDAD_LABELS,
  TRACKING_PERIOD_LABELS,
  YEAR_DAY_LETTERS,
  buildMonthCalendarGrid,
  buildWeekAlignedRangeGrid,
  buildWeekCells,
  countSesionesInMonth,
  formatSessionTooltip,
  getHeatmapDayLabels,
  getPeriodRange,
  parseFechaLocal,
  rangeColumnMeta,
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
    () => buildWeekAlignedRangeGrid(sesiones, range.desde, range.hasta),
    [sesiones, range.desde, range.hasta],
  );
  const columns = useMemo(() => rangeColumnMeta(grid), [grid]);
  const dayLabels = getHeatmapDayLabels();
  const weekCount = columns.length;
  const showDayNums = period === 'trimestre';
  const showWeekNums = period === 'trimestre';
  const showMonths = period === 'trimestre';

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
        {showMonths ? (
          <div className="fp-tracking-range-row fp-tracking-range-row--axis">
            <span className="fp-tracking-range-day-label" aria-hidden />
            <div className="fp-tracking-range-cells" style={{ '--tracking-weeks': weekCount } as React.CSSProperties}>
              {columns.map((col, i) => (
                <span
                  key={`m-${i}`}
                  className={`fp-tracking-range-month${col.isMonthStart ? ' is-start' : ''}`}
                >
                  {col.isMonthStart ? col.monthLabel : ''}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {showWeekNums ? (
          <div className="fp-tracking-range-row fp-tracking-range-row--axis">
            <span className="fp-tracking-range-day-label" aria-hidden />
            <div className="fp-tracking-range-cells" style={{ '--tracking-weeks': weekCount } as React.CSSProperties}>
              {columns.map((col, i) => (
                <span key={`w-${i}`} className="fp-tracking-range-week-n">
                  S{col.weekNum}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {grid.map((row, rowIndex) => (
          <div key={dayLabels[rowIndex]} className="fp-tracking-range-row">
            <span className="fp-tracking-range-day-label">{dayLabels[rowIndex]}</span>
            <div
              className="fp-tracking-range-cells"
              style={{ '--tracking-weeks': weekCount } as React.CSSProperties}
            >
              {row.map((cell, colIndex) => {
                const hasSessions = cell.inRange && cell.sesiones.length > 0;
                const muscleCounts = hasSessions
                  ? aggregateSessionMuscleLoad(cell.sesiones, rutinas, ejercicios)
                  : {};
                const monthStart = columns[colIndex]?.isMonthStart;

                return (
                  <div
                    key={cell.date}
                    className={[
                      rangeCellClass(cell.modalidad, showMuscleMap, hasSessions),
                      cell.inRange ? '' : 'fp-tracking-range-cell--out',
                      monthStart ? 'fp-tracking-range-cell--month-start' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    title={cell.inRange ? formatSessionTooltip(cell.sesiones) : undefined}
                    aria-hidden={!cell.inRange}
                    aria-label={
                      !cell.inRange
                        ? undefined
                        : hasSessions
                          ? formatSessionTooltip(cell.sesiones).replace(/\n/g, ', ')
                          : `Sin actividad ${cell.date}`
                    }
                  >
                    {cell.inRange ? (
                      <HeatmapMuscleCellContent
                        showMuscleMap={showMuscleMap}
                        hasSessions={hasSessions}
                        muscleCounts={muscleCounts}
                        dateLabel={cell.date}
                        dayLabel={showDayNums ? cell.dayNum : undefined}
                        normalContent={
                          showDayNums ? (
                            <span className="fp-tracking-range-day-num">{cell.dayNum}</span>
                          ) : null
                        }
                      />
                    ) : null}
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

const YEAR_QUARTERS = [
  { id: 'T1', months: [0, 1, 2] as const },
  { id: 'T2', months: [3, 4, 5] as const },
  { id: 'T3', months: [6, 7, 8] as const },
  { id: 'T4', months: [9, 10, 11] as const },
];

function YearMonthTile({
  year,
  month,
  sesiones,
  isCurrent,
}: {
  year: number;
  month: number;
  sesiones: SesionEntrenamiento[];
  isCurrent: boolean;
}) {
  const grid = useMemo(
    () => buildMonthCalendarGrid(sesiones, new Date(year, month, 1, 12)),
    [sesiones, year, month],
  );
  const count = useMemo(
    () => countSesionesInMonth(sesiones, year, month),
    [sesiones, year, month],
  );

  return (
    <article className={`fp-tracking-year-tile${isCurrent ? ' is-current' : ''}`}>
      <header className="fp-tracking-year-tile-head">
        <h4 className="font-sora fp-tracking-year-tile-name">{MONTH_FULL[month]}</h4>
        <p className="fp-tracking-year-tile-count">
          {count === 0 ? 'Sin sesiones' : `${count} ${count === 1 ? 'sesión' : 'sesiones'}`}
        </p>
      </header>
      <div className="fp-tracking-year-cal">
        <div className="fp-tracking-year-cal-head">
          {YEAR_DAY_LETTERS.map((letter) => (
            <span key={letter}>{letter}</span>
          ))}
        </div>
        {grid.map((week, wi) => (
          <div key={wi} className="fp-tracking-year-cal-row">
            {week.map((cell, di) => {
              const hasSessions = cell.inMonth && cell.sesiones.length > 0;
              return (
                <div
                  key={`${wi}-${di}`}
                  className={[
                    'fp-tracking-year-cell',
                    !cell.inMonth ? 'is-pad' : '',
                    hasSessions && cell.modalidad ? `is-${cell.modalidad}` : '',
                    cell.inMonth && !hasSessions ? 'is-empty' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  title={cell.inMonth ? formatSessionTooltip(cell.sesiones) : undefined}
                  aria-hidden={!cell.inMonth}
                >
                  {cell.inMonth ? cell.dayNum : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </article>
  );
}

function YearHeatmap({
  sesiones,
  anchorDate,
}: {
  sesiones: SesionEntrenamiento[];
  anchorDate: Date;
}) {
  const year = anchorDate.getFullYear();
  const now = new Date();
  const currentMonth = now.getFullYear() === year ? now.getMonth() : -1;
  const defaultOpen = currentMonth >= 0 ? YEAR_QUARTERS[Math.floor(currentMonth / 3)].id : null;
  const [openId, setOpenId] = useState<string | null>(defaultOpen);

  return (
    <div className="fp-tracking-year">
      {YEAR_QUARTERS.map((q) => {
        const open = openId === q.id;
        const panelId = `year-q-${q.id}`;
        const sessionsInQ = q.months.reduce(
          (sum, month) => sum + countSesionesInMonth(sesiones, year, month),
          0,
        );
        const rangeLabel = `${MONTH_FULL[q.months[0]]} – ${MONTH_FULL[q.months[2]]}`;

        return (
          <section key={q.id} className={`fp-tracking-year-q${open ? ' is-open' : ''}`}>
            <button
              type="button"
              className="fp-tracking-year-q-trigger"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpenId(open ? null : q.id)}
            >
              <span className="font-sora fp-tracking-year-q-id">{q.id}</span>
              <span className="fp-tracking-year-q-copy">
                <span className="fp-tracking-year-q-range">{rangeLabel}</span>
                <span className="fp-tracking-year-q-meta">
                  {sessionsInQ === 0
                    ? 'Sin sesiones'
                    : `${sessionsInQ} ${sessionsInQ === 1 ? 'sesión' : 'sesiones'}`}
                </span>
              </span>
              <ChevronDown size={16} className="fp-tracking-year-q-chevron" aria-hidden />
            </button>
            {open ? (
              <div id={panelId} className="fp-tracking-year-q-grid">
                {q.months.map((month) => (
                  <YearMonthTile
                    key={month}
                    year={year}
                    month={month}
                    sesiones={sesiones}
                    isCurrent={month === currentMonth}
                  />
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
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
      ) : period === 'anio' ? (
        <YearHeatmap sesiones={sesiones} anchorDate={anchorDate} />
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
