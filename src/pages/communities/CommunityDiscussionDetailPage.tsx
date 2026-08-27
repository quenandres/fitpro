import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Lock, Pin, PinOff, Trash2, Unlock } from 'lucide-react';
import { Avatar } from '../../components/common/Avatar';
import { ActionMenu } from '../../components/common/ActionMenu';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { CommentComposer } from '../../components/communities/feed/CommentComposer';
import { useCommunitiesStore, useMemberById } from '../../store/useCommunitiesStore';
import { useCommunityPermissions } from '../../hooks/useCommunityPermissions';
import { ROUTES } from '../../routes/paths';

export function CommunityDiscussionDetailPage() {
  const { id, discussionId } = useParams<{ id: string; discussionId: string }>();
  const discusion = useCommunitiesStore((s) => s.discusiones.find((d) => d.id === discussionId));
  const addDiscussionReply = useCommunitiesStore((s) => s.addDiscussionReply);
  const toggleDiscussionPin = useCommunitiesStore((s) => s.toggleDiscussionPin);
  const toggleDiscussionClose = useCommunitiesStore((s) => s.toggleDiscussionClose);
  const removeDiscussion = useCommunitiesStore((s) => s.removeDiscussion);
  const { puedeParticipar, puedeModerar } = useCommunityPermissions(id ?? '');
  const autor = useMemberById(discusion?.autorId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  if (!discusion) return <Navigate to={ROUTES.communities.discussions(id ?? '')} replace />;

  return (
    <div className="flex flex-col gap-4">
      <div className="fp-com-card">
        <div className="flex items-start gap-3">
          <Avatar src={autor?.avatarUrl} nombre={autor?.nombre ?? '?'} size={38} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{autor?.nombre ?? 'Miembro'}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
                new Date(discusion.creadaEn),
              )}
              {discusion.fijada ? ' · Fijada' : ''}
              {discusion.cerrada ? ' · Cerrada' : ''}
            </p>
          </div>
          {puedeModerar ? (
            <ActionMenu
              open={menuOpen}
              onOpenChange={setMenuOpen}
              ariaLabel="Opciones de la discusión"
              items={[
                {
                  key: 'pin',
                  label: discusion.fijada ? 'Dejar de fijar' : 'Fijar discusión',
                  icon: discusion.fijada ? PinOff : Pin,
                  onSelect: () => toggleDiscussionPin(discusion.id),
                },
                {
                  key: 'close',
                  label: discusion.cerrada ? 'Reabrir discusión' : 'Cerrar discusión',
                  icon: discusion.cerrada ? Unlock : Lock,
                  onSelect: () => toggleDiscussionClose(discusion.id),
                },
                {
                  key: 'delete',
                  label: 'Eliminar',
                  icon: Trash2,
                  danger: true,
                  onSelect: () => setShowDelete(true),
                },
              ]}
            />
          ) : null}
        </div>

        <h1 className="font-sora text-lg font-bold mt-3" style={{ color: 'var(--text-primary)' }}>
          {discusion.titulo}
        </h1>
        <p className="text-sm mt-2 whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
          {discusion.texto}
        </p>
      </div>

      <div className="fp-com-card">
        <h2 className="font-sora font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
          Respuestas ({discusion.respuestas.length})
        </h2>

        <div className="flex flex-col gap-3">
          {discusion.respuestas.map((r) => (
            <ReplyRow key={r.id} autorId={r.autorId} texto={r.texto} creadoEn={r.creadoEn} />
          ))}
        </div>

        {puedeParticipar && !discusion.cerrada ? (
          <div className="mt-4">
            <CommentComposer
              placeholder="Escribe una respuesta…"
              onSubmit={(texto) => addDiscussionReply(discusion.id, texto)}
            />
          </div>
        ) : discusion.cerrada ? (
          <p className="text-xs mt-4 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
            <Lock size={12} />
            Esta discusión está cerrada, no se admiten más respuestas.
          </p>
        ) : null}
      </div>

      <ConfirmDialog
        open={showDelete}
        title="¿Eliminar esta discusión?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        danger
        onConfirm={() => removeDiscussion(discusion.id)}
        onClose={() => setShowDelete(false)}
      />
    </div>
  );
}

function ReplyRow({ autorId, texto, creadoEn }: { autorId: string; texto: string; creadoEn: string }) {
  const autor = useMemberById(autorId);
  return (
    <div className="flex items-start gap-2.5">
      <Avatar src={autor?.avatarUrl} nombre={autor?.nombre ?? '?'} size={30} />
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl px-3 py-2" style={{ background: 'var(--bg-overlay)' }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{autor?.nombre ?? 'Miembro'}</p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{texto}</p>
        </div>
        <p className="text-[11px] mt-1 ml-3" style={{ color: 'var(--text-muted)' }}>
          {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
            new Date(creadoEn),
          )}
        </p>
      </div>
    </div>
  );
}
