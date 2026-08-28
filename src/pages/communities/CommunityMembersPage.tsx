import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, ShieldCheck, ShieldOff, UserPlus, UserX, Users } from 'lucide-react';
import { MemberCard } from '../../components/communities/cards/MemberCard';
import { MemberProfileSheet } from '../../components/communities/modals/MemberProfileSheet';
import { InviteMembersSheet } from '../../components/communities/modals/InviteMembersSheet';
import { ActionMenu } from '../../components/common/ActionMenu';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast, SimpleToast } from '../../components/common/Toast';
import {
  useCommunitiesStore,
  useCommunityMembers,
} from '../../store/useCommunitiesStore';
import { useCommunityPermissions } from '../../hooks/useCommunityPermissions';
import type { MiembroComunidad, RolComunidad } from '../../types/community';

type RoleFilter = 'all' | RolComunidad;

export function CommunityMembersPage() {
  const { id } = useParams<{ id: string }>();
  const miembros = useCommunityMembers(id);
  const { puedeModerar, puedeParticipar } = useCommunityPermissions(id ?? '');
  const toggleMemberSuspend = useCommunitiesStore((s) => s.toggleMemberSuspend);
  const removeMember = useCommunitiesStore((s) => s.removeMember);
  const { toast, showToast } = useToast();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [profileMember, setProfileMember] = useState<MiembroComunidad | null>(null);
  const [menuMemberId, setMenuMemberId] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<MiembroComunidad | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  const filtered = useMemo(() => {
    let list = miembros;
    if (roleFilter !== 'all') list = list.filter((m) => m.rol === roleFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((m) => m.nombre.toLowerCase().includes(q));
    }
    return list;
  }, [miembros, roleFilter, search]);

  const roleFilters: Array<{ key: RoleFilter; label: string }> = [
    { key: 'all', label: 'Todos' },
    { key: 'leader', label: 'Líderes' },
    { key: 'moderator', label: 'Moderadores' },
    { key: 'member', label: 'Miembros' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-sora text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          Miembros ({miembros.length})
        </h1>
        {puedeParticipar ? (
          <button
            type="button"
            className="fp-btn text-sm flex items-center gap-2"
            style={{ background: 'var(--accent-pink)', color: '#fff' }}
            onClick={() => setShowInvite(true)}
          >
            <UserPlus size={15} />
            Invitar
          </button>
        ) : null}
      </div>

      <div className="fp-input-group">
        <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="search"
          placeholder="Buscar miembro…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {roleFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            className="fp-com-tab"
            style={roleFilter === f.key ? { background: 'var(--accent-pink-dim)', color: 'var(--accent-pink)' } : undefined}
            onClick={() => setRoleFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="Sin resultados" description="No hay miembros que coincidan con la búsqueda." />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((miembro) => (
            <MemberCard
              key={miembro.id}
              miembro={miembro}
              onClick={() => setProfileMember(miembro)}
              actions={
                puedeModerar && miembro.rol !== 'leader' ? (
                  <ActionMenu
                    open={menuMemberId === miembro.id}
                    onOpenChange={(open) => setMenuMemberId(open ? miembro.id : null)}
                    ariaLabel={`Opciones de ${miembro.nombre}`}
                    items={[
                      {
                        key: 'suspend',
                        label: miembro.suspendido ? 'Reactivar miembro' : 'Suspender miembro',
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
      )}

      <MemberProfileSheet miembro={profileMember} onClose={() => setProfileMember(null)} />

      <InviteMembersSheet
        open={showInvite}
        onClose={() => setShowInvite(false)}
        onInvited={(count) => showToast(`Invitación enviada a ${count} persona${count === 1 ? '' : 's'}`)}
      />

      <SimpleToast {...toast} />

      <ConfirmDialog
        open={removeTarget !== null}
        title={`¿Eliminar a ${removeTarget?.nombre}?`}
        description="Perderá el acceso a la comunidad y su contenido dejará de contar en las estadísticas."
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
