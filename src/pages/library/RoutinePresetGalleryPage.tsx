import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Eye, LayoutGrid, LayoutTemplate, List, Loader2, Search } from 'lucide-react';
import { PageBackRow } from '../../components/common/PageBackButton';
import {
  PRESET_CATEGORY_LABELS,
  getPresetsByCategory,
  type PresetCategory,
  type RoutinePreset,
} from '../../data/routinePresets';
import { PRESET_GOAL_CHIPS } from '../../data/routineBuilderMock';
import { applyRoutinePreset } from '../../utils/applyRoutinePreset';
import { SelfTrainingRedirect } from '../../components/training/SelfTrainingRedirect';
import { LEVEL_ROUTES } from '../../hooks/useRoutineFormWithPreset';
import { ROUTES } from '../../routes/paths';
import { RoutineCreationMethodTabs } from '../../components/library/routines/RoutineCreationMethodTabs';
import { RoutineCreationLayout } from '../../components/library/routines/RoutineCreationLayout';
import { RoutineBlockParamsPanel } from '../../components/library/routines/RoutineBlockParamsPanel';
import { RoutineCreationChrome } from '../../components/library/routines/RoutineCreationChrome';
import { ROUTINE_PRESETS } from '../../data/routinePresets';

const LIBRARY_ACCENT = 'var(--accent-blue)';

const LEVEL_LABELS = {
  basica: 'Básica',
  intermedia: 'Intermedia',
  avanzada: 'Avanzada',
} as const;

function presetMatchesGoal(preset: RoutinePreset, goalId: string): boolean {
  if (goalId === 'all') return true;
  const chip = PRESET_GOAL_CHIPS.find((c) => c.id === goalId);
  if (!chip || !('match' in chip)) return true;
  const haystack = [
    preset.category,
    ...preset.tags,
    preset.categoria,
    preset.descripcion,
  ]
    .join(' ')
    .toLowerCase();
  return chip.match.some((m) => haystack.includes(m));
}

const PresetCard = ({
  preset,
  selected,
  loading,
  onSelect,
  onPreview,
}: {
  preset: RoutinePreset;
  selected: boolean;
  loading: boolean;
  onSelect: (preset: RoutinePreset) => void;
  onPreview: (preset: RoutinePreset) => void;
}) => (
  <article
    className="fp-card fp-card-hover animate-slide-up relative overflow-hidden"
    style={{
      padding: '14px 16px',
      borderColor: selected ? 'color-mix(in srgb, var(--accent-blue) 45%, transparent)' : undefined,
      opacity: loading ? 0.85 : 1,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
      <p className="font-sora" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
        {preset.nombre}
      </p>
      {selected ? (
        <span className="badge badge-brand" style={{ fontSize: 9, padding: '2px 6px' }}>
          <Check size={10} /> Seleccionada
        </span>
      ) : (
        <span className="badge badge-blue shrink-0" style={{ fontSize: 9, padding: '2px 6px' }}>
          {LEVEL_LABELS[preset.level]}
        </span>
      )}
    </div>
    <p
      style={{
        fontSize: 12,
        color: 'var(--text-muted)',
        lineHeight: 1.35,
        marginBottom: 10,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
    >
      {preset.descripcion}
    </p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
      <span
        className="badge"
        style={{
          fontSize: 9,
          padding: '2px 6px',
          background: 'var(--accent-blue-dim)',
          color: LIBRARY_ACCENT,
          border: '1px solid color-mix(in srgb, var(--accent-blue) 25%, transparent)',
        }}
      >
        {PRESET_CATEGORY_LABELS[preset.category]}
      </span>
      <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
        {preset.duracion_min} min · {preset.exercises.length} ejercicios
      </span>
    </div>
    <div style={{ display: 'flex', gap: 3, marginBottom: 10, flexWrap: 'wrap' }}>
      {['D1', 'D2', '—', 'D3', 'D4'].map((d) => (
        <span
          key={d}
          style={{
            fontSize: 9,
            fontWeight: 600,
            padding: '3px 6px',
            borderRadius: 6,
            background: d === '—' ? 'transparent' : 'var(--bg-overlay)',
            color: d === '—' ? 'var(--text-muted)' : 'var(--text-secondary)',
            border: d === '—' ? 'none' : '1px solid var(--border-subtle)',
          }}
        >
          {d === '—' ? 'Descanso' : d}
        </span>
      ))}
    </div>
    <div style={{ display: 'flex', gap: 6 }}>
      <button
        type="button"
        className="fp-btn fp-btn-ghost"
        style={{ flex: 1, justifyContent: 'center', fontSize: 11, gap: 4 }}
        onClick={() => onPreview(preset)}
      >
        <Eye size={13} /> Previsualizar
      </button>
      <button
        type="button"
        className="fp-btn fp-btn-secondary"
        style={{ flex: 1, justifyContent: 'center', fontSize: 11 }}
        disabled={loading}
        onClick={() => onSelect(preset)}
      >
        Seleccionar
      </button>
    </div>
  </article>
);

const PresetListRow = ({
  preset,
  selected,
  loading,
  onSelect,
  onPreview,
}: {
  preset: RoutinePreset;
  selected: boolean;
  loading: boolean;
  onSelect: (preset: RoutinePreset) => void;
  onPreview: (preset: RoutinePreset) => void;
}) => (
  <article
    className="fp-card fp-card-hover"
    style={{
      padding: '12px 14px',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 12,
      borderColor: selected ? 'color-mix(in srgb, var(--accent-blue) 45%, transparent)' : undefined,
    }}
  >
    <div style={{ flex: 1, minWidth: 200 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <p className="font-sora" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
          {preset.nombre}
        </p>
        <span className="badge badge-blue" style={{ fontSize: 9, padding: '2px 6px' }}>
          {LEVEL_LABELS[preset.level]}
        </span>
        {selected ? (
          <span className="badge badge-brand" style={{ fontSize: 9, padding: '2px 6px' }}>
            Seleccionada
          </span>
        ) : null}
      </div>
      <p
        style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          lineHeight: 1.35,
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {preset.descripcion}
      </p>
    </div>
    <p style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
      {preset.duracion_min} min · {preset.exercises.length} ej.
    </p>
    <div style={{ display: 'flex', gap: 6 }}>
      <button
        type="button"
        className="fp-btn fp-btn-ghost"
        style={{ fontSize: 11, padding: '6px 10px', gap: 4 }}
        onClick={() => onPreview(preset)}
      >
        <Eye size={13} /> Previsualizar
      </button>
      <button
        type="button"
        className="fp-btn fp-btn-secondary"
        style={{ fontSize: 11, padding: '6px 12px' }}
        disabled={loading}
        onClick={() => onSelect(preset)}
      >
        Seleccionar
      </button>
    </div>
  </article>
);

export const RoutinePresetGalleryPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState<PresetCategory | 'all'>('all');
  const [goal, setGoal] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<RoutinePreset | null>(null);
  const [preview, setPreview] = useState<RoutinePreset | null>(null);
  const [blockWeeks, setBlockWeeks] = useState(8);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const presets = useMemo(() => {
    let list = getPresetsByCategory(category);
    list = list.filter((p) => presetMatchesGoal(p, goal));
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [category, goal, query]);

  const handleApply = async (preset: RoutinePreset) => {
    setLoadingId(preset.id);
    setError(null);
    try {
      const { form, matchedCount, totalCount } = await applyRoutinePreset(preset);
      const formWithWeeks = { ...form, semanas: blockWeeks };
      navigate(LEVEL_ROUTES[preset.level], {
        state: {
          presetForm: formWithWeeks,
          presetName: preset.nombre,
          matchInfo: { matched: matchedCount, total: totalCount },
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la plantilla');
    } finally {
      setLoadingId(null);
    }
  };

  if (searchParams.get('para') === 'mi') return <SelfTrainingRedirect />;

  const main = (
    <>
      <PageBackRow
        to={ROUTES.library.rutinasNueva}
        label="Volver a métodos de creación"
        className="animate-slide-up"
      />

      <RoutineCreationChrome
        crumbs={[
          { label: 'Rutinas', to: ROUTES.library.rutinas },
          { label: 'Nueva rutina', to: ROUTES.library.rutinasNueva },
          { label: 'Plantillas predefinidas' },
        ]}
        title="Plantillas y arquitecturas de entrenamiento"
        subtitle="Selecciona una base validada, ajusta duración del bloque y continúa en el constructor paso a paso."
        badges={
          <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
            <LayoutTemplate size={10} style={{ marginRight: 3 }} />
            {ROUTINE_PRESETS.length} plantillas
          </span>
        }
      />

      <div className="flex flex-wrap gap-2 mb-3 animate-slide-up delay-100 items-stretch">
        <div className="fp-input-group flex-1 min-w-[200px]">
          <Search size={16} color="var(--text-muted)" />
          <input
            className="fp-input"
            placeholder="Buscar por objetivo, división o tag…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div
          className="flex shrink-0 p-0.5 rounded-[10px]"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          role="group"
          aria-label="Vista"
        >
          <button
            type="button"
            className="fp-btn fp-btn-ghost"
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              background: viewMode === 'grid' ? 'var(--bg-card)' : 'transparent',
            }}
            aria-pressed={viewMode === 'grid'}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            className="fp-btn fp-btn-ghost"
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              background: viewMode === 'list' ? 'var(--bg-card)' : 'transparent',
            }}
            aria-pressed={viewMode === 'list'}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      <div
        className="scrollbar-hide animate-slide-up delay-100 flex gap-1.5 overflow-x-auto mb-2"
        style={{ paddingBottom: 4 }}
      >
        {PRESET_GOAL_CHIPS.map(({ id, label }) => {
          const active = goal === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setGoal(id)}
              style={{
                flexShrink: 0,
                padding: '6px 12px',
                borderRadius: 100,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                background: active ? 'var(--text-primary)' : 'var(--bg-elevated)',
                color: active ? 'var(--bg-app)' : 'var(--text-secondary)',
                border: `1px solid ${active ? 'var(--text-primary)' : 'var(--border)'}`,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div
        className="scrollbar-hide flex gap-1.5 overflow-x-auto mb-3"
        style={{ paddingBottom: 4 }}
      >
        {(['all', ...Object.keys(PRESET_CATEGORY_LABELS)] as Array<PresetCategory | 'all'>).map(
          (id) => {
            const label = id === 'all' ? 'Todas' : PRESET_CATEGORY_LABELS[id];
            const active = category === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setCategory(id)}
                style={{
                  flexShrink: 0,
                  padding: '6px 12px',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: active ? 'rgba(88,166,255,.14)' : 'var(--bg-elevated)',
                  color: active ? LIBRARY_ACCENT : 'var(--text-secondary)',
                  border: `1px solid ${active ? 'rgba(88,166,255,.35)' : 'var(--border)'}`,
                }}
              >
                {label}
              </button>
            );
          },
        )}
      </div>

      {loadingId && (
        <div className="fp-card mb-3" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Loader2 size={18} className="animate-spin" color={LIBRARY_ACCENT} />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Resolviendo ejercicios…</p>
        </div>
      )}

      {error && (
        <div className="fp-card mb-3" style={{ padding: 12, borderColor: 'rgba(248,81,73,.4)' }}>
          <p style={{ fontSize: 13, color: 'var(--accent-red)' }}>{error}</p>
        </div>
      )}

      {preview ? (
        <div className="fp-card mb-3" style={{ padding: 14 }}>
          <p className="font-sora" style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
            {preview.nombre}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{preview.descripcion}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {preview.exercises.length} ejercicios · {preview.duracion_min} min · nivel{' '}
            {LEVEL_LABELS[preview.level]}
          </p>
          <button
            type="button"
            className="fp-btn fp-btn-ghost mt-2"
            style={{ fontSize: 12 }}
            onClick={() => setPreview(null)}
          >
            Cerrar vista previa
          </button>
        </div>
      ) : null}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {presets.map((preset, i) => (
            <div key={preset.id} style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
              <PresetCard
                preset={preset}
                selected={selected?.id === preset.id}
                loading={loadingId !== null}
                onSelect={(p) => {
                  setSelected(p);
                  setPreview(null);
                }}
                onPreview={setPreview}
              />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {presets.map((preset) => (
            <PresetListRow
              key={preset.id}
              preset={preset}
              selected={selected?.id === preset.id}
              loading={loadingId !== null}
              onSelect={(p) => {
                setSelected(p);
                setPreview(null);
              }}
              onPreview={setPreview}
            />
          ))}
        </div>
      )}

      {presets.length === 0 && (
        <div className="text-center" style={{ paddingTop: 40 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sin plantillas con estos filtros</p>
        </div>
      )}
    </>
  );

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <RoutineBlockParamsPanel
        level={selected?.level ?? 'intermedia'}
        presetQueued={selected?.nombre ?? null}
        blockWeeks={blockWeeks}
        showProgressionChart={Boolean(selected)}
      />
      <div className="fp-card" style={{ padding: 14 }}>
        <p className="fp-cal-label" style={{ marginBottom: 8 }}>
          Duración del bloque
        </p>
        <div className="flex gap-1.5">
          {[4, 8, 12].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setBlockWeeks(w)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 9,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${blockWeeks === w ? 'var(--brand)' : 'var(--border)'}`,
                background: blockWeeks === w ? 'var(--brand-dim)' : 'var(--bg-elevated)',
                color: blockWeeks === w ? 'var(--brand)' : 'var(--text-secondary)',
              }}
            >
              {w} sem
            </button>
          ))}
        </div>
        <button
          type="button"
          className="fp-btn fp-btn-primary w-full mt-3"
          style={{ justifyContent: 'center', gap: 6 }}
          disabled={!selected || loadingId !== null}
          onClick={() => selected && void handleApply(selected)}
        >
          Comenzar con plantilla seleccionada
        </button>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.4 }}>
          ¿Estructura desde cero? Usa el constructor paso a paso en la pestaña superior.
        </p>
      </div>
    </div>
  );

  return (
    <div>
      <RoutineCreationMethodTabs />
      <RoutineCreationLayout main={main} sidebar={sidebar} />
    </div>
  );
};
