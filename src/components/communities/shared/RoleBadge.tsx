import { Crown, ShieldCheck, User } from 'lucide-react';
import type { RolComunidad } from '../../../types/community';

const META: Record<RolComunidad, { label: string; icon: typeof Crown; className: string }> = {
  leader: { label: 'Líder', icon: Crown, className: 'fp-com-role-leader' },
  moderator: { label: 'Moderador', icon: ShieldCheck, className: 'fp-com-role-moderator' },
  member: { label: 'Miembro', icon: User, className: 'fp-com-role-member' },
};

export function RoleBadge({ rol }: { rol: RolComunidad }) {
  const { label, icon: Icon, className } = META[rol];
  return (
    <span className={`fp-com-role-badge ${className}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}
