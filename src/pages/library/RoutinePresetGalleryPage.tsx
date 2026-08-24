import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LayoutTemplate, Loader2 } from 'lucide-react';
import {
  PRESET_CATEGORY_LABELS,
  ROUTINE_PRESETS,
  getPresetsByCategory,
  type PresetCategory,
  type RoutinePreset,
} from '../../data/routinePresets';
import { applyRoutinePreset } from '../../utils/applyRoutinePreset';
import { LEVEL_ROUTES } from '../../hooks/useRoutineFormWithPreset';

const LIBRARY_ACCENT = '#58a6ff';

const CATEGORY_FILTERS: Array<{ id: PresetCategory | 'all'; label: string }> = [
  { id: 'all', label: 'Todas' },
  ...(
    Object.entries(PRESET_CATEGORY_LABELS) as Array<[PresetCategory, string]>
  ).map(([id, label]) => ({ id, label })),
];

const LEVEL_LABELS = {
  basica: 'Básica',
  intermedia: 'Intermedia',
  avanzada: 'Avanzada',
} as const;

const PresetCard = ({
  preset,
  loading,
  onSelect,
}: {
  preset: RoutinePreset;
  loading: boolean;
  onSelect: (preset: RoutinePreset) => void;
}) => (
  <button
    type="button"
    disabled={loading}
    onClick={() => onSelect(preset)}
    className="fp-card fp-card-hover animate-slide-up text-left w-full"
    style={{
      padding: '14px 16px',
      borderRadius: 14,
      cursor: loading ? 'wait' : 'pointer',
      opacity: loading ? 0.7 : 1,
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
      <p
        className="font-sora"
        style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}
      >
        {preset.nombre}
      </p>
      <span
        className="badge badge-blue shrink-0"
        style={{ fontSize: 9, padding: '2px 6px' }}
      >
        {LEVEL_LABELS[preset.level]}
      </span>
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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
      <span
        className="badge"
        style={{
          fontSize: 9,
          padding: '2px 6px',
          background: 'rgba(88,166,255,.12)',
          color: LIBRARY_ACCENT,
          border: '1px solid rgba(88,166,255,.25)',
        }}
      >
        {PRESET_CATEGORY_LABELS[preset.category]}
      </span>
      {preset.tags.slice(0, 2).map((tag) => (
        <span
          key={tag}
          style={{
            fontSize: 9,
            padding: '2px 6px',
            borderRadius: 100,
            background: 'var(--bg-overlay)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {tag}
        </span>
      ))}
    </div>
    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
      {preset.duracion_min} min · {preset.exercises.length} ejercicios
    </p>
  </button>
);

export const RoutinePresetGalleryPage = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<PresetCategory | 'all'>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = useMemo(() => getPresetsByCategory(category), [category]);

  const handleSelect = async (preset: RoutinePreset) => {
    setLoadingId(preset.id);
    setError(null);
    try {
      const { form, matchedCount, totalCount } = await applyRoutinePreset(preset);
      navigate(LEVEL_ROUTES[preset.level], {
        state: {
          presetForm: form,
          presetName: preset.nombre,
          matchInfo: { matched: matchedCount, total: totalCount },
        },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo cargar la plantilla',
      );
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <Link
        to="/library/rutina"
        className="fp-btn fp-btn-ghost animate-slide-up"
        style={{ gap: 4, padding: '4px 0', marginBottom: 12, fontSize: 12 }}
      >
        <ChevronLeft size={14} /> Volver a crear rutina
      </Link>

      <section className="animate-slide-up" style={{ paddingBottom: 14 }}>
        <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
          <LayoutTemplate size={10} style={{ marginRight: 3 }} />
          Plantillas
        </span>
        <h1
          className="font-sora"
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '-.02em',
            color: 'var(--text-primary)',
            marginTop: 8,
            marginBottom: 4,
          }}
        >
          Rutinas preestablecidas
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Hyrox, isométricos, pliometría, fuerza, HIIT y más. Los ejercicios se resuelven con
          ExerciseDB.
        </p>
      </section>

      <div
        className="scrollbar-hide animate-slide-up delay-100 flex gap-1.5 overflow-x-auto"
        style={{ paddingBottom: 4, marginBottom: 14 }}
      >
        {CATEGORY_FILTERS.map(({ id, label }) => {
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
        })}
      </div>

      {loadingId && (
        <div
          className="fp-card animate-slide-down"
          style={{
            padding: 12,
            marginBottom: 12,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderColor: 'rgba(88,166,255,.3)',
          }}
        >
          <Loader2 size={18} className="animate-spin" color={LIBRARY_ACCENT} />
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Resolviendo ejercicios con ExerciseDB…
          </p>
        </div>
      )}

      {error && (
        <div
          className="fp-card"
          style={{
            padding: 12,
            marginBottom: 12,
            borderRadius: 12,
            borderColor: 'rgba(248,81,73,.4)',
          }}
        >
          <p style={{ fontSize: 13, color: 'var(--accent-red)' }}>{error}</p>
        </div>
      )}

      <div
        className="animate-slide-up delay-150"
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {presets.map((preset, i) => (
          <div key={preset.id} style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
            <PresetCard
              preset={preset}
              loading={loadingId !== null}
              onSelect={handleSelect}
            />
          </div>
        ))}
      </div>

      {presets.length === 0 && (
        <div className="text-center" style={{ paddingTop: 40 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sin plantillas en esta categoría</p>
        </div>
      )}

      <p
        style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          marginTop: 16,
          textAlign: 'center',
        }}
      >
        {ROUTINE_PRESETS.length} plantillas disponibles
        <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
      </p>
    </div>
  );
};
