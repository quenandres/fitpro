import { Sheet } from '../../common/Sheet';
import { Avatar } from '../../common/Avatar';
import { RoleBadge } from '../shared/RoleBadge';
import type { MiembroComunidad } from '../../../types/community';

interface MemberProfileSheetProps {
  miembro: MiembroComunidad | null;
  onClose: () => void;
}

/** Perfil contextual de un miembro, abierto desde `MemberCard`. */
export function MemberProfileSheet({ miembro, onClose }: MemberProfileSheetProps) {
  return (
    <Sheet open={miembro !== null} onClose={onClose} ariaLabel="Perfil del miembro">
      {miembro ? (
        <div className="p-5 flex flex-col items-center text-center">
          <Avatar src={miembro.avatarUrl} nombre={miembro.nombre} size={80} />
          <h2 className="font-sora text-lg font-bold mt-3" style={{ color: 'var(--text-primary)' }}>
            {miembro.nombre}
          </h2>
          <div className="mt-2">
            <RoleBadge rol={miembro.rol} />
          </div>
          {miembro.bio ? (
            <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {miembro.bio}
            </p>
          ) : null}
          <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            Miembro desde{' '}
            {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(
              new Date(miembro.unidoEn),
            )}
          </p>
        </div>
      ) : null}
    </Sheet>
  );
}
