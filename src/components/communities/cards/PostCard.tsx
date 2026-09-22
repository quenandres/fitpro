import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Pin, PinOff, Share2, Trash2 } from 'lucide-react';
import { Avatar } from '../../common/Avatar';
import { ActionMenu } from '../../common/ActionMenu';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { ReactionButton } from '../feed/ReactionButton';
import { ShareSheet } from '../modals/ShareSheet';
import { useAuth } from '../../../context/AuthContext';
import {
  useDeletePublicacion,
  useToggleReaccion,
  useUpdatePublicacion,
} from '../../../lib/gateway/hooks';
import { useCommunityPermissions } from '../../../hooks/useCommunityPermissions';
import { ROUTES } from '../../../routes/paths';
import type { Post, TipoReaccion } from '../../../types/community';

const TIPO_BADGE: Record<Post['tipo'], string> = {
  general: '',
  logro: 'Logro',
  pregunta: 'Pregunta',
  anuncio: 'Anuncio',
};

interface PostCardProps {
  post: Post;
  /** Enlace al detalle deshabilitado dentro de la propia página de detalle. */
  linkToDetail?: boolean;
}

export function PostCard({ post, linkToDetail = true }: PostCardProps) {
  const { user } = useAuth();
  const toggleReactionMut = useToggleReaccion(post.comunidadId);
  const updatePostMut = useUpdatePublicacion(post.comunidadId);
  const deletePostMut = useDeletePublicacion(post.comunidadId);
  const { puedeModerar } = useCommunityPermissions(post.comunidadId);
  const autorNombre = (post as Post & { autorNombre?: string }).autorNombre ?? 'Miembro';

  const [menuOpen, setMenuOpen] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const reactionCounts = (tipo: TipoReaccion) => post.reacciones.filter((r) => r.tipo === tipo).length;
  const myReaction = post.reacciones.find((r) => r.miembroId === user?.id)?.tipo;

  const detailPath = ROUTES.communities.post(post.comunidadId, post.id);

  const content = (
    <>
      <div className="fp-com-post-header">
        <Avatar src="" nombre={autorNombre} size={38} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {autorNombre}
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
              new Date(post.creadoEn),
            )}
            {TIPO_BADGE[post.tipo] ? ` · ${TIPO_BADGE[post.tipo]}` : ''}
            {post.fijado ? ' · Fijado' : ''}
          </p>
        </div>

        <ActionMenu
          open={menuOpen}
          onOpenChange={setMenuOpen}
          ariaLabel="Opciones de la publicación"
          items={[
            {
              key: 'share',
              label: 'Compartir',
              icon: Share2,
              onSelect: () => setShowShare(true),
            },
            ...(puedeModerar
              ? [
                  {
                    key: 'pin',
                    label: post.fijado ? 'Dejar de fijar' : 'Fijar publicación',
                    icon: post.fijado ? PinOff : Pin,
                    onSelect: () =>
                      updatePostMut.mutate({ postId: post.id, fijado: !post.fijado }),
                  },
                ]
              : []),
            ...(puedeModerar || post.autorId === user?.id
              ? [
                  {
                    key: 'delete',
                    label: 'Eliminar',
                    icon: Trash2,
                    danger: true,
                    onSelect: () => setShowDelete(true),
                  },
                ]
              : []),
          ]}
        />
      </div>

      <p className="text-sm mt-2.5 whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
        {post.texto}
      </p>

      <div className="fp-com-reaction-bar">
        <ReactionButton
          tipo="like"
          count={reactionCounts('like')}
          active={myReaction === 'like'}
          onToggle={() => toggleReactionMut.mutate({ postId: post.id, tipo: 'like' })}
        />
        <ReactionButton
          tipo="fuego"
          count={reactionCounts('fuego')}
          active={myReaction === 'fuego'}
          onToggle={() => toggleReactionMut.mutate({ postId: post.id, tipo: 'fuego' })}
        />
        <ReactionButton
          tipo="aplauso"
          count={reactionCounts('aplauso')}
          active={myReaction === 'aplauso'}
          onToggle={() => toggleReactionMut.mutate({ postId: post.id, tipo: 'aplauso' })}
        />
        <div className="flex-1" />
        {linkToDetail ? (
          <Link to={detailPath} className="fp-com-reaction-btn">
            <MessageCircle size={15} />
            {post.comentarios.length > 0 ? post.comentarios.length : null}
          </Link>
        ) : (
          <span className="fp-com-reaction-btn">
            <MessageCircle size={15} />
            {post.comentarios.length > 0 ? post.comentarios.length : null}
          </span>
        )}
      </div>
    </>
  );

  return (
    <article className="fp-com-card">
      {content}

      <ShareSheet open={showShare} onClose={() => setShowShare(false)} title="Publicación" path={detailPath} />
      <ConfirmDialog
        open={showDelete}
        title="¿Eliminar esta publicación?"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        danger
        onConfirm={() => deletePostMut.mutate(post.id)}
        onClose={() => setShowDelete(false)}
      />
    </article>
  );
}
