import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART_AXIS_COLOR, CHART_GRID_COLOR, CHART_TOOLTIP_LABEL_STYLE, CHART_TOOLTIP_STYLE } from './chartColors';
import { useChartLayout } from './useChartLayout';

export interface SerieConfig {
  key: string;
  label: string;
  color: string;
}

interface Props {
  data: Record<string, string | number>[];
  series: SerieConfig[];
  dateKey?: string;
}

const formatFecha = (fecha: string) => new Date(fecha).toLocaleDateString('es', { month: 'short' });

/** Varias series sobre el tiempo (posts/comentarios/reacciones, publicaciones/discusiones...). */
export const MultiSeriesLineChart = ({ data, series, dateKey = 'fecha' }: Props) => {
  const { isMobile, margin, fontSize, yAxisWidth } = useChartLayout();

  return (
    <ResponsiveContainer width="100%" height="100%" debounce={50}>
      <LineChart data={data} margin={{ ...margin, bottom: isMobile ? 8 : 4 }}>
        <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
        <XAxis
          dataKey={dateKey}
          tickFormatter={formatFecha}
          tickLine={false}
          axisLine={false}
          stroke={CHART_AXIS_COLOR}
          fontSize={fontSize}
          minTickGap={12}
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          stroke={CHART_AXIS_COLOR}
          fontSize={fontSize}
          width={yAxisWidth}
        />
        <Tooltip
          labelFormatter={(label) => formatFecha(String(label))}
          contentStyle={CHART_TOOLTIP_STYLE}
          labelStyle={CHART_TOOLTIP_LABEL_STYLE}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: fontSize, color: 'var(--text-muted)', paddingTop: 4 }}
        />
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};
