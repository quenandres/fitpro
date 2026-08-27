import { useParams, Navigate } from 'react-router-dom';
import { ParticipantList } from '../../components/communities/events/ParticipantList';
import { useCommunitiesStore } from '../../store/useCommunitiesStore';
import { ROUTES } from '../../routes/paths';

export function CommunityEventParticipantsPage() {
  const { id, eventId } = useParams<{ id: string; eventId: string }>();
  const evento = useCommunitiesStore((s) => s.eventos.find((e) => e.id === eventId));

  if (!evento) return <Navigate to={ROUTES.communities.events(id ?? '')} replace />;

  return (
    <div className="fp-com-card">
      <h1 className="font-sora text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        Participantes — {evento.titulo}
      </h1>
      <ParticipantList participantes={evento.participantes} />
    </div>
  );
}
