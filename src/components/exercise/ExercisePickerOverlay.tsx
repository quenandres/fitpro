import { useState } from 'react';
import {
  Search,
  X,
  Check,
  Loader2,
  Info,
  Dumbbell,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import {
  useBodyParts,
  useEquipments,
  useExerciseTypes,
} from '../../lib/exercisedb';
import type { ExerciseListItem, ExerciseSearchItem, ReferenceItem } from '../../lib/exercisedb';
import { useExerciseBrowse } from '../../hooks/useExerciseBrowse';
import { useDataStore } from '../../store/useDataStore';
import type { Ejercicio } from '../../types';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { SkeletonCard } from '../admin/common/Skeleton';

export interface PickedExercise {
  nombre: string;
  unidad_id_default: number;
  ejercicio_id?: number;
  exerciseDbId?: string;
}

type Tab = 'api' | 'local';

interface Props {
  onClose: () => void;
  onSelect: (exercise: PickedExercise) => void;
  selectedNames?: string[];
  localExercises?: Ejercicio[];
  title?: string;
}

const isApiItem = (
  item: ExerciseListItem | ExerciseSearchItem | Ejercicio,
): item is ExerciseListItem | ExerciseSearchItem =>
  'exerciseId' in item;

export const ExercisePickerOverlay = ({
  onClose,
  onSelect,
  selectedNames = [],
  localExercises,
  title = 'Seleccionar ejercicio',
}: Props) => {
  const storeEjercicios = useDataStore((s) => s.ejercicios);
  const localList = localExercises ?? storeEjercicios;

  const [tab, setTab] = useState<Tab>('api');
  const [search, setSearch] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [equip, setEquip] = useState('');
  const [exerciseType, setExerciseType] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState('');

  const { data: exerciseTypes = [] } = useExerciseTypes();
  const { data: bodyParts = [] } = useBodyParts();
  const { data: equipments = [] } = useEquipments();

  const browse = useExerciseBrowse(search, { exerciseType, bodyPart, equipment: equip });

  const localFiltered = localList.filter((ej) => {
    const term = localSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      ej.nombre.toLowerCase().includes(term) ||
      ej.categoria.toLowerCase().includes(term) ||
      ej.grupo_muscular.some((g) => g.toLowerCase().includes(term))
    );
  });

  const handleSelectApi = (item: ExerciseListItem | ExerciseSearchItem) => {
    if (selectedNames.includes(item.name)) return;
    onSelect({
      nombre: item.name,
      unidad_id_default: 1,
      exerciseDbId: item.exerciseId,
    });
    onClose();
  };

  const handleSelectLocal = (ej: Ejercicio) => {
    if (selectedNames.includes(ej.nombre)) return;
    onSelect({
      nombre: ej.nombre,
      unidad_id_default: ej.unidad_id_default,
      ejercicio_id: ej.id,
    });
    onClose();
  };

  const renderApiRow = (item: ExerciseListItem | ExerciseSearchItem) => {
    const isSel = selectedNames.includes(item.name);
    const subtitle =
      'exerciseType' in item
        ? `${item.exerciseType} · ${item.targetMuscles.slice(0, 2).join(', ')}`
        : 'Ejercicio';

    return (
      <div
        key={item.exerciseId}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px',
          borderRadius: 11,
          border: `1px solid ${isSel ? 'rgba(34,197,94,.3)' : 'var(--border)'}`,
          background: isSel ? 'rgba(34,197,94,.06)' : 'var(--bg-elevated)',
          marginBottom: 6,
          opacity: isSel ? 0.75 : 1,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 9,
            overflow: 'hidden',
            flexShrink: 0,
            background: 'rgba(88,166,255,.12)',
            border: '1px solid rgba(88,166,255,.2)',
          }}
        >
          <img
            src={item.imageUrl}
            alt=""
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <button
          type="button"
          onClick={() => !isSel && handleSelectApi(item)}
          disabled={isSel}
          style={{
            flex: 1,
            minWidth: 0,
            background: 'none',
            border: 'none',
            cursor: isSel ? 'default' : 'pointer',
            textAlign: 'left',
            padding: 0,
          }}
        >
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.name}
          </p>
          <p
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </p>
        </button>
        <button
          type="button"
          className="fp-btn fp-btn-ghost"
          style={{ padding: '5px 7px', borderRadius: 8, flexShrink: 0 }}
          onClick={() => setPreviewId(item.exerciseId)}
          aria-label="Ver detalle"
        >
          <Info size={14} color="var(--accent-blue)" />
        </button>
        {isSel ? (
          <Check size={14} color="var(--brand)" style={{ flexShrink: 0 }} />
        ) : (
          <button
            type="button"
            className="fp-btn fp-btn-ghost"
            style={{ padding: '5px 7px', borderRadius: 8, flexShrink: 0 }}
            onClick={() => handleSelectApi(item)}
            aria-label="Añadir"
          >
            <Check size={14} color="var(--brand)" />
          </button>
        )}
      </div>
    );
  };

  const renderLocalRow = (ej: Ejercicio) => {
    const isSel = selectedNames.includes(ej.nombre);
    return (
      <button
        key={ej.id}
        type="button"
        onClick={() => !isSel && handleSelectLocal(ej)}
        disabled={isSel}
        style={{
          width: '100%',
          padding: '11px 12px',
          borderRadius: 11,
          border: `1px solid ${isSel ? 'rgba(34,197,94,.3)' : 'var(--border)'}`,
          background: isSel ? 'rgba(34,197,94,.06)' : 'var(--bg-elevated)',
          cursor: isSel ? 'default' : 'pointer',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
          textAlign: 'left',
          opacity: isSel ? 0.7 : 1,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
            {ej.nombre}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {ej.categoria} · {ej.grupo_muscular.slice(0, 2).join(', ')}
          </p>
        </div>
        {isSel && <Check size={14} color="var(--brand)" />}
      </button>
    );
  };

  return (
    <>
      <div
        className="animate-fade-in"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          background: 'rgba(0,0,0,.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
        onClick={onClose}
      >
        <div
          className="fp-card animate-slide-up"
          style={{
            width: '100%',
            maxWidth: 480,
            borderRadius: '20px 20px 0 0',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: 'var(--border)',
              margin: '12px auto 0',
            }}
          />

          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <p
              className="font-sora"
              style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}
            >
              {title}
            </p>
            <button
              type="button"
              className="fp-btn fp-btn-ghost"
              style={{ padding: '5px 7px', borderRadius: 9 }}
              onClick={onClose}
            >
              <X size={16} />
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 4,
              padding: '10px 16px 0',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {([
              { id: 'api' as const, label: 'Biblioteca API', Icon: BookOpen },
              { id: 'local' as const, label: 'Mis ejercicios', Icon: Dumbbell },
            ]).map(({ id, label, Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '8px 10px',
                    borderRadius: '10px 10px 0 0',
                    border: 'none',
                    borderBottom: active ? '2px solid var(--brand)' : '2px solid transparent',
                    background: active ? 'var(--bg-overlay)' : 'transparent',
                    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <Icon size={13} color={active ? 'var(--brand)' : 'var(--text-muted)'} />
                  {label}
                </button>
              );
            })}
          </div>

          {tab === 'api' && (
            <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ position: 'relative', marginBottom: 10 }}>
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
                  style={{ paddingLeft: 32, fontSize: 13 }}
                  placeholder="Buscar en ExerciseDB..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {!browse.isSearching && (
                <>
                  <div
                    className="scrollbar-hide"
                    style={{
                      display: 'flex',
                      gap: 6,
                      overflowX: 'auto',
                      paddingBottom: 8,
                      marginBottom: 8,
                    }}
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
                          padding: '4px 11px',
                          borderRadius: 100,
                          border: `1px solid ${exerciseType === type.name ? 'rgba(34,197,94,.4)' : 'var(--border)'}`,
                          background:
                            exerciseType === type.name
                              ? 'rgba(34,197,94,.1)'
                              : 'var(--bg-elevated)',
                          color:
                            exerciseType === type.name
                              ? 'var(--brand)'
                              : 'var(--text-muted)',
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        {type.name}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <select
                      className="fp-input"
                      style={{ padding: '7px 10px', fontSize: 12 }}
                      value={bodyPart}
                      onChange={(e) => setBodyPart(e.target.value)}
                    >
                      <option value="">Parte del cuerpo</option>
                      {bodyParts.map((o: ReferenceItem) => (
                        <option key={o.name} value={o.name}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="fp-input"
                      style={{ padding: '7px 10px', fontSize: 12 }}
                      value={equip}
                      onChange={(e) => setEquip(e.target.value)}
                    >
                      <option value="">Equipo</option>
                      {equipments.map((o: ReferenceItem) => (
                        <option key={o.name} value={o.name}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'local' && (
            <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ position: 'relative' }}>
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
                  style={{ paddingLeft: 32, fontSize: 13 }}
                  placeholder="Buscar ejercicios personalizados..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
              </div>
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 24px' }}>
            {tab === 'api' && browse.isLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {tab === 'api' && browse.isError && (
              <div style={{ textAlign: 'center', padding: '24px 8px' }}>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Error al cargar ejercicios
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                  {browse.error?.message ?? 'Verifica VITE_RAPIDAPI_KEY en tu .env'}
                </p>
                <button
                  type="button"
                  className="fp-btn fp-btn-secondary"
                  style={{ gap: 6, fontSize: 12 }}
                  onClick={browse.refetch}
                >
                  <RefreshCw size={13} />
                  Reintentar
                </button>
              </div>
            )}

            {tab === 'api' && !browse.isLoading && !browse.isError && (
              <>
                {browse.displayItems.map((item) =>
                  isApiItem(item) ? renderApiRow(item) : null,
                )}
                {browse.displayItems.length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>
                    Sin resultados. Prueba otra búsqueda o filtros.
                  </p>
                )}
                {!browse.isSearching &&
                  browse.listQuery.hasNextPage &&
                  browse.displayItems.length > 0 && (
                    <button
                      type="button"
                      className="fp-btn fp-btn-secondary w-full"
                      style={{ marginTop: 8, gap: 6, fontSize: 12 }}
                      disabled={browse.listQuery.isFetchingNextPage}
                      onClick={() => void browse.listQuery.fetchNextPage()}
                    >
                      {browse.listQuery.isFetchingNextPage ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Cargando...
                        </>
                      ) : (
                        'Cargar más'
                      )}
                    </button>
                  )}
              </>
            )}

            {tab === 'local' && (
              <>
                {localFiltered.map(renderLocalRow)}
                {localFiltered.length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>
                    {localSearch
                      ? 'Sin ejercicios personalizados con ese filtro'
                      : 'No hay ejercicios personalizados. Créalos en Admin.'}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ExerciseDetailModal exerciseId={previewId} onClose={() => setPreviewId(null)} />
    </>
  );
};
