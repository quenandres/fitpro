import { Users, TrendingUp, AlertTriangle, UsersRound, Dumbbell, MessagesSquare, CalendarDays, Bell } from 'lucide-react';
import data from '../../data/adminDashboard/entrenador.json';
import type { EntrenadorMetrics } from '../../types/adminDashboard';
import { KpiCard } from '../../components/admin/dashboard/KpiCard';
import { ChartCard } from '../../components/admin/dashboard/ChartCard';
import { SectionHeader } from '../../components/admin/dashboard/SectionHeader';
import { AttentionList } from '../../components/admin/dashboard/AttentionList';
import { LineTrendChart } from '../../components/admin/dashboard/LineTrendChart';
import { MultiSeriesLineChart } from '../../components/admin/dashboard/MultiSeriesLineChart';
import { CategoryBarChart } from '../../components/admin/dashboard/CategoryBarChart';
import { CHART_SERIES_COLORS } from '../../components/admin/dashboard/chartColors';

const metrics = data as EntrenadorMetrics;
const [verde, azul, rosa, naranja] = CHART_SERIES_COLORS;

const KPI_ICONS: Record<string, typeof Users> = {
  'Usuarios asignados': Users,
  Cumplimiento: TrendingUp,
  'En riesgo': AlertTriangle,
  Comunidades: UsersRound,
};

export const EntrenadorDashboardView = () => (
  <>
    <div className="animate-slide-up grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 min-w-0">
      {metrics.kpis.map(({ label, valor }, i) => (
        <KpiCard
          key={label}
          icon={KPI_ICONS[label] ?? Users}
          label={label}
          value={valor}
          accent={CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length]}
        />
      ))}
    </div>

    <SectionHeader icon={Dumbbell} title="Entrenamiento" accent={azul} />
    <div className="flex flex-col gap-3 min-w-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
        <ChartCard title="Cumplimiento" subtitle="% promedio de tus clientes">
          <LineTrendChart data={metrics.cumplimiento} color={azul} valueSuffix="%" />
        </ChartCard>
        <ChartCard title="Progreso" subtitle="Índice de progreso promedio">
          <LineTrendChart data={metrics.progreso} color={verde} />
        </ChartCard>
      </div>
      <ChartCard title="Usuarios por cumplimiento" subtitle="Distribución por rango" height={200}>
        <CategoryBarChart data={metrics.usuariosPorCumplimiento} color={azul} />
      </ChartCard>
    </div>

    <SectionHeader icon={UsersRound} title="Comunidades administradas" accent="#9333ea" />
    <ChartCard title="Miembros por comunidad" height={220}>
      <CategoryBarChart data={metrics.comunidadesAdministradas} color="#9333ea" />
    </ChartCard>

    <SectionHeader icon={MessagesSquare} title="Actividad social" accent={rosa} />
    <ChartCard title="Publicaciones / discusiones" subtitle="Últimos 7 meses" height={240}>
      <MultiSeriesLineChart
        data={metrics.actividadSocial}
        series={[
          { key: 'publicaciones', label: 'Publicaciones', color: verde },
          { key: 'discusiones', label: 'Discusiones', color: rosa },
        ]}
      />
    </ChartCard>

    <SectionHeader icon={CalendarDays} title="Eventos" accent={naranja} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
      <ChartCard title="Eventos" subtitle="Por tipo">
        <CategoryBarChart data={metrics.eventos} color={naranja} />
      </ChartCard>
      <ChartCard title="Participación" subtitle="% de asistencia por tipo">
        <CategoryBarChart data={metrics.participacion} color={naranja} valueSuffix="%" />
      </ChartCard>
    </div>

    <SectionHeader icon={Bell} title="Atención" accent="#dc2626" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
      <AttentionList title="Usuarios en riesgo" items={metrics.usuariosEnRiesgo} />
      <AttentionList title="Notificaciones" items={metrics.notificaciones} />
    </div>
  </>
);
