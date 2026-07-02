import { useState } from 'react';
import { Search, X, BookOpen, SlidersHorizontal, Loader2 } from 'lucide-react';
import {
  useBodyParts,
  useEquipments,
  useExerciseTypes,
} from '../lib/exercisedb';
import type { ReferenceItem } from '../lib/exercisedb';
import { useExerciseBrowse } from '../hooks/useExerciseBrowse';
import { Navbar, BottomNav } from '../components/layout/Navbar';
import { ExerciseCard } from '../components/exercise/ExerciseCard';
import { ExerciseDetailModal } from '../components/exercise/ExerciseDetailModal';
import { SkeletonCard } from '../components/admin/common/Skeleton';

export const ExerciseLibrary = () => {
  const [search, setSearch] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [equip, setEquip] = useState('');
  const [exerciseType, setExerciseType] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: exerciseTypes = [] } = useExerciseTypes();
  const { data: bodyParts = [] } = useBodyParts();
  const { data: equipments = [] } = useEquipments();

  const {
    isSearching,
    displayItems,
    isLoading,
    isError,
    error,
    totalCount,
    listQuery,
    refetch,
  } = useExerciseBrowse(search, { exerciseType, bodyPart, equipment: equip });

  const hasFilters = Boolean(bodyPart || equip || exerciseType);
  const filterCount = [bodyPart, equip, exerciseType].filter(Boolean).length;
  const clearFilters = () => {
    setBodyPart('');
    setEquip('');
    setExerciseType('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      <Navbar />
      <BottomNav />

      <main
        className="max-w-md mx-auto"
        style={{ paddingTop: 70, paddingBottom: 80, paddingLeft: 16, paddingRight: 16 }}
      >
        <section className="animate-slide-up" style={{ paddingTop: 20, paddingBottom: 16 }}>
          <div style={{ marginBottom: 10 }}>
            <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
              <BookOpen size={10} style={{ marginRight: 3 }} />
              Biblioteca completa
            </span>
          </div>
          <h1
            className="font-sora"
            style={{
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '-.02em',
              color: 'var(--text-primary)',
              marginBottom: 4,
            }}
          >
            Ejercicios
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {isLoading ? 'Cargando ejercicios...' : `${totalCount} ejercicios disponibles`}
          </p>
        </section>

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
              placeholder="Buscar ejercicios..."
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
              borderColor: hasFilters ? 'rgba(34,197,94,.4)' : undefined,
              color: hasFilters ? 'var(--brand)' : undefined,
            }}
            onClick={() => setShowFilters((v) => !v)}
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
                  background: 'var(--brand)',
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

        {!isSearching && (
          <div
            className="animate-slide-up delay-150 scrollbar-hide flex gap-1.5 overflow-x-auto"
            style={{ paddingBottom: 4, marginBottom: 12 }}
          >
            {exerciseTypes.map((type: ReferenceItem) => (
              <button
                key={type.name}
                type="button"
                onClick={() =>
                  setExerciseType(exerciseType === type.name ? '' : type.name)
                }
                style={{
                  flexShrink: 0,
                  padding: '5px 12px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  whiteSpace: 'nowrap',
                  background:
                    exerciseType === type.name
                      ? 'rgba(34,197,94,.12)'
                      : 'var(--bg-elevated)',
                  color:
                    exerciseType === type.name
                      ? 'var(--brand-bright)'
                      : 'var(--text-secondary)',
                  border: `1px solid ${exerciseType === type.name ? 'rgba(34,197,94,.3)' : 'var(--border)'}`,
                  transition: 'all .15s',
                }}
              >
                {type.name}
              </button>
            ))}
          </div>
        )}

        {showFilters && (
          <div
            className="fp-card animate-slide-down"
            style={{ padding: 14, marginBottom: 12, borderRadius: 13 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Parte del cuerpo', val: bodyPart, set: setBodyPart, opts: bodyParts },
                { label: 'Equipo', val: equip, set: setEquip, opts: equipments },
              ].map(({ label, val, set, opts }) => (
                <div key={label}>
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
                    onChange={(e) => set(e.target.value)}
                  >
                    <option value="">Todos</option>
                    {opts.map((o: ReferenceItem) => (
                      <option key={o.name} value={o.name}>
                        {o.name}
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

        {hasFilters && !isSearching && (
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
            Mostrando{' '}
            <span style={{ color: 'var(--brand)', fontWeight: 600 }}>
              {displayItems.length}
            </span>{' '}
            ejercicios con filtros activos
          </p>
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
              {error?.message ?? 'Intenta de nuevo mas tarde'}
            </p>
            <button type="button" className="fp-btn fp-btn-secondary" onClick={() => refetch()}>
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !isError && displayItems.length > 0 && (
          <div
            className="animate-slide-up delay-200"
            style={{ display: 'flex', flexDirection: 'column', gap: 7 }}
          >
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
              Intenta con otros filtros o terminos de busqueda
            </p>
          </div>
        )}

        {!isSearching && !isLoading && !isError && listQuery.hasNextPage && (
          <div style={{ paddingTop: 16, paddingBottom: 8 }}>
            <button
              type="button"
              className="fp-btn fp-btn-secondary w-full"
              disabled={listQuery.isFetchingNextPage}
              onClick={() => void listQuery.fetchNextPage()}
            >
              {listQuery.isFetchingNextPage ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Cargando...
                </>
              ) : (
                'Cargar mas'
              )}
            </button>
          </div>
        )}
      </main>

      <ExerciseDetailModal exerciseId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
};
