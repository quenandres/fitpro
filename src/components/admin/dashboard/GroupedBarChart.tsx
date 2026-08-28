import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SerieConfig } from './MultiSeriesLineChart';
import { CHART_AXIS_COLOR, CHART_CURSOR_FILL, CHART_GRID_COLOR, CHART_TOOLTIP_LABEL_STYLE, CHART_TOOLTIP_STYLE } from './chartColors';
import { useChartLayout } from './useChartLayout';

interface Props {
  data: Record<string, string | number>[];
  bars: SerieConfig[];
  categoryKey?: string;
}

/** Barras agrupadas de varias series por categoría (nuevos vs activos...). */
export const GroupedBarChart = ({ data, bars, categoryKey = 'etiqueta' }: Props) => {
  const { isMobile, margin, fontSize, yAxisWidth } = useChartLayout();

  return (
    <ResponsiveContainer width="100%" height="100%" debounce={50}>
      <BarChart data={data} margin={{ ...margin, bottom: isMobile ? 8 : 4 }}>
        <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
        <XAxis
          dataKey={categoryKey}
          tickLine={false}
          axisLine={false}
          stroke={CHART_AXIS_COLOR}
          fontSize={fontSize}
          interval={0}
          minTickGap={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          stroke={CHART_AXIS_COLOR}
          fontSize={fontSize}
          width={yAxisWidth}
        />
        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} cursor={CHART_CURSOR_FILL} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize, color: 'var(--text-muted)', paddingTop: 4 }}
        />
        {bars.map((b) => (
          <Bar key={b.key} dataKey={b.key} name={b.label} fill={b.color} radius={[4, 4, 0, 0]} maxBarSize={isMobile ? 16 : 28} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
