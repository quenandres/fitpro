import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import { EventCard } from '../../components/communities/cards/EventCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Skeleton } from '../../components/common/Skeleton';
import { useComunidadEventos } from '../../lib/gateway/hooks';
import { useCommunityPermissions } from '../../hooks/useCommunityPermissions';
import { ROUTES } from '../../routes/paths';

type Tab = 'proximos' | 'pasados';

export function CommunityEventsPage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>('proximos');
  const { data: filtered = [], isLoading } = useComunidadEventos(id, tab);
  const { puedeModerar } = useCommunityPermissions(id ?? '');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-sora text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          Eventos
        </h1>
        {puedeModerar ? (
          <Link
            to={ROUTES.communities.eventCreate(id ?? '')}
            className="fp-btn text-sm flex items-center gap-2"
            style={{ background: 'var(--accent-pink)', color: '#fff' }}
          >
            <Plus size={15} />
            Crear evento
          </Link>
        ) : null}
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          className="fp-com-tab"
          style={tab === 'proximos' ? { background: 'var(--accent-pink-dim)', color: 'var(--accent-pink)' } : undefined}
          onClick={() => setTab('proximos')}
        >
          Próximos
        </button>
        <button
          type="button"
          className="fp-com-tab"
          style={tab === 'pasados' ? { background: 'var(--accent-pink-dim)', color: 'var(--accent-pink)' } : undefined}
          onClick={() => setTab('pasados')}
        >
          Pasados
        </button>
      </div>

      {isLoading ? (
        <Skeleton height={160} className="rounded-2xl" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={tab === 'proximos' ? 'Sin eventos próximos' : 'Sin eventos pasados'}
          description="Los eventos de la comunidad aparecerán aquí."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((evento) => (
            <EventCard key={evento.id} evento={evento} />
          ))}
        </div>
      )}
    </div>
  );
}
