import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PostTypeSheet } from '../../components/communities/modals/PostTypeSheet';
import { PostComposer } from '../../components/communities/feed/PostComposer';
import { PageBackRow } from '../../components/common/PageBackButton';
import { useCreatePublicacion } from '../../lib/gateway/hooks';
import { useCommunityPermissions } from '../../hooks/useCommunityPermissions';
import { ROUTES } from '../../routes/paths';
import { getCommunityPostsBack } from '../../utils/communityBackUtils';
import type { TipoPost } from '../../types/community';

/** Crear publicación — full-screen en móvil, tarjeta en desktop (mismo componente, ancho `narrow` del shell). */
export function CommunityPostCreatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const createPost = useCreatePublicacion(id ?? '');
  const { puedeModerar } = useCommunityPermissions(id ?? '');
  const [tipo, setTipo] = useState<TipoPost | null>(null);
  const [showTypeSheet, setShowTypeSheet] = useState(true);

  if (!id) return null;

  const goToFeed = () => navigate(ROUTES.communities.posts(id));
  const back = getCommunityPostsBack(id);

  return (
    <div className="fp-com-card">
      <PageBackRow to={back.to} label={back.label} />
      <h1 className="font-sora text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        Nueva publicación
      </h1>

      {tipo ? (
        <PostComposer
          tipo={tipo}
          onCancel={goToFeed}
          onSubmit={(texto) => {
            createPost.mutate({ texto, tipo }, { onSuccess: goToFeed });
          }}
        />
      ) : null}

      <PostTypeSheet
        open={showTypeSheet}
        onClose={() => {
          setShowTypeSheet(false);
          if (!tipo) goToFeed();
        }}
        onSelect={(selected) => {
          setTipo(selected);
          setShowTypeSheet(false);
        }}
        puedeAnunciar={puedeModerar}
      />
    </div>
  );
}
