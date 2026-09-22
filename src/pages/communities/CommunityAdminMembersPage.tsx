import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowDownCircle, ArrowUpCircle, ShieldCheck, ShieldOff, UserX } from 'lucide-react';
import { MemberCard } from '../../components/communities/cards/MemberCard';
import { ActionMenu } from '../../components/common/ActionMenu';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useComunidadMiembros, useRemoveMiembro, useUpdateMiembro } from '../../lib/gateway/hooks';
import type { MiembroComunidad } from '../../types/community';

export function CommunityAdminMembersPage() {
  const { id } = useParams<{ id: string }>();
  const { data: miembros = [] } = useComunidadMiembros(id);
  const updateMember = useUpdateMiembro(id ?? '');
  const removeMember = useRemoveMiembro(id ?? '');
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
                          onSelect: () =>
                            updateMember.mutate({ userId: miembro.id, rol: 'moderator' }),
                        }
                      : {
                          key: 'demote',
                          label: 'Degradar a miembro',
                          icon: ArrowDownCircle,
                          onSelect: () =>
                            updateMember.mutate({ userId: miembro.id, rol: 'member' }),
                        },
                    {
                      key: 'suspend',
                      label: miembro.suspendido ? 'Reactivar' : 'Suspender',
                      icon: miembro.suspendido ? ShieldCheck : ShieldOff,
                      onSelect: () =>
                        updateMember.mutate({
                          userId: miembro.id,
                          suspendido: !miembro.suspendido,
                        }),
                    },
                    {
                      key: 'remove',
                      label: 'Expulsar',
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
        title={`¿Expulsar a ${removeTarget?.nombre}?`}
        description="Perderá acceso inmediato a la comunidad."
        confirmLabel="Expulsar"
        danger
        onConfirm={() => {
          if (removeTarget) removeMember.mutate(removeTarget.id);
        }}
        onClose={() => setRemoveTarget(null)}
      />
    </div>
  );
}
