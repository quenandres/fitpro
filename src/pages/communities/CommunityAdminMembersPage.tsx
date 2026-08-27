import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowDownCircle, ArrowUpCircle, ShieldCheck, ShieldOff, UserX } from 'lucide-react';
import { MemberCard } from '../../components/communities/cards/MemberCard';
import { ActionMenu } from '../../components/common/ActionMenu';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useCommunitiesStore, useCommunityMembers } from '../../store/useCommunitiesStore';
import type { MiembroComunidad } from '../../types/community';

export function CommunityAdminMembersPage() {
  const { id } = useParams<{ id: string }>();
  const miembros = useCommunityMembers(id);
  const updateMemberRole = useCommunitiesStore((s) => s.updateMemberRole);
  const toggleMemberSuspend = useCommunitiesStore((s) => s.toggleMemberSuspend);
  const removeMember = useCommunitiesStore((s) => s.removeMember);
  const [menuMemberId, setMenuMemberId] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<MiembroComunidad | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-sora text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
        Gestión de miembros
      </h1>

      <div className="flex flex-col gap-2">
        {miembros.map((miembro) => (
          <MemberCard
            key={miembro.id}
            miembro={miembro}
            actions={
              miembro.rol !== 'leader' ? (
                <ActionMenu
                  open={menuMemberId === miembro.id}
                  onOpenChange={(open) => setMenuMemberId(open ? miembro.id : null)}
                  ariaLabel={`Gestionar a ${miembro.nombre}`}
                  items={[
                    miembro.rol === 'member'
                      ? {
                          key: 'promote',
                          label: 'Promover a moderador',
                          icon: ArrowUpCircle,
                          onSelect: () => updateMemberRole(miembro.id, 'moderator'),
                        }
                      : {
                          key: 'demote',
                          label: 'Degradar a miembro',
                          icon: ArrowDownCircle,
                          onSelect: () => updateMemberRole(miembro.id, 'member'),
                        },
                    {
                      key: 'suspend',
                      label: miembro.suspendido ? 'Reactivar' : 'Suspender',
                      icon: miembro.suspendido ? ShieldCheck : ShieldOff,
                      onSelect: () => toggleMemberSuspend(miembro.id),
                    },
                    {
                      key: 'remove',
                      label: 'Eliminar de la comunidad',
                      icon: UserX,
                      danger: true,
                      onSelect: () => setRemoveTarget(miembro),
                    },
                  ]}
                />
              ) : undefined
            }
          />
        ))}
      </div>

      <ConfirmDialog
        open={removeTarget !== null}
        title={`¿Eliminar a ${removeTarget?.nombre}?`}
        description="Perderá el acceso a la comunidad de forma inmediata."
        confirmLabel="Eliminar"
        danger
        onConfirm={() => {
          if (removeTarget) removeMember(removeTarget.id);
        }}
        onClose={() => setRemoveTarget(null)}
      />
    </div>
  );
}
