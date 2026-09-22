import { useParams, Link } from 'react-router-dom';
import { Calendar, MessageSquare, Users } from 'lucide-react';
import {
  useComunidad,
  useComunidadMiembros,
  useComunidadPosts,
} from '../../lib/gateway/hooks';
import { ROUTES } from '../../routes/paths';

export function CommunityAdminPage() {
  const { id } = useParams<{ id: string }>();
  const { data: comunidad } = useComunidad(id);
  const { data: miembros = [] } = useComunidadMiembros(id);
  const { data: posts = [] } = useComunidadPosts(id);

  if (!comunidad) return null;

  const metrics = [
    { icon: Users, label: 'Miembros', value: miembros.length },
    { icon: MessageSquare, label: 'Publicaciones', value: posts.length },
    { icon: Calendar, label: 'Eventos', value: comunidad.eventosCount },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-sora text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
        Administración
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map(({ icon: Icon, label, value }) => (
          <div key={label} className="fp-com-card">
            <Icon size={16} style={{ color: 'var(--accent-pink)' }} />
            <p className="font-sora text-xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>{value}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          </div>
        ))}
      </div>

      <Link to={ROUTES.communities.adminMembers(comunidad.id)} className="fp-com-card fp-com-card-hover flex items-center gap-3">
        <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 40, height: 40, background: 'var(--accent-pink-dim)', color: 'var(--accent-pink)' }}>
          <Users size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Gestión de miembros</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Roles, suspensiones y expulsiones</p>
        </div>
      </Link>

      <div className="fp-com-card">
        <h2 className="font-sora font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Reglas</h2>
        <ol className="flex flex-col gap-2 mt-3 list-decimal list-inside">
          {comunidad.reglas.map((r, i) => (
            <li key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
