import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import { EventCard } from '../../components/communities/cards/EventCard';
import { EmptyState } from '../../components/common/EmptyState';
import { useCommunityEvents } from '../../store/useCommunitiesStore';
import { useCommunityPermissions } from '../../hooks/useCommunityPermissions';
import { useNow } from '../../hooks/useNow';
import { ROUTES } from '../../routes/paths';

type Tab = 'proximos' | 'pasados';

export function CommunityEventsPage() {
  const { id } = useParams<{ id: string }>();
  const eventos = useCommunityEvents(id);
  const { puedeModerar } = useCommunityPermissions(id ?? '');
  const [tab, setTab] = useState<Tab>('proximos');
  const now = useNow();

  const filtered = useMemo(() => {
    const list = eventos.filter((e) =>
      tab === 'proximos' ? new Date(e.inicioEn).getTime() >= now : new Date(e.inicioEn).getTime() < now,
    );
    return [...list].sort((a, b) => {
      const diff = new Date(a.inicioEn).getTime() - new Date(b.inicioEn).getTime();
      return tab === 'proximos' ? diff : -diff;
    });
  }, [eventos, tab, now]);

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

      {filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={tab === 'proximos' ? 'No hay eventos próximos' : 'No hay eventos pasados'}
          description="Vuelve más tarde o crea uno nuevo si eres líder o moderador."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((evento) => (
            <EventCard key={evento.id} evento={evento} />
          ))}
        </div>
      )}
    </div>
  );
}
