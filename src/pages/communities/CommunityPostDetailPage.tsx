import { useParams, Navigate } from 'react-router-dom';
import { PostCard } from '../../components/communities/cards/PostCard';
import { CommentItem } from '../../components/communities/feed/CommentItem';
import { CommentComposer } from '../../components/communities/feed/CommentComposer';
import { PageBackRow } from '../../components/common/PageBackButton';
import { Skeleton } from '../../components/common/Skeleton';
import { useComunidadPosts, useAddComentario } from '../../lib/gateway/hooks';
import { useCommunityPermissions } from '../../hooks/useCommunityPermissions';
import { ROUTES } from '../../routes/paths';
import { getCommunityPostsBack } from '../../utils/communityBackUtils';

export function CommunityPostDetailPage() {
  const { id, postId } = useParams<{ id: string; postId: string }>();
  const { data: posts = [], isLoading } = useComunidadPosts(id);
  const post = posts.find((p) => p.id === postId);
  const addComment = useAddComentario(id ?? '');
  const { puedeParticipar } = useCommunityPermissions(id ?? '');

  if (isLoading) {
    return <Skeleton height={240} className="rounded-2xl" />;
  }

  if (!post) return <Navigate to={ROUTES.communities.posts(id ?? '')} replace />;

  const back = getCommunityPostsBack(id ?? '');

  return (
    <div className="flex flex-col gap-4">
      <PageBackRow to={back.to} label={back.label} />
      <PostCard post={post} linkToDetail={false} />

      <div className="fp-com-card">
        <h2 className="font-sora font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
          Comentarios ({post.comentarios.length})
        </h2>

        <div className="flex flex-col gap-3">
          {post.comentarios.map((c) => (
            <CommentItem key={c.id} comentario={c} />
          ))}
        </div>

        {puedeParticipar ? (
          <div className="mt-4">
            <CommentComposer
              onSubmit={(texto) => addComment.mutate({ postId: post.id, texto })}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
