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
    <div className="animate-slide-up grid grid-cols-3 gap-2 mb-2 min-w-0">
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
    <div className="fp-card min-w-0" style={{ padding: 16, borderRadius: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {metrics.contenidoPopular.map((item, i) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              padding: '8px 0',
              borderBottom: i < metrics.contenidoPopular.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{item.titulo}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.detalle}</p>
            </div>
            <span
              className="badge"
              style={{ fontSize: 10, padding: '3px 8px', background: `${rosa}1f`, color: rosa, border: 'none', flexShrink: 0 }}
            >
              {item.metrica}
            </span>
          </div>
        ))}
      </div>
    </div>
  </>
);
