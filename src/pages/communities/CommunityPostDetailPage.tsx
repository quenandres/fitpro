import { useParams, Navigate } from 'react-router-dom';
import { PostCard } from '../../components/communities/cards/PostCard';
import { CommentItem } from '../../components/communities/feed/CommentItem';
import { CommentComposer } from '../../components/communities/feed/CommentComposer';
import { useCommunitiesStore } from '../../store/useCommunitiesStore';
import { useCommunityPermissions } from '../../hooks/useCommunityPermissions';
import { ROUTES } from '../../routes/paths';

export function CommunityPostDetailPage() {
  const { id, postId } = useParams<{ id: string; postId: string }>();
  const post = useCommunitiesStore((s) => s.posts.find((p) => p.id === postId));
  const addComment = useCommunitiesStore((s) => s.addComment);
  const { puedeParticipar } = useCommunityPermissions(id ?? '');

  if (!post) return <Navigate to={ROUTES.communities.posts(id ?? '')} replace />;

  return (
    <div className="flex flex-col gap-4">
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
            <CommentComposer onSubmit={(texto) => addComment(post.id, texto)} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
