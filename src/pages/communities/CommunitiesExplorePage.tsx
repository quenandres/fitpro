import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Plus, Search, Users } from 'lucide-react';
import { CommunityCard } from '../../components/communities/cards/CommunityCard';
import { ExploreFiltersSheet } from '../../components/communities/modals/ExploreFiltersSheet';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Skeleton } from '../../components/common/Skeleton';
import { useToast, SimpleToast } from '../../components/common/Toast';
import {
  CURRENT_MEMBER_ID,
  useCommunitiesStore,
} from '../../store/useCommunitiesStore';
import type { CategoriaComunidad } from '../../types/community';
import { usePlatformRole } from '../../hooks/usePlatformRole';
import { ROUTES } from '../../routes/paths';

type ExploreTab = 'para-ti' | 'mis-comunidades' | 'descubrir';

const TABS: Array<{ key: ExploreTab; label: string }> = [
  { key: 'para-ti', label: 'Para ti' },
  { key: 'mis-comunidades', label: 'Mis comunidades' },
  { key: 'descubrir', label: 'Descubrir' },
];

export function CommunitiesExplorePage() {
  const [searchParams] = useSearchParams();
  const demoState = searchParams.get('state');
  const [tab, setTab] = useState<ExploreTab>('para-ti');
  const [search, setSearch] = useState('');
  const [categorias, setCategorias] = useState<CategoriaComunidad[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { toast, showToast } = useToast();
  const { isSuperadmin } = usePlatformRole();

  const comunidades = useCommunitiesStore((s) => s.comunidades);
  const miembros = useCommunitiesStore((s) => s.miembros);
  const joinCommunity = useCommunitiesStore((s) => s.joinCommunity);

  const misComunidadIds = useMemo(
    () => new Set(miembros.filter((m) => m.id === CURRENT_MEMBER_ID).map((m) => m.comunidadId)),
    [miembros],
  );

  const filtered = useMemo(() => {
    let list = comunidades;
    if (tab === 'mis-comunidades') list = list.filter((c) => misComunidadIds.has(c.id));
    if (tab === 'descubrir') list = list.filter((c) => !misComunidadIds.has(c.id));
    if (categorias.length > 0) list = list.filter((c) => categorias.includes(c.categoria));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => c.nombre.toLowerCase().includes(q) || c.descripcion.toLowerCase().includes(q));
    }
    return list;
  }, [comunidades, tab, misComunidadIds, categorias, search]);

  if (demoState === 'loading') {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={200} className="rounded-2xl" />
        ))}
      </div>
    );
  }

  if (demoState === 'error') {
    return <ErrorState onRetry={() => window.location.assign(window.location.pathname)} />;
  }

  return (
    <div className="animate-slide-up">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="font-sora text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Comunidades
        </h1>
        {isSuperadmin ? (
          <Link
            to={ROUTES.communities.create}
            className="fp-btn fp-btn-primary inline-flex items-center gap-1.5 shrink-0"
          >
            <Plus size={16} />
            Crear comunidad
          </Link>
        ) : null}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <div className="fp-input-group flex-1">
          <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="search"
            placeholder="Buscar comunidades…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="fp-btn fp-btn-secondary flex items-center gap-1.5 relative"
          onClick={() => setShowFilters(true)}
          aria-label="Filtros"
        >
          <Filter size={16} />
          {categorias.length > 0 ? (
            <span
              className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-[10px] font-bold"
              style={{ width: 16, height: 16, background: 'var(--accent-pink)', color: '#fff' }}
            >
              {categorias.length}
            </span>
          ) : null}
        </button>
      </div>

      <div className="flex gap-1 mt-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className="fp-com-tab"
            style={
              tab === t.key
                ? { background: 'var(--accent-pink-dim)', color: 'var(--accent-pink)' }
                : undefined
            }
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No hay comunidades"
          description="Prueba con otra categoría, otro término de búsqueda o revisa más tarde."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {filtered.map((comunidad) => (
            <CommunityCard
              key={comunidad.id}
              comunidad={comunidad}
              esMiembro={misComunidadIds.has(comunidad.id)}
              onJoin={() => {
                joinCommunity(comunidad.id);
                showToast(`Te uniste a ${comunidad.nombre}`);
              }}
            />
          ))}
        </div>
      )}

      <ExploreFiltersSheet
        open={showFilters}
        onClose={() => setShowFilters(false)}
        selected={categorias}
        onToggle={(categoria) =>
          setCategorias((prev) =>
            prev.includes(categoria) ? prev.filter((c) => c !== categoria) : [...prev, categoria],
          )
        }
        onClear={() => setCategorias([])}
      />

      <SimpleToast {...toast} />
    </div>
  );
}
