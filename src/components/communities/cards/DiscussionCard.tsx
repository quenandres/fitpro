import { Link } from 'react-router-dom';
import { Lock, MessageCircle, Pin } from 'lucide-react';
import { Avatar } from '../../common/Avatar';
import { useMemberById } from '../../../store/useCommunitiesStore';
import { ROUTES } from '../../../routes/paths';
import type { Discusion } from '../../../types/community';

export function DiscussionCard({ discusion }: { discusion: Discusion }) {
  const autor = useMemberById(discusion.autorId);

  return (
    <Link
      to={ROUTES.communities.discussion(discusion.comunidadId, discusion.id)}
      className="fp-com-card fp-com-card-hover block"
    >
      <div className="flex items-center gap-2">
        <Avatar src={autor?.avatarUrl} nombre={autor?.nombre ?? '?'} size={30} />
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{autor?.nombre ?? 'Miembro'}</span>
        {discusion.fijada ? <Pin size={12} style={{ color: 'var(--accent-pink)' }} /> : null}
        {discusion.cerrada ? <Lock size={12} style={{ color: 'var(--text-muted)' }} /> : null}
      </div>

      <h3 className="font-sora font-bold text-sm mt-2" style={{ color: 'var(--text-primary)' }}>
        {discusion.titulo}
      </h3>
      <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
        {discusion.texto}
      </p>

      <div className="flex items-center gap-1.5 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        <MessageCircle size={13} />
        {discusion.respuestas.length} respuestas
      </div>
    </Link>
  );
}
