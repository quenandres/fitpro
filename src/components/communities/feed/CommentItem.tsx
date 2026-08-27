import { Avatar } from '../../common/Avatar';
import { useMemberById } from '../../../store/useCommunitiesStore';
import type { Comentario } from '../../../types/community';

export function CommentItem({ comentario }: { comentario: Comentario }) {
  const autor = useMemberById(comentario.autorId);

  return (
    <div className="flex items-start gap-2.5">
      <Avatar src={autor?.avatarUrl} nombre={autor?.nombre ?? '?'} size={30} />
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl px-3 py-2" style={{ background: 'var(--bg-overlay)' }}>
          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            {autor?.nombre ?? 'Miembro'}
          </p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>
            {comentario.texto}
          </p>
        </div>
        <p className="text-[11px] mt-1 ml-3" style={{ color: 'var(--text-muted)' }}>
          {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
            new Date(comentario.creadoEn),
          )}
        </p>
      </div>
    </div>
  );
}
