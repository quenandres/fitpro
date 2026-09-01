import { useMemo, useState } from 'react';
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
  useExerciseCatalog,
  useGatewayBodyParts,
  useGatewayEquipments,
  useGatewayExerciseBrowse,
  useGatewayMuscles,
} from '../../lib/gateway/hooks/useExercises';
import { getExerciseById } from '../../lib/gateway/exercises.service';
import type { Ejercicio } from '../../types';
import { musclesFromExerciseDb, musclesFromGrupoMuscular } from '../../utils/muscleCanonicalMap';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { SkeletonCard } from '../common/Skeleton';
import { Sheet } from '../common/Sheet';

export interface PickedExercise {
  nombre: string;
  unidad_id_default: number;
  ejercicio_id?: number;
  exerciseDbId?: string;
  imageUrl?: string;
  musculos_anatomia?: string[];
}

interface CatalogItem {
  exerciseId: string;
  name: string;
  imageUrl?: string;
  bodyPart?: string;
  target?: string;
}

interface Props {
  onClose: () => void;
  onSelect: (exercise: PickedExercise) => void;
  selectedNames?: string[];
  localExercises?: Ejercicio[];
  title?: string;
}

export const ExercisePickerOverlay = ({
  onClose,
  onSelect,
  selectedNames = [],
  localExercises,
  title = 'Seleccionar ejercicio',
}: Props) => {
  const { data: catalogEjercicios = [] } = useExerciseCatalog();
  const localList = localExercises ?? catalogEjercicios;

  const [tab, setTab] = useState<'catalog' | 'local'>('catalog');
  const [search, setSearch] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [equip, setEquip] = useState('');
  const [muscle, setMuscle] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState('');

  const { data: bodyParts = [] } = useGatewayBodyParts();
  const { data: equipments = [] } = useGatewayEquipments();
  const { data: muscles = [] } = useGatewayMuscles();

  const browse = useGatewayExerciseBrowse(search, { bodyPart, equipment: equip, muscle });

  const catalogItems: CatalogItem[] = useMemo(
    () =>
      browse.displayItems.map((item) => ({
        exerciseId: String(item.id),
        name: item.name,
        imageUrl: item.imageUrl,
        bodyPart: item.bodyPart,
        target: item.target,
      })),
    [browse.displayItems],
  );

  const localFiltered = localList.filter((ej) => {
    const term = localSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      ej.nombre.toLowerCase().includes(term) ||
      ej.categoria.toLowerCase().includes(term) ||
      ej.grupo_muscular.some((g) => g.toLowerCase().includes(term))
    );
  });

  const handleSelectCatalog = async (item: CatalogItem) => {
    if (selectedNames.includes(item.name)) return;

    let musculos_anatomia: string[] | undefined;
    try {
      const detail = await getExerciseById(Number(item.exerciseId));
      musculos_anatomia = musclesFromExerciseDb(
        detail.target ? [detail.target] : [],
        detail.muscle_group ? [detail.muscle_group] : [],
      );
    } catch {
      musculos_anatomia = item.target ? [item.target] : undefined;
    }

    onSelect({
      nombre: item.name,
      unidad_id_default: 1,
      ejercicio_id: Number(item.exerciseId),
      exerciseDbId: item.exerciseId,
      imageUrl: item.imageUrl,
      musculos_anatomia,
    });
    onClose();
  };

  const handleSelectLocal = (ej: Ejercicio) => {
    if (selectedNames.includes(ej.nombre)) return;
    const musculos_anatomia =
      ej.musculos_anatomia?.length
        ? ej.musculos_anatomia
        : musclesFromGrupoMuscular(ej.grupo_muscular);
    onSelect({
      nombre: ej.nombre,
      unidad_id_default: ej.unidad_id_default,
      ejercicio_id: ej.id,
      exerciseDbId: String(ej.id),
      musculos_anatomia: musculos_anatomia.length ? musculos_anatomia : undefined,
    });
    onClose();
  };

  const renderCatalogRow = (item: CatalogItem) => {
    const isSel = selectedNames.includes(item.name);
    const subtitle = [item.bodyPart, item.target].filter(Boolean).join(' · ');

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
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => !isSel && void handleSelectCatalog(item)}
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
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
            {item.name}
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{subtitle || 'Catálogo Supabase'}</p>
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
        {isSel ? <Check size={14} color="var(--brand)" style={{ flexShrink: 0 }} /> : null}
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
          textAlign: 'left',
          padding: '10px 12px',
          borderRadius: 11,
          border: `1px solid ${isSel ? 'rgba(34,197,94,.3)' : 'var(--border)'}`,
          background: isSel ? 'rgba(34,197,94,.06)' : 'var(--bg-elevated)',
          marginBottom: 6,
          cursor: isSel ? 'default' : 'pointer',
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{ej.nombre}</p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ej.categoria}</p>
      </button>
    );
  };

  return (
    <>
      <Sheet
        open
        onClose={onClose}
        zIndex={60}
        flexColumn
        ariaLabel={title}
        panelStyle={{ maxHeight: '85vh' }}
      >
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <p className="font-sora" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            {title}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 4, padding: '10px 16px 0' }}>
          {([
            { id: 'catalog' as const, label: 'Catálogo', Icon: BookOpen },
            { id: 'local' as const, label: 'Listado', Icon: Dumbbell },
          ]).map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className="fp-btn fp-btn-ghost flex-1 gap-1.5 text-xs"
                style={{
                  color: active ? 'var(--brand)' : 'var(--text-muted)',
                  borderBottom: active ? '2px solid var(--brand)' : '2px solid transparent',
                  borderRadius: 0,
                }}
              >
                <Icon size={13} />
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 16px' }}>
          {tab === 'catalog' ? (
            <>
              <div className="fp-input-group mb-2">
                <Search size={14} />
                <input
                  className="fp-input"
                  placeholder="Buscar en catálogo…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                <select className="fp-input text-xs" value={bodyPart} onChange={(e) => setBodyPart(e.target.value)}>
                  <option value="">Parte del cuerpo</option>
                  {bodyParts.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <select className="fp-input text-xs" value={equip} onChange={(e) => setEquip(e.target.value)}>
                  <option value="">Equipo</option>
                  {equipments.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <select className="fp-input text-xs" value={muscle} onChange={(e) => setMuscle(e.target.value)}>
                  <option value="">Músculo</option>
                  {muscles.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {browse.isLoading && (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {browse.isError && (
                <div className="text-center py-6">
                  <p className="text-sm text-secondary mb-2">Error al cargar ejercicios</p>
                  <button type="button" className="fp-btn fp-btn-secondary" onClick={() => void browse.refetch()}>
                    <RefreshCw size={14} /> Reintentar
                  </button>
                </div>
              )}

              {!browse.isLoading && !browse.isError && catalogItems.map(renderCatalogRow)}

              {browse.hasNextPage && (
                <button
                  type="button"
                  className="fp-btn fp-btn-secondary w-full mt-2"
                  disabled={browse.isFetchingNextPage}
                  onClick={() => void browse.fetchNextPage()}
                >
                  {browse.isFetchingNextPage ? <Loader2 size={14} className="animate-spin" /> : 'Cargar más'}
                </button>
              )}
            </>
          ) : (
            <>
              <input
                className="fp-input mb-3"
                placeholder="Filtrar listado…"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
              {localFiltered.map(renderLocalRow)}
            </>
          )}
        </div>

        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button type="button" className="fp-btn fp-btn-secondary w-full" onClick={onClose}>
            <X size={14} /> Cerrar
          </button>
        </div>
      </Sheet>

      <ExerciseDetailModal exerciseId={previewId} onClose={() => setPreviewId(null)} />
    </>
  );
};
