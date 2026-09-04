import { useState } from 'react';
import { LogOut, Share2, UserPlus } from 'lucide-react';
import type { Comunidad } from '../../../types/community';
import { CATEGORY_META } from '../shared/categoryMeta';
import { CommunityStats } from '../shared/CommunityStats';
import { ShareSheet } from '../modals/ShareSheet';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { ROUTES } from '../../../routes/paths';
import { useCommunitiesStore } from '../../../store/useCommunitiesStore';
import { useCommunityPermissions } from '../../../hooks/useCommunityPermissions';
import { useToastHook } from '../../common/Toast';

interface CommunityHeaderProps {
  comunidad: Comunidad;
}

export function CommunityHeader({ comunidad }: CommunityHeaderProps) {
  const [showShare, setShowShare] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const toast = useToastHook();
  const joinCommunity = useCommunitiesStore((s) => s.joinCommunity);
  const leaveCommunity = useCommunitiesStore((s) => s.leaveCommunity);
  const { esMiembro } = useCommunityPermissions(comunidad.id);
  const { label } = CATEGORY_META[comunidad.categoria];

  return (
    <div className="fp-com-header">
      <img src={comunidad.portadaUrl} alt="" className="fp-com-header-cover" />
      <div className="fp-com-header-body">
        <div className="fp-com-header-top">
          <img src={comunidad.avatarUrl} alt="" width={64} height={64} className="fp-com-header-avatar" />
        </div>

        <div>
          <p className="text-xs font-semibold" style={{ color: 'var(--accent-pink)' }}>{label}</p>
          <h1 className="font-sora text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {comunidad.nombre}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {comunidad.descripcion}
          </p>
        </div>

        <CommunityStats comunidad={comunidad} />

        <div className="fp-com-header-actions">
          {esMiembro ? (
            <button
              type="button"
              className="fp-btn fp-btn-secondary flex items-center gap-2 text-sm"
              onClick={() => setShowLeave(true)}
            >
              <LogOut size={15} />
              Salir de la comunidad
            </button>
          ) : (
            <button
              type="button"
              className="fp-btn flex items-center gap-2 text-sm"
              style={{ background: 'var(--accent-pink)', color: '#fff' }}
              onClick={() => {
                joinCommunity(comunidad.id);
                toast.success('Te uniste a la comunidad');
              }}
            >
              <UserPlus size={15} />
              Unirme
            </button>
          )}
          <button
            type="button"
            className="fp-btn fp-btn-ghost flex items-center gap-2 text-sm"
            onClick={() => setShowShare(true)}
          >
            <Share2 size={15} />
            Compartir
          </button>
        </div>
      </div>

      <ShareSheet
        open={showShare}
        onClose={() => setShowShare(false)}
        title={comunidad.nombre}
        path={ROUTES.communities.home(comunidad.id)}
      />

      <ConfirmDialog
        open={showLeave}
        title="¿Salir de la comunidad?"
        description="Dejarás de ver sus publicaciones, eventos y discusiones. Puedes volver a unirte cuando quieras."
        confirmLabel="Salir"
        danger
        onConfirm={() => {
          leaveCommunity(comunidad.id);
          toast.success('Saliste de la comunidad');
        }}
        onClose={() => setShowLeave(false)}
      />
    </div>
  );
}
