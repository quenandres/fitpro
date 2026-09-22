import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Plus, Search, Users } from 'lucide-react';
import { CommunityCard } from '../../components/communities/cards/CommunityCard';
import { ExploreFiltersSheet } from '../../components/communities/modals/ExploreFiltersSheet';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Skeleton } from '../../components/common/Skeleton';
import { useToastHook } from '../../components/common/Toast';
import type { CategoriaComunidad } from '../../types/community';
import { usePlatformRole } from '../../hooks/usePlatformRole';
import { useComunidadesList, useJoinComunidad } from '../../lib/gateway/hooks';
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
  const toast = useToastHook();
  const { isSuperadmin } = usePlatformRole();
  const { data: comunidades = [], isLoading, isError, refetch } = useComunidadesList(tab, search);
  const joinMutation = useJoinComunidad();

  const filtered = useMemo(() => {
    let list = comunidades;
    if (categorias.length > 0) list = list.filter((c) => categorias.includes(c.categoria));
    return list;
  }, [comunidades, categorias]);

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

      <div className="fp-input-group mt-4">
        <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="search"
          placeholder="Buscar comunidades…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className="fp-btn fp-btn-ghost shrink-0"
          onClick={() => setShowFilters(true)}
          aria-label="Filtrar por categoría"
        >
          <Filter size={16} />
        </button>
      </div>

      <div className="flex gap-1 mt-3 overflow-x-auto">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className="fp-com-tab whitespace-nowrap"
            style={
              tab === key
                ? { background: 'var(--accent-pink-dim)', color: 'var(--accent-pink)' }
                : undefined
            }
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={200} className="rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={tab === 'mis-comunidades' ? 'Sin comunidades' : 'Nada por aquí'}
          description={
            tab === 'mis-comunidades'
              ? 'Aún no te has unido a ninguna comunidad.'
              : 'Prueba otra búsqueda o categoría.'
          }
        />
      ) : (
        <div className="flex flex-col gap-3 mt-4">
          {filtered.map((comunidad) => (
            <CommunityCard
              key={comunidad.id}
              comunidad={comunidad}
              esMiembro={comunidad.esMiembro ?? false}
              onJoin={() =>
                joinMutation.mutate(comunidad.id, {
                  onSuccess: () => toast.success(`Te uniste a ${comunidad.nombre}`),
                })
              }
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
            prev.includes(categoria)
              ? prev.filter((c) => c !== categoria)
              : [...prev, categoria],
          )
        }
        onClear={() => setCategorias([])}
      />
    </div>
  );
}
