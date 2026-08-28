import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { PuntoComparativo } from '../../../types/adminDashboard';
import { CHART_AXIS_COLOR, CHART_CURSOR_FILL, CHART_GRID_COLOR, CHART_TOOLTIP_LABEL_STYLE, CHART_TOOLTIP_STYLE } from './chartColors';
import { useChartLayout } from './useChartLayout';

interface Props {
  data: PuntoComparativo[];
  color: string;
  valueSuffix?: string;
}

const truncate = (value: string, max: number) => {
  if (value.length <= max) return value;
  const slice = value.slice(0, max - 1).trimEnd();
  const space = slice.lastIndexOf(' ');
  return `${space >= 6 ? slice.slice(0, space) : slice}…`;
};

/** Barras de una sola serie por categoría (comunidades activas, eventos, asistencia...). */
export const CategoryBarChart = ({ data, color, valueSuffix = '' }: Props) => {
  const { isCompact, margin, fontSize, yAxisWidth } = useChartLayout();
  const longest = data.reduce((max, d) => Math.max(max, d.etiqueta.length), 0);
  const yWidth = Math.min(128, Math.max(72, Math.round(longest * 6.5)));

  return (
    <ResponsiveContainer width="100%" height="100%" debounce={50}>
      {isCompact ? (
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 12, left: 4, bottom: 0 }}
        >
          <CartesianGrid stroke={CHART_GRID_COLOR} horizontal={false} />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            stroke={CHART_AXIS_COLOR}
            fontSize={fontSize}
          />
          <YAxis
            type="category"
            dataKey="etiqueta"
            width={yWidth}
            tickLine={false}
            axisLine={false}
            stroke={CHART_AXIS_COLOR}
            fontSize={fontSize}
            tickFormatter={(value) => truncate(String(value), 18)}
          />
          <Tooltip
            formatter={(value) => [`${value}${valueSuffix}`, '']}
            contentStyle={CHART_TOOLTIP_STYLE}
            labelStyle={CHART_TOOLTIP_LABEL_STYLE}
            cursor={CHART_CURSOR_FILL}
          />
          <Bar dataKey="valor" fill={color} radius={[0, 4, 4, 0]} maxBarSize={22} />
        </BarChart>
      ) : (
        <BarChart data={data} margin={margin}>
          <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
          <XAxis
            dataKey="etiqueta"
            tickLine={false}
            axisLine={false}
            stroke={CHART_AXIS_COLOR}
            fontSize={fontSize}
            interval={0}
            minTickGap={4}
            tickFormatter={(value) => truncate(String(value), 14)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            stroke={CHART_AXIS_COLOR}
            fontSize={fontSize}
            width={yAxisWidth}
          />
          <Tooltip
            formatter={(value) => [`${value}${valueSuffix}`, '']}
            contentStyle={CHART_TOOLTIP_STYLE}
            labelStyle={CHART_TOOLTIP_LABEL_STYLE}
            cursor={CHART_CURSOR_FILL}
          />
          <Bar dataKey="valor" fill={color} radius={[4, 4, 0, 0]} maxBarSize={36} />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
};
