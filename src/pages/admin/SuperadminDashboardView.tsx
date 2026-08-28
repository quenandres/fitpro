import {
  Users,
  UserCheck,
  Dumbbell,
  UsersRound,
  CalendarDays,
  TrendingUp,
  UserCog,
  AlertTriangle,
  MessagesSquare,
} from 'lucide-react';
import data from '../../data/adminDashboard/superadmin.json';
import type { SuperadminMetrics } from '../../types/adminDashboard';
import { KpiCard } from '../../components/admin/dashboard/KpiCard';
import { ChartCard } from '../../components/admin/dashboard/ChartCard';
import { SectionHeader } from '../../components/admin/dashboard/SectionHeader';
import { AttentionList } from '../../components/admin/dashboard/AttentionList';
import { LineTrendChart } from '../../components/admin/dashboard/LineTrendChart';
import { MultiSeriesLineChart } from '../../components/admin/dashboard/MultiSeriesLineChart';
import { CategoryBarChart } from '../../components/admin/dashboard/CategoryBarChart';
import { GroupedBarChart } from '../../components/admin/dashboard/GroupedBarChart';
import { CHART_SERIES_COLORS } from '../../components/admin/dashboard/chartColors';

const metrics = data as SuperadminMetrics;
const [verde, azul, rosa, naranja, morado] = CHART_SERIES_COLORS;

const KPI_ICONS: Record<string, typeof Users> = {
  Usuarios: Users,
  Activos: UserCheck,
  Entrenamientos: Dumbbell,
  Comunidades: UsersRound,
  Eventos: CalendarDays,
  Retención: TrendingUp,
  Entrenadores: UserCog,
  Alertas: AlertTriangle,
};

export const SuperadminDashboardView = () => (
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

    <SectionHeader icon={Users} title="Usuarios" accent={verde} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
      <ChartCard title="Usuarios activos" subtitle="Últimos 7 meses">
        <LineTrendChart data={metrics.usuariosActivos} color={verde} />
      </ChartCard>
      <ChartCard title="Nuevos vs activos" subtitle="Por mes">
        <GroupedBarChart
          data={metrics.nuevosVsActivos}
          bars={[
            { key: 'nuevos', label: 'Nuevos', color: azul },
            { key: 'activos', label: 'Activos', color: verde },
          ]}
        />
      </ChartCard>
    </div>

    <SectionHeader icon={Dumbbell} title="Entrenamiento" accent={azul} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
      <ChartCard title="Cumplimiento" subtitle="% promedio de rutinas completadas">
        <LineTrendChart data={metrics.cumplimiento} color={azul} valueSuffix="%" />
      </ChartCard>
      <ChartCard title="Usuarios por cumplimiento" subtitle="Distribución por rango">
        <CategoryBarChart data={metrics.usuariosPorCumplimiento} color={azul} />
      </ChartCard>
    </div>

    <SectionHeader icon={UsersRound} title="Comunidades" accent={morado} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
      <ChartCard title="Comunidades activas" subtitle="Por categoría">
        <CategoryBarChart data={metrics.comunidadesActivas} color={morado} />
      </ChartCard>
      <ChartCard title="Crecimiento de miembros" subtitle="Últimos 7 meses">
        <LineTrendChart data={metrics.crecimientoMiembros} color={morado} />
      </ChartCard>
    </div>

    <SectionHeader icon={MessagesSquare} title="Actividad social" accent={rosa} />
    <ChartCard title="Posts / comentarios / reacciones" subtitle="Últimos 7 meses" height={260}>
      <MultiSeriesLineChart
        data={metrics.actividadSocial}
        series={[
          { key: 'posts', label: 'Posts', color: verde },
          { key: 'comentarios', label: 'Comentarios', color: azul },
          { key: 'reacciones', label: 'Reacciones', color: rosa },
        ]}
      />
    </ChartCard>

    <SectionHeader icon={CalendarDays} title="Eventos" accent={naranja} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
      <ChartCard title="Eventos" subtitle="Por tipo">
        <CategoryBarChart data={metrics.eventos} color={naranja} />
      </ChartCard>
      <ChartCard title="Asistencia" subtitle="% del aforo, por tipo de evento">
        <CategoryBarChart data={metrics.asistencia} color={naranja} valueSuffix="%" />
      </ChartCard>
    </div>

    <SectionHeader icon={AlertTriangle} title="Atención" accent="#dc2626" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 min-w-0">
      <AttentionList title="Usuarios en riesgo" items={metrics.usuariosEnRiesgo} />
      <AttentionList title="Comunidades inactivas" items={metrics.comunidadesInactivas} />
      <AttentionList title="Eventos con baja asistencia" items={metrics.eventosBajaAsistencia} />
    </div>
  </>
);
