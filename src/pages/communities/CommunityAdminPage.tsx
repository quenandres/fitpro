import { useParams, Link } from 'react-router-dom';
import { AlertTriangle, Calendar, MessageSquare, ShieldAlert, Users } from 'lucide-react';
import {
  useCommunity,
  useCommunityMembers,
  useCommunityPosts,
  useCommunityReports,
} from '../../store/useCommunitiesStore';
import { ROUTES } from '../../routes/paths';

export function CommunityAdminPage() {
  const { id } = useParams<{ id: string }>();
  const comunidad = useCommunity(id);
  const miembros = useCommunityMembers(id);
  const posts = useCommunityPosts(id);
  const reportes = useCommunityReports(id);

  if (!comunidad) return null;

  const reportesPendientes = reportes.filter((r) => r.estado === 'pendiente').length;

  const metrics = [
    { icon: Users, label: 'Miembros', value: miembros.length },
    { icon: MessageSquare, label: 'Publicaciones', value: posts.length },
    { icon: Calendar, label: 'Eventos', value: comunidad.eventosCount },
    { icon: AlertTriangle, label: 'Reportes pendientes', value: reportesPendientes },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-sora text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
        Administración
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map(({ icon: Icon, label, value }) => (
          <div key={label} className="fp-com-card">
            <Icon size={16} style={{ color: 'var(--accent-pink)' }} />
            <p className="font-sora text-xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{value}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link to={ROUTES.communities.adminMembers(comunidad.id)} className="fp-com-card fp-com-card-hover flex items-center gap-3">
          <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 40, height: 40, background: 'var(--accent-pink-dim)', color: 'var(--accent-pink)' }}>
            <Users size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Gestión de miembros</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Roles, suspensiones y expulsiones</p>
          </div>
        </Link>

        <Link to={ROUTES.communities.adminModeration(comunidad.id)} className="fp-com-card fp-com-card-hover flex items-center gap-3">
          <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 40, height: 40, background: 'var(--accent-pink-dim)', color: 'var(--accent-pink)' }}>
            <ShieldAlert size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Moderación {reportesPendientes > 0 ? `(${reportesPendientes})` : ''}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Reportes pendientes y resueltos</p>
          </div>
        </Link>
      </div>

      <div className="fp-com-card">
        <h2 className="font-sora font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Reglas</h2>
        <ol className="flex flex-col gap-2 mt-3 list-decimal list-inside">
          {comunidad.reglas.map((r, i) => (
            <li key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r}</li>
          ))}
        </ol>
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
          Edición de reglas — próximamente en una versión conectada al backend.
        </p>
      </div>
    </div>
  );
}
