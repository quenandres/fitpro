import { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Trash2, Users } from 'lucide-react';
import { EventHeader } from '../../components/communities/events/EventHeader';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PageBackRow } from '../../components/common/PageBackButton';
import { Skeleton } from '../../components/common/Skeleton';
import {
  useCancelarEvento,
  useComunidadEvento,
  useConfirmarEvento,
  useDeleteEvento,
} from '../../lib/gateway/hooks';
import { useCommunityPermissions } from '../../hooks/useCommunityPermissions';
import { useToastHook } from '../../components/common/Toast';
import { ROUTES } from '../../routes/paths';
import { getCommunityEventsBack } from '../../utils/communityBackUtils';

export function CommunityEventDetailPage() {
  const { id, eventId } = useParams<{ id: string; eventId: string }>();
  const { data: evento, isLoading } = useComunidadEvento(id ?? '', eventId ?? '');
  const confirmar = useConfirmarEvento(id ?? '');
  const cancelar = useCancelarEvento(id ?? '');
  const deleteEvent = useDeleteEvento(id ?? '');
  const { puedeParticipar, puedeModerar } = useCommunityPermissions(id ?? '');
  const toast = useToastHook();
  const [showCancel, setShowCancel] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) {
    return <Skeleton height={240} className="rounded-2xl" />;
  }

  if (!evento) return <Navigate to={ROUTES.communities.events(id ?? '')} replace />;

  const confirmados = evento.participantes.filter((p) => p.estado === 'confirmado');
  const miParticipacion = evento.estadoParticipacion ?? 'ninguno';
  const lleno =
    evento.cupoMax != null &&
    confirmados.length >= evento.cupoMax &&
    miParticipacion !== 'confirmado';
  const back = getCommunityEventsBack(id ?? '');

  return (
    <div className="flex flex-col gap-4">
      <PageBackRow to={back.to} label={back.label} />
      <EventHeader evento={evento} confirmados={confirmados.length} />

      <div className="fp-com-card flex flex-wrap items-center gap-3">
        {miParticipacion === 'ninguno' ? (
          <button
            type="button"
            className="fp-btn text-sm"
            style={{ background: 'var(--accent-pink)', color: '#fff' }}
            disabled={!puedeParticipar || confirmar.isPending}
            onClick={() => {
              confirmar.mutate(evento.id, {
                onSuccess: (updated) => {
                  const estado = updated.estadoParticipacion ?? 'confirmado';
                  toast.success(
                    estado === 'lista_espera'
                      ? 'Entraste en lista de espera'
                      : 'Participación confirmada',
                  );
                },
              });
            }}
          >
            {lleno ? 'Unirme a lista de espera' : 'Confirmar participación'}
          </button>
        ) : (
          <button
            type="button"
            className="fp-btn fp-btn-secondary text-sm"
            onClick={() => setShowCancel(true)}
          >
            {miParticipacion === 'confirmado'
              ? 'Cancelar participación'
              : 'Salir de la lista de espera'}
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
            className="fp-btn fp-btn-ghost text-sm flex items-center gap-2"
            style={{ color: 'var(--danger)' }}
            onClick={() => setShowDelete(true)}
          >
            <Trash2 size={15} />
            Eliminar evento
          </button>
        ) : null}
      </div>

      <ConfirmDialog
        open={showCancel}
        title="¿Cancelar participación?"
        description="Podrás volver a confirmar si quedan plazas."
        confirmLabel="Cancelar participación"
        danger
        onConfirm={() => {
          cancelar.mutate(evento.id, {
            onSuccess: () => toast.success('Participación cancelada'),
          });
        }}
        onClose={() => setShowCancel(false)}
      />

      <ConfirmDialog
        open={showDelete}
        title="¿Eliminar evento?"
        description="Se eliminarán también las confirmaciones de participación."
        confirmLabel="Eliminar"
        danger
        onConfirm={() => {
          deleteEvent.mutate(evento.id, {
            onSuccess: () => {
              toast.success('Evento eliminado');
              window.location.assign(ROUTES.communities.events(id ?? ''));
            },
          });
        }}
        onClose={() => setShowDelete(false)}
      />
    </div>
  );
}
