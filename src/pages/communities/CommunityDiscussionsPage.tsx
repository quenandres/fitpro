import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquareText, Plus } from 'lucide-react';
import { DiscussionCard } from '../../components/communities/cards/DiscussionCard';
import { CreateDiscussionSheet } from '../../components/communities/modals/CreateDiscussionSheet';
import { EmptyState } from '../../components/common/EmptyState';
import { useCommunitiesStore, useCommunityDiscussions, CURRENT_MEMBER_ID } from '../../store/useCommunitiesStore';
import { useCommunityPermissions } from '../../hooks/useCommunityPermissions';

type Filtro = 'todas' | 'fijadas' | 'cerradas';

export function CommunityDiscussionsPage() {
  const { id } = useParams<{ id: string }>();
  const discusiones = useCommunityDiscussions(id);
  const addDiscussion = useCommunitiesStore((s) => s.addDiscussion);
  const { puedeParticipar } = useCommunityPermissions(id ?? '');
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(() => {
    let list = discusiones;
    if (filtro === 'fijadas') list = list.filter((d) => d.fijada);
    if (filtro === 'cerradas') list = list.filter((d) => d.cerrada);
    return [...list].sort((a, b) => {
      if (a.fijada !== b.fijada) return a.fijada ? -1 : 1;
      return new Date(b.creadaEn).getTime() - new Date(a.creadaEn).getTime();
    });
  }, [discusiones, filtro]);

  if (!id) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-sora text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          Discusiones
        </h1>
        {puedeParticipar ? (
          <button
            type="button"
            className="fp-btn text-sm flex items-center gap-2"
            style={{ background: 'var(--accent-pink)', color: '#fff' }}
            onClick={() => setShowCreate(true)}
          >
            <Plus size={15} />
            Nueva
          </button>
        ) : null}
      </div>

      <div className="flex gap-1">
        {(['todas', 'fijadas', 'cerradas'] as Filtro[]).map((f) => (
          <button
            key={f}
            type="button"
            className="fp-com-tab"
            style={filtro === f ? { background: 'var(--accent-pink-dim)', color: 'var(--accent-pink)' } : undefined}
            onClick={() => setFiltro(f)}
          >
            {f === 'todas' ? 'Todas' : f === 'fijadas' ? 'Fijadas' : 'Cerradas'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={MessageSquareText} title="No hay discusiones" description="Inicia una conversación con la comunidad." />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((d) => (
            <DiscussionCard key={d.id} discusion={d} />
          ))}
        </div>
      )}

      <CreateDiscussionSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={(titulo, texto) => addDiscussion({ comunidadId: id, autorId: CURRENT_MEMBER_ID, titulo, texto })}
      />
    </div>
  );
}
