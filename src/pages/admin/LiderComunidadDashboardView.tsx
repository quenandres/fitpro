import { Users, UserPlus, Activity, MessagesSquare, CalendarDays, Flame } from 'lucide-react';
import data from '../../data/adminDashboard/liderComunidad.json';
import type { LiderComunidadMetrics } from '../../types/adminDashboard';
import { KpiCard } from '../../components/admin/dashboard/KpiCard';
import { ChartCard } from '../../components/admin/dashboard/ChartCard';
import { SectionHeader } from '../../components/admin/dashboard/SectionHeader';
import { LineTrendChart } from '../../components/admin/dashboard/LineTrendChart';
import { MultiSeriesLineChart } from '../../components/admin/dashboard/MultiSeriesLineChart';
import { CategoryBarChart } from '../../components/admin/dashboard/CategoryBarChart';
import { CHART_SERIES_COLORS } from '../../components/admin/dashboard/chartColors';

const metrics = data as LiderComunidadMetrics;
const [verde, azul, rosa, naranja] = CHART_SERIES_COLORS;

const KPI_ICONS: Record<string, typeof Users> = {
  Miembros: Users,
  'Nuevos miembros': UserPlus,
  Actividad: Activity,
};

export const LiderComunidadDashboardView = () => (
  <>
    <div className="animate-slide-up delay-100 fp-admin-kpi-grid fp-admin-kpi-grid--3">
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

    <SectionHeader icon={UserPlus} title="Miembros" accent={verde} />
    <ChartCard title="Nuevos miembros" subtitle="Últimos 7 meses" height={220}>
      <LineTrendChart data={metrics.nuevosMiembros} color={verde} />
    </ChartCard>

    <SectionHeader icon={MessagesSquare} title="Actividad social" accent={rosa} />
    <div className="flex flex-col gap-3 min-w-0">
      <ChartCard title="Publicaciones / comentarios / reacciones" subtitle="Últimos 7 meses" height={240}>
        <MultiSeriesLineChart
          data={metrics.actividadSocial}
          series={[
            { key: 'publicaciones', label: 'Publicaciones', color: verde },
            { key: 'comentarios', label: 'Comentarios', color: azul },
            { key: 'reacciones', label: 'Reacciones', color: rosa },
          ]}
        />
      </ChartCard>
      <ChartCard title="Discusiones" subtitle="Por tema" height={200}>
        <CategoryBarChart data={metrics.discusiones} color={azul} />
      </ChartCard>
    </div>

    <SectionHeader icon={CalendarDays} title="Eventos" accent={naranja} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
      <ChartCard title="Eventos" subtitle="Por tipo">
        <CategoryBarChart data={metrics.eventos} color={naranja} />
      </ChartCard>
      <ChartCard title="Asistencia" subtitle="% del aforo">
        <CategoryBarChart data={metrics.asistencia} color={naranja} valueSuffix="%" />
      </ChartCard>
    </div>

    <SectionHeader icon={Flame} title="Contenido más popular" accent={rosa} />
    <ol className="fp-card fp-admin-rank min-w-0">
      {metrics.contenidoPopular.map((item, i) => (
        <li key={item.id} className="fp-admin-rank-item">
          <span className="font-sora fp-admin-rank-n">{String(i + 1).padStart(2, '0')}</span>
          <div className="fp-admin-rank-copy">
            <p className="fp-admin-rank-title">{item.titulo}</p>
            <p className="fp-admin-rank-detail">{item.detalle}</p>
          </div>
          <span className="badge" style={{ background: `${rosa}1f`, color: rosa, border: 'none' }}>
            {item.metrica}
          </span>
        </li>
      ))}
    </ol>
  </>
);
