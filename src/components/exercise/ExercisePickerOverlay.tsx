import { useMemo, useState } from 'react';
import {
  Search,
  X,
  Check,
  Info,
  Dumbbell,
  BookOpen,
  RefreshCw,
  ChevronLeft,
} from 'lucide-react';
import type { GatewayExercise } from '../../lib/gateway/exercises.service';
import { getExerciseMedia } from '../../lib/gateway/exercises.service';
import { useGatewayExerciseBrowse } from '../../lib/gateway/hooks';
import type { Ejercicio } from '../../types';
import { musclesFromGrupoMuscular } from '../../utils/muscleCanonicalMap';
import { Sheet } from '../common/Sheet';
import { SkeletonCard } from '../common/Skeleton';
import { useDataStore } from '../../store/useDataStore';

export interface PickedExercise {
  ejercicio_id: number;
  nombre: string;
  unidad_id_default: number;
  exerciseDbId?: string;
  imageUrl?: string;
  musculos_anatomia?: string[];
}

type Tab = 'catalogo' | 'local';

interface Props {
  onClose: () => void;
  onSelect: (exercise: PickedExercise) => void;
  selectedExerciseIds?: number[];
  localExercises?: Ejercicio[];
  title?: string;
}

export const ExercisePickerOverlay = ({
  onClose,
  onSelect,
  selectedExerciseIds = [],
  localExercises,
  title = 'Seleccionar ejercicio',
}: Props) => {
  const storeEjercicios = useDataStore((s) => s.ejercicios);
  const localList = localExercises ?? storeEjercicios;

  const [tab, setTab] = useState<Tab>('catalogo');
  const [search, setSearch] = useState('');
  const [bodyPart, setBodyPart] = useState('');
  const [equip, setEquip] = useState('');
  const [localSearch, setLocalSearch] = useState('');
  const [previewItem, setPreviewItem] = useState<GatewayExercise | null>(null);

  const browse = useGatewayExerciseBrowse(search, {
    bodyPart: bodyPart || undefined,
    equipment: equip || undefined,
  });

  const bodyPartOptions = useMemo(() => {
    const values = new Set<string>();
    for (const row of browse.data?.data ?? []) values.add(row.body_part);
    return [...values].sort();
  }, [browse.data?.data]);

  const equipmentOptions = useMemo(() => {
    const values = new Set<string>();
    for (const row of browse.data?.data ?? []) values.add(row.equipment);
    return [...values].sort();
  }, [browse.data?.data]);

  const localFiltered = localList.filter((ej) => {
    const term = localSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      ej.nombre.toLowerCase().includes(term) ||
      ej.categoria.toLowerCase().includes(term) ||
      ej.grupo_muscular.some((g) => g.toLowerCase().includes(term))
    );
  });

  const handleSelectCatalog = async (item: GatewayExercise) => {
    if (selectedExerciseIds.includes(item.id)) return;

    let imageUrl: string | undefined = item.image_url || undefined;
    if (!imageUrl) {
      try {
        const media = await getExerciseMedia(item.id);
        imageUrl = media.imagen_url;
      } catch {
        imageUrl = undefined;
      }
    }

    onSelect({
      ejercicio_id: item.id,
      nombre: item.name,
      unidad_id_default: 1,
      imageUrl,
      musculos_anatomia: item.target ? [item.target] : undefined,
    });
    onClose();
  };

  const handleSelectLocal = (ej: Ejercicio) => {
    if (selectedExerciseIds.includes(ej.id)) return;
    const musculos_anatomia =
      ej.musculos_anatomia?.length
        ? ej.musculos_anatomia
        : musclesFromGrupoMuscular(ej.grupo_muscular);
    onSelect({
      ejercicio_id: ej.id,
      nombre: ej.nombre,
      unidad_id_default: ej.unidad_id_default,
      musculos_anatomia: musculos_anatomia.length ? musculos_anatomia : undefined,
    });
    onClose();
  };

  const renderCatalogRow = (item: GatewayExercise) => {
    const isSel = selectedExerciseIds.includes(item.id);
    const subtitle = `${item.body_part} · ${item.target}`;

    return (
      <div
        key={item.id}
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.image_url ? (
            <img
              src={item.image_url}
              alt=""
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Dumbbell size={18} color="var(--accent-blue)" />
          )}
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
          onClick={() => setPreviewItem(item)}
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
            onClick={() => void handleSelectCatalog(item)}
            aria-label="Añadir"
          >
            <Check size={14} color="var(--brand)" />
          </button>
        )}
      </div>
    );
  };

  const renderLocalRow = (ej: Ejercicio) => {
    const isSel = selectedExerciseIds.includes(ej.id);
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

  const catalogItems = browse.data?.data ?? [];
  const showCatalogPrompt = search.trim().length < 2 && !bodyPart && !equip;

  return (
    <Sheet
      open
      onClose={previewItem ? () => setPreviewItem(null) : onClose}
      flexColumn
      ariaLabel={previewItem ? `Detalle de ${previewItem.name}` : title}
      panelStyle={{ maxHeight: '85vh' }}
    >
      {previewItem ? (
        <CatalogPreview
          item={previewItem}
          onBack={() => setPreviewItem(null)}
          onSelect={() => void handleSelectCatalog(previewItem)}
        />
      ) : (
        <>
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: 'var(--border)',
            margin: '12px auto 0',
            flexShrink: 0,
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
            { id: 'catalogo' as const, label: 'Catálogo', Icon: BookOpen },
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

        {tab === 'catalogo' && (
          <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="fp-input-group mb-2.5">
              <Search size={14} color="var(--text-muted)" />
              <input
                placeholder="Buscar en catálogo (mín. 2 letras)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <select
                className="fp-input"
                style={{ padding: '7px 10px', fontSize: 12 }}
                value={bodyPart}
                onChange={(e) => setBodyPart(e.target.value)}
              >
                <option value="">Parte del cuerpo</option>
                {bodyPartOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
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
                {equipmentOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {tab === 'local' && (
          <div style={{ padding: '12px 16px 8px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="fp-input-group">
              <Search size={14} color="var(--text-muted)" />
              <input
                placeholder="Buscar ejercicios personalizados..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 24px' }}>
          {tab === 'catalogo' && browse.isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {tab === 'catalogo' && browse.isError && (
            <div style={{ textAlign: 'center', padding: '24px 8px' }}>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                Error al cargar ejercicios
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                {browse.error?.message ?? 'Verifica VITE_GATEWAY_URL y tu sesión'}
              </p>
              <button
                type="button"
                className="fp-btn fp-btn-secondary"
                style={{ gap: 6, fontSize: 12 }}
                onClick={() => void browse.refetch()}
              >
                <RefreshCw size={13} />
                Reintentar
              </button>
            </div>
          )}

          {tab === 'catalogo' && !browse.isLoading && !browse.isError && (
            <>
              {showCatalogPrompt && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>
                  Escribe al menos 2 letras o elige un filtro para buscar en el catálogo.
                </p>
              )}
              {!showCatalogPrompt && catalogItems.map(renderCatalogRow)}
              {!showCatalogPrompt && catalogItems.length === 0 && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 24 }}>
                  Sin resultados. Prueba otra búsqueda o filtros.
                </p>
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
        </>
      )}
    </Sheet>
  );
};

function CatalogPreview({
  item,
  onBack,
  onSelect,
}: {
  item: GatewayExercise;
  onBack: () => void;
  onSelect: () => void;
}) {
  return (
    <>
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <button
          type="button"
          className="fp-btn fp-btn-ghost"
          style={{ padding: '5px 7px', borderRadius: 9, gap: 4 }}
          onClick={onBack}
        >
          <ChevronLeft size={16} />
          Volver
        </button>
        <button
          type="button"
          className="fp-btn fp-btn-ghost"
          style={{ padding: '5px 7px', borderRadius: 9 }}
          onClick={onBack}
          aria-label="Cerrar detalle"
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
        {item.image_url ? (
          <div
            style={{
              width: '100%',
              aspectRatio: '16/10',
              borderRadius: 12,
              overflow: 'hidden',
              marginBottom: 14,
              background: 'var(--bg-overlay)',
            }}
          >
            <img
              src={item.image_url}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : null}
        <p className="font-sora" style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
          {item.name}
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          {item.body_part} · {item.equipment} · {item.target}
        </p>
        <button type="button" className="fp-btn fp-btn-primary w-full justify-center" onClick={onSelect}>
          Seleccionar
        </button>
      </div>
    </>
  );
}
