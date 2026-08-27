import { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Trash2, Users } from 'lucide-react';
import { EventHeader } from '../../components/communities/events/EventHeader';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useCommunitiesStore, CURRENT_MEMBER_ID } from '../../store/useCommunitiesStore';
import { useCommunityPermissions } from '../../hooks/useCommunityPermissions';
import { useToast, SimpleToast } from '../../components/common/Toast';
import { ROUTES } from '../../routes/paths';

export function CommunityEventDetailPage() {
  const { id, eventId } = useParams<{ id: string; eventId: string }>();
  const evento = useCommunitiesStore((s) => s.eventos.find((e) => e.id === eventId));
  const rsvpEvent = useCommunitiesStore((s) => s.rsvpEvent);
  const removeEvent = useCommunitiesStore((s) => s.removeEvent);
  const { puedeParticipar, puedeModerar } = useCommunityPermissions(id ?? '');
  const { toast, showToast } = useToast();
  const [showCancel, setShowCancel] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  if (!evento) return <Navigate to={ROUTES.communities.events(id ?? '')} replace />;

  const confirmados = evento.participantes.filter((p) => p.estado === 'confirmado');
  const miParticipacion = evento.participantes.find((p) => p.miembroId === CURRENT_MEMBER_ID)?.estado ?? 'ninguno';
  const lleno = evento.cupoMax != null && confirmados.length >= evento.cupoMax && miParticipacion !== 'confirmado';

  return (
    <div className="flex flex-col gap-4">
      <EventHeader evento={evento} confirmados={confirmados.length} />

      <div className="fp-com-card flex flex-wrap items-center gap-3">
        {miParticipacion === 'ninguno' ? (
          <button
            type="button"
            className="fp-btn text-sm"
            style={{ background: 'var(--accent-pink)', color: '#fff' }}
            disabled={!puedeParticipar}
            onClick={() => {
              rsvpEvent(evento.id, lleno ? 'lista_espera' : 'confirmado');
              showToast(lleno ? 'Entraste en lista de espera' : 'Participación confirmada');
            }}
          >
            {lleno ? 'Unirme a lista de espera' : 'Confirmar participación'}
          </button>
        ) : (
          <button type="button" className="fp-btn fp-btn-secondary text-sm" onClick={() => setShowCancel(true)}>
            {miParticipacion === 'confirmado' ? 'Cancelar participación' : 'Salir de la lista de espera'}
          </button>
        )}

        <Link
          to={ROUTES.communities.eventParticipants(id ?? '', evento.id)}
          className="fp-btn fp-btn-ghost text-sm flex items-center gap-2"
        >
          <Users size={15} />
          Ver participantes
        </Link>

        {puedeModerar ? (
          <button
            type="button"
            className="fp-btn fp-btn-ghost text-sm flex items-center gap-2 ml-auto"
            style={{ color: 'var(--accent-red)' }}
            onClick={() => setShowDelete(true)}
          >
            <Trash2 size={15} />
            Eliminar evento
          </button>
        ) : null}
      </div>

      <ConfirmDialog
        open={showCancel}
        title="¿Cancelar tu participación?"
        description="Si el evento tiene lista de espera, tu lugar podría ocuparlo otro miembro."
        confirmLabel="Cancelar participación"
        danger
        onConfirm={() => {
          rsvpEvent(evento.id, 'ninguno');
          showToast('Participación cancelada');
        }}
        onClose={() => setShowCancel(false)}
      />

      <ConfirmDialog
        open={showDelete}
        title="¿Eliminar este evento?"
        description="Se notificará implícitamente a los participantes al desaparecer de sus listas. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        danger
        onConfirm={() => removeEvent(evento.id)}
        onClose={() => setShowDelete(false)}
      />

      <SimpleToast {...toast} />
    </div>
  );
}
