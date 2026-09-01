import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useNow } from '../../../hooks/useNow';
import { usePlatformRole } from '../../../hooks/usePlatformRole';
import entrenadorData from '../../../data/adminDashboard/entrenador.json';
import superadminData from '../../../data/adminDashboard/superadmin.json';
import type {
  EntrenadorMetrics,
  RolDashboard,
  SuperadminMetrics,
} from '../../../types/adminDashboard';
import { ROLE_LABEL } from '../../../types/adminDashboard';
import { ROUTES } from '../../../routes/paths';
import {
  buildPulse,
  displayNameFromEmail,
  formatBriefingDate,
  greetingForHour,
  type BriefingAction,
  type BriefingPulse,
} from './dashboardBriefing';

const entrenador = entrenadorData as EntrenadorMetrics;
const superadmin = superadminData as SuperadminMetrics;

const kpiValue = (
  kpis: Array<{ label: string; valor: number | string }>,
  label: string,
): number | string | undefined => kpis.find((k) => k.label === label)?.valor;

const asNumber = (value: number | string | undefined): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number.parseFloat(value.replace('%', '')) || 0;
  return 0;
};

const briefingForRole = (
  rol: RolDashboard,
): { lede: string; pulse: BriefingPulse[]; actions: BriefingAction[] } => {
  if (rol === 'superadmin') {
    const activos = asNumber(kpiValue(superadmin.kpis, 'Activos'));
    const usuarios = asNumber(kpiValue(superadmin.kpis, 'Usuarios'));
    const alertas = asNumber(kpiValue(superadmin.kpis, 'Alertas'));
    const retencion = asNumber(kpiValue(superadmin.kpis, 'Retención'));
    return {
      lede: `${alertas} alertas abiertas. La plataforma retiene al ${retencion}%.`,
      pulse: buildPulse([
        { label: 'Activos', value: activos, color: 'var(--brand)' },
        { label: 'Resto', value: Math.max(0, usuarios - activos), color: 'var(--text-muted)' },
      ]),
      actions: [
        { to: ROUTES.communities.create, label: 'Crear comunidad', primary: true },
        { to: ROUTES.calendar, label: 'Calendario' },
      ],
    };
  }

  const riesgo = asNumber(kpiValue(entrenador.kpis, 'En riesgo'));
  const asignados = asNumber(kpiValue(entrenador.kpis, 'Usuarios asignados'));
  const cumplimiento = asNumber(kpiValue(entrenador.kpis, 'Cumplimiento'));
  const enRiesgoPct = asignados > 0 ? (riesgo / asignados) * 100 : 0;
  return {
    lede: `${riesgo} clientes se están quedando atrás. El resto cumple al ${cumplimiento}%.`,
    pulse: buildPulse([
      { label: 'Al día', value: cumplimiento, color: 'var(--brand)' },
      { label: 'En riesgo', value: enRiesgoPct, color: 'var(--accent-red)' },
      { label: 'Sin dato', value: Math.max(0, 100 - cumplimiento - enRiesgoPct), color: 'var(--text-muted)' },
    ]),
    actions: [
      { to: ROUTES.tracking, label: 'Ver tracking', primary: true },
      { to: ROUTES.calendar, label: 'Calendario' },
      { to: ROUTES.library.planes, label: 'Planes' },
    ],
  };
};

export const DashboardBriefing = () => {
  const { user } = useAuth();
  const { rol } = usePlatformRole();
  const now = useNow();
  const hour = new Date(now).getHours();
  const { lede, pulse, actions } = briefingForRole(rol);
  const visiblePulse = pulse.filter((s) => s.value > 0);

  return (
    <section className="fp-admin-briefing animate-slide-up" aria-labelledby="dashboard-briefing-title">
      <div className="fp-admin-briefing-meta">
        <span className="fp-admin-briefing-date">{formatBriefingDate(now)}</span>
        <span className="badge badge-brand">{ROLE_LABEL[rol]}</span>
      </div>

      <h1 id="dashboard-briefing-title" className="font-sora fp-admin-briefing-title">
        {greetingForHour(hour)},{' '}
        <span className="text-gradient-brand">{displayNameFromEmail(user?.email)}</span>
      </h1>
      <p className="fp-admin-briefing-lede">{lede}</p>

      <div className="fp-admin-pulse" role="img" aria-label="Pulso del día">
        {visiblePulse.map((segment) => (
          <span
            key={segment.label}
            className="fp-admin-pulse-seg"
            style={{ width: `${segment.value}%`, background: segment.color }}
          />
        ))}
      </div>
      <ul className="fp-admin-pulse-legend">
        {visiblePulse.map((segment) => (
          <li key={segment.label}>
            <span className="fp-admin-pulse-dot" style={{ background: segment.color }} />
            {segment.label} {segment.value}%
          </li>
        ))}
      </ul>

      <div className="fp-admin-briefing-actions">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className={`fp-btn ${action.primary ? 'fp-btn-primary' : 'fp-btn-secondary'}`}
            style={{ textDecoration: 'none', fontSize: 13, padding: '8px 14px' }}
          >
            {action.label}
            {action.primary && <ArrowUpRight size={14} />}
          </Link>
        ))}
      </div>
    </section>
  );
};
