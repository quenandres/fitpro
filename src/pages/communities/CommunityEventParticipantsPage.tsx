import { useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ParticipantList } from '../../components/communities/events/ParticipantList';
import { PageBackRow } from '../../components/common/PageBackButton';
import { Skeleton } from '../../components/common/Skeleton';
import { useComunidadEvento, useComunidadMiembros } from '../../lib/gateway/hooks';
import { ROUTES } from '../../routes/paths';
import { getCommunityEventBack } from '../../utils/communityBackUtils';

export function CommunityEventParticipantsPage() {
  const { id, eventId } = useParams<{ id: string; eventId: string }>();
  const { data: evento, isLoading } = useComunidadEvento(id ?? '', eventId ?? '');
  const { data: miembros = [] } = useComunidadMiembros(id);

  const miembrosPorId = useMemo(
    () =>
      new Map(
        miembros.map((m) => [
          m.id,
          { nombre: m.nombre, avatarUrl: m.avatarUrl || undefined },
        ]),
      ),
    [miembros],
  );

  if (isLoading) {
    return <Skeleton height={240} className="rounded-2xl" />;
  }

  if (!evento) return <Navigate to={ROUTES.communities.events(id ?? '')} replace />;

  const back = getCommunityEventBack(id ?? '', eventId ?? '');

  return (
    <div className="fp-com-card">
      <PageBackRow to={back.to} label={back.label} />
      <h1 className="font-sora text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        Participantes — {evento.titulo}
      </h1>
      <ParticipantList participantes={evento.participantes} miembrosPorId={miembrosPorId} />
    </div>
  );
}
