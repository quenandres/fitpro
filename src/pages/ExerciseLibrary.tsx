import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, BookOpen, SlidersHorizontal, Loader2 } from 'lucide-react';
import {
  useGatewayBodyParts,
  useGatewayEquipments,
  useGatewayExerciseBrowse,
  useGatewayMuscles,
} from '../lib/gateway/hooks/useExercises';
import type { GatewayExerciseListItem } from '../lib/gateway/adapters/exerciseAdapter';
import { ExerciseCard } from '../components/exercise/ExerciseCard';
import { ExerciseDetailModal } from '../components/exercise/ExerciseDetailModal';
import { SkeletonCard } from '../components/common/Skeleton';

const FILTER_KEYS = ['bodyPart', 'equipment', 'muscle'] as const;

type FilterKey = (typeof FILTER_KEYS)[number];

function toCardItem(item: GatewayExerciseListItem) {
  return {
    exerciseId: String(item.id),
    name: item.name,
    imageUrl: item.imageUrl ?? '',
    keywords: [] as string[],
    bodyParts: item.bodyPart ? [item.bodyPart] : [],
    equipments: item.equipment ? [item.equipment] : [],
    targetMuscles: item.target ? [item.target] : [],
    secondaryMuscles: [] as string[],
    exerciseType: item.bodyPart ?? 'General',
  };
}

export const ExerciseLibrary = ({ embedded = false }: { embedded?: boolean }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const bodyPart = searchParams.get('bodyPart') ?? '';
  const equip = searchParams.get('equipment') ?? '';
  const muscle = searchParams.get('muscle') ?? '';

  const { data: bodyParts = [] } = useGatewayBodyParts();
  const { data: equipments = [] } = useGatewayEquipments();
  const { data: muscles = [] } = useGatewayMuscles();

  const setFilter = useCallback(
    (key: FilterKey, value: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set(key, value);
          else next.delete(key);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const key of FILTER_KEYS) next.delete(key);
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const browse = useGatewayExerciseBrowse(search, { bodyPart, equipment: equip, muscle });

  const displayItems = useMemo(
    () => browse.displayItems.map(toCardItem),
    [browse.displayItems],
  );

  const activeFilters = useMemo(
    () =>
      [
        bodyPart && { key: 'bodyPart' as const, label: bodyPart },
        equip && { key: 'equipment' as const, label: equip },
        muscle && { key: 'muscle' as const, label: muscle },
      ].filter(Boolean) as Array<{ key: FilterKey; label: string }>,
    [bodyPart, equip, muscle],
  );

  const hasFilters = activeFilters.length > 0;
  const filterCount = activeFilters.length;
  const isLoading = browse.isLoading;
  const isError = browse.isError;
  const error = browse.error;
  const totalCount = browse.totalCount;

  const filterSelects: Array<{
    label: string;
    key: FilterKey;
    val: string;
    opts: string[];
  }> = [
    { label: 'Parte del cuerpo', key: 'bodyPart', val: bodyPart, opts: bodyParts },
    { label: 'Equipo', key: 'equipment', val: equip, opts: equipments },
    { label: 'Músculo', key: 'muscle', val: muscle, opts: muscles },
  ];

  return (
    <div>
      {!embedded && (
      <section className="animate-slide-up" style={{ paddingBottom: 14 }}>
        <div style={{ marginBottom: 10 }}>
          <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
            <BookOpen size={10} style={{ marginRight: 3 }} />
            Catálogo
          </span>
        </div>
        <h1
          className="font-sora"
          style={{
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-.02em',
            color: 'var(--text-primary)',
            marginBottom: 4,
          }}
        >
          Catálogo de ejercicios
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {isLoading
            ? 'Cargando ejercicios…'
            : `${totalCount} ejercicios${hasFilters ? ' (filtrados)' : ' disponibles'}`}
        </p>
      </section>
      )}

      <div className="animate-slide-up delay-100 flex gap-2" style={{ marginBottom: 12 }}>
        <div className="relative flex-1">
          <Search
            size={14}
            color="var(--text-muted)"
            style={{
              position: 'absolute',
              left: 11,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
          <input
            className="fp-input"
            style={{ paddingLeft: 32 }}
            type="text"
            placeholder="Buscar ejercicios…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="fp-btn fp-btn-secondary relative"
          style={{
            width: 40,
            height: 40,
            padding: 0,
            borderRadius: 11,
            flexShrink: 0,
            borderColor: hasFilters ? 'rgba(88,166,255,.4)' : undefined,
            color: hasFilters ? '#58a6ff' : undefined,
          }}
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          aria-label="Mostrar filtros"
        >
          <SlidersHorizontal size={16} />
          {filterCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#58a6ff',
                color: '#fff',
                fontSize: 9,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {filterCount}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div
          className="fp-card animate-slide-down"
          style={{ padding: 14, marginBottom: 12, borderRadius: 13 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filterSelects.map(({ label, key, val, opts }) => (
              <div key={key}>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    marginBottom: 5,
                    textTransform: 'uppercase',
                    letterSpacing: '.05em',
                  }}
                >
                  {label}
                </p>
                <select
                  className="fp-input"
                  style={{ padding: '8px 12px' }}
                  value={val}
                  onChange={(e) => setFilter(key, e.target.value)}
                >
                  <option value="">Todos</option>
                  {opts.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {hasFilters && (
              <button
                type="button"
                className="fp-btn fp-btn-ghost"
                style={{ color: 'var(--accent-red)', width: '100%' }}
                onClick={clearFilters}
              >
                <X size={14} /> Limpiar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {hasFilters && (
        <div
          className="scrollbar-hide flex gap-1.5 overflow-x-auto"
          style={{ marginBottom: 10, paddingBottom: 2 }}
        >
          {activeFilters.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key, '')}
              style={{
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 9px',
                borderRadius: 100,
                fontSize: 11,
                fontWeight: 600,
                background: 'rgba(88,166,255,.12)',
                color: '#58a6ff',
                border: '1px solid rgba(88,166,255,.3)',
                cursor: 'pointer',
              }}
            >
              {label}
              <X size={11} />
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {isError && (
        <div className="animate-fade-in text-center" style={{ paddingTop: 48 }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            Error al cargar ejercicios
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            {error?.message ?? 'Intenta de nuevo más tarde'}
          </p>
          <button type="button" className="fp-btn fp-btn-secondary" onClick={() => void browse.refetch()}>
            Reintentar
          </button>
        </div>
      )}

      {!isLoading && !isError && displayItems.length > 0 && (
        <div className="animate-slide-up delay-200 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {displayItems.map((item, i) => (
            <div
              key={item.exerciseId}
              className="animate-slide-up"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <ExerciseCard item={item} onClick={() => setSelectedId(item.exerciseId)} />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && displayItems.length === 0 && (
        <div className="animate-fade-in text-center" style={{ paddingTop: 48 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'var(--bg-overlay)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <Search size={22} color="var(--text-muted)" />
          </div>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            Sin resultados
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Intenta con otros filtros o términos de búsqueda
          </p>
        </div>
      )}

      {!isLoading && !isError && browse.hasNextPage && (
        <div style={{ paddingTop: 16, paddingBottom: 8 }}>
          <button
            type="button"
            className="fp-btn fp-btn-secondary w-full"
            disabled={browse.isFetchingNextPage}
            onClick={() => void browse.fetchNextPage()}
          >
            {browse.isFetchingNextPage ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Cargando…
              </>
            ) : (
              'Cargar más'
            )}
          </button>
        </div>
      )}

      <ExerciseDetailModal exerciseId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
};
