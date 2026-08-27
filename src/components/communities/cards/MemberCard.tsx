import type { ReactNode } from 'react';
import { Avatar } from '../../common/Avatar';
import { RoleBadge } from '../shared/RoleBadge';
import type { MiembroComunidad } from '../../../types/community';

interface MemberCardProps {
  miembro: MiembroComunidad;
  onClick?: () => void;
  /** Slot para acciones (ej. `ActionMenu`) a la derecha de la fila. */
  actions?: ReactNode;
}

export function MemberCard({ miembro, onClick, actions }: MemberCardProps) {
  return (
    <div className="fp-com-card flex items-center gap-3">
      <button
        type="button"
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
        onClick={onClick}
      >
        <Avatar src={miembro.avatarUrl} nombre={miembro.nombre} size={44} />
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
            {miembro.nombre}
            {miembro.suspendido ? (
              <span className="ml-2 text-xs font-medium" style={{ color: 'var(--accent-red)' }}>
                Suspendido
              </span>
            ) : null}
          </p>
          <div className="mt-1">
            <RoleBadge rol={miembro.rol} />
          </div>
        </div>
      </button>

      {actions}
    </div>
  );
}
