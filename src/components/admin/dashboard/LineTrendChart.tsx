import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { PuntoSerieTemporal } from '../../../types/adminDashboard';
import { CHART_AXIS_COLOR, CHART_GRID_COLOR, CHART_TOOLTIP_LABEL_STYLE, CHART_TOOLTIP_STYLE } from './chartColors';
import { useChartLayout } from './useChartLayout';

const formatFecha = (fecha: string) => new Date(fecha).toLocaleDateString('es', { month: 'short' });

interface Props {
  data: PuntoSerieTemporal[];
  color: string;
  valueSuffix?: string;
}

/** Línea de una sola serie sobre el tiempo (usuarios activos, cumplimiento, crecimiento de miembros...). */
export const LineTrendChart = ({ data, color, valueSuffix = '' }: Props) => {
  const { margin, fontSize, yAxisWidth } = useChartLayout();

  return (
    <ResponsiveContainer width="100%" height="100%" debounce={50}>
      <LineChart data={data} margin={margin}>
        <CartesianGrid stroke={CHART_GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="fecha"
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
          formatter={(value) => [`${value}${valueSuffix}`, '']}
          labelFormatter={(label) => formatFecha(String(label))}
          contentStyle={CHART_TOOLTIP_STYLE}
          labelStyle={CHART_TOOLTIP_LABEL_STYLE}
        />
        <Line type="monotone" dataKey="valor" stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};
