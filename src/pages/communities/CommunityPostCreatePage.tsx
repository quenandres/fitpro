import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PostTypeSheet } from '../../components/communities/modals/PostTypeSheet';
import { PostComposer } from '../../components/communities/feed/PostComposer';
import { useCommunitiesStore, CURRENT_MEMBER_ID } from '../../store/useCommunitiesStore';
import { useCommunityPermissions } from '../../hooks/useCommunityPermissions';
import { ROUTES } from '../../routes/paths';
import type { TipoPost } from '../../types/community';

/** Crear publicación — full-screen en móvil, tarjeta en desktop (mismo componente, ancho `narrow` del shell). */
export function CommunityPostCreatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addPost = useCommunitiesStore((s) => s.addPost);
  const { puedeModerar } = useCommunityPermissions(id ?? '');
  const [tipo, setTipo] = useState<TipoPost | null>(null);
  const [showTypeSheet, setShowTypeSheet] = useState(true);

  if (!id) return null;

  const goToFeed = () => navigate(ROUTES.communities.posts(id));

  return (
    <div className="fp-com-card">
      <h1 className="font-sora text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        Nueva publicación
      </h1>

      {tipo ? (
        <PostComposer
          tipo={tipo}
          onCancel={goToFeed}
          onSubmit={(texto, media) => {
            addPost({ comunidadId: id, autorId: CURRENT_MEMBER_ID, tipo, texto, media });
            goToFeed();
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
