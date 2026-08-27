import { Check, Mail, X } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { useCommunitiesStore, useMemberById } from '../../store/useCommunitiesStore';
import { useToast, SimpleToast } from '../../components/common/Toast';

export function CommunityInvitationsPage() {
  const invitaciones = useCommunitiesStore((s) => s.invitaciones);
  const comunidades = useCommunitiesStore((s) => s.comunidades);
  const respondInvitation = useCommunitiesStore((s) => s.respondInvitation);
  const { toast, showToast } = useToast();

  const pendientes = invitaciones.filter((i) => i.estado === 'pendiente');

  return (
    <div className="animate-slide-up">
      <h1 className="font-sora text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        Invitaciones
      </h1>

      {pendientes.length === 0 ? (
        <EmptyState icon={Mail} title="Sin invitaciones pendientes" description="Cuando alguien te invite a una comunidad, aparecerá aquí." />
      ) : (
        <div className="flex flex-col gap-3">
          {pendientes.map((inv) => {
            const comunidad = comunidades.find((c) => c.id === inv.comunidadId);
            return (
              <InvitationRow
                key={inv.id}
                invitadaPorId={inv.invitadaPorId}
                comunidadNombre={comunidad?.nombre ?? 'Comunidad'}
                comunidadAvatar={comunidad?.avatarUrl}
                onAccept={() => {
                  respondInvitation(inv.id, true);
                  showToast(`Te uniste a ${comunidad?.nombre ?? 'la comunidad'}`);
                }}
                onReject={() => respondInvitation(inv.id, false)}
              />
            );
          })}
        </div>
      )}

      <SimpleToast {...toast} />
    </div>
  );
}

function InvitationRow({
  invitadaPorId,
  comunidadNombre,
  comunidadAvatar,
  onAccept,
  onReject,
}: {
  invitadaPorId: string;
  comunidadNombre: string;
  comunidadAvatar?: string;
  onAccept: () => void;
  onReject: () => void;
}) {
  const invitadaPor = useMemberById(invitadaPorId);

  return (
    <div className="fp-com-card flex items-center gap-3">
      {comunidadAvatar ? <img src={comunidadAvatar} alt="" className="w-11 h-11 rounded-xl object-cover" /> : null}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{comunidadNombre}</p>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Invitado por {invitadaPor?.nombre ?? 'un miembro'}
        </p>
      </div>
      <button
        type="button"
        className="fp-btn shrink-0"
        style={{ background: 'var(--accent-pink)', color: '#fff', padding: '8px' }}
        onClick={onAccept}
        aria-label="Aceptar invitación"
      >
        <Check size={16} />
      </button>
      <button
        type="button"
        className="fp-btn fp-btn-secondary shrink-0"
        style={{ padding: '8px' }}
        onClick={onReject}
        aria-label="Rechazar invitación"
      >
        <X size={16} />
      </button>
    </div>
  );
}
