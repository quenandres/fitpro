import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Edit3, Eye, LayoutGrid, LayoutTemplate, List, Plus, Search, Trash2 } from 'lucide-react';
import { PageBackRow } from '../../components/common/PageBackButton';
import { ActionMenu, type ActionMenuItem } from '../../components/common/ActionMenu';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useDataStore } from '../../store/useDataStore';
import { PLANTILLA_CATEGORY_LABELS } from '../../data/plantillasBase';
import { PRESET_GOAL_CHIPS } from '../../data/routineBuilderMock';
import { SelfTrainingRedirect } from '../../components/training/SelfTrainingRedirect';
import { LEVEL_ROUTES } from '../../hooks/useRoutineFormWithPreset';
import { rutinaToFormData } from '../../utils/inferRoutineFormLevel';
import { countTotalEjercicios } from '../../utils/routineScheduleUtils';
import { ROUTES } from '../../routes/paths';
import { RoutineCreationMethodTabs } from '../../components/library/routines/RoutineCreationMethodTabs';
import { RoutineCreationLayout } from '../../components/library/routines/RoutineCreationLayout';
import { RoutineBlockParamsPanel } from '../../components/library/routines/RoutineBlockParamsPanel';
import { RoutineCreationChrome } from '../../components/library/routines/RoutineCreationChrome';
import {
  forwardRoutineCreationContext,
  parseRoutineCreationContext,
} from '../../utils/routineCreationContext';
import type { ClientRoutineCreationEmbed } from '../../utils/routineCreationEmbed';
import type { PlantillaCategoria, RoutineFormLevel, Rutina } from '../../types';

const LIBRARY_ACCENT = 'var(--accent-blue)';

const LEVEL_LABELS: Record<RoutineFormLevel, string> = {
  basica: 'Básica',
  intermedia: 'Intermedia',
  avanzada: 'Avanzada',
};

function plantillaMatchesGoal(plantilla: Rutina, goalId: string): boolean {
  if (goalId === 'all') return true;
  const chip = PRESET_GOAL_CHIPS.find((c) => c.id === goalId);
  if (!chip || !('match' in chip)) return true;
  const meta = plantilla.plantilla;
  const haystack = [meta?.categoria, ...(meta?.tags ?? []), plantilla.categoria, plantilla.descripcion]
    .join(' ')
    .toLowerCase();
  return chip.match.some((m) => haystack.includes(m));
}

function plantillaDiasPorSemana(plantilla: Rutina): number {
  const semana1 = plantilla.programacion_semanal?.[0];
  if (!semana1) return 1;
  return semana1.dias.filter((d) => d.ejercicios.length > 0).length;
}

const PlantillaCard = ({
  plantilla,
  selected,
  onSelect,
  onPreview,
  onEdit,
  onDelete,
}: {
  plantilla: Rutina;
  selected: boolean;
  onSelect: (p: Rutina) => void;
  onPreview: (p: Rutina) => void;
  onEdit: (p: Rutina) => void;
  onDelete: (p: Rutina) => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const nivel = plantilla.plantilla?.nivel ?? 'intermedia';
  const dias = plantillaDiasPorSemana(plantilla);
  const menuItems: ActionMenuItem[] = [
    { key: 'edit', label: 'Editar', icon: Edit3, onSelect: () => onEdit(plantilla) },
    { key: 'delete', label: 'Eliminar', icon: Trash2, danger: true, onSelect: () => onDelete(plantilla) },
  ];

  return (
    <article
      className="fp-card fp-card-hover animate-slide-up relative overflow-hidden"
      style={{
        padding: '14px 16px',
        borderColor: selected ? 'color-mix(in srgb, var(--accent-blue) 45%, transparent)' : undefined,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <p className="font-sora" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
          {plantilla.nombre}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {plantilla.plantilla?.destacada ? (
            <span className="badge badge-brand" style={{ fontSize: 9, padding: '2px 6px' }}>
              Popular
            </span>
          ) : null}
          {selected ? (
            <span className="badge badge-brand" style={{ fontSize: 9, padding: '2px 6px' }}>
              <Check size={10} /> Seleccionada
            </span>
          ) : (
            <span className="badge badge-blue shrink-0" style={{ fontSize: 9, padding: '2px 6px' }}>
              {LEVEL_LABELS[nivel]}
            </span>
          )}
          <ActionMenu open={menuOpen} onOpenChange={setMenuOpen} items={menuItems} ariaLabel="Opciones de plantilla" />
        </div>
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
        {plantilla.descripcion}
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
          {plantilla.plantilla ? PLANTILLA_CATEGORY_LABELS[plantilla.plantilla.categoria] : plantilla.categoria}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
          {dias} días/sem · {plantilla.semanas ?? 1} sem · {plantilla.duracion_min} min
        </span>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          type="button"
          className="fp-btn fp-btn-ghost"
          style={{ flex: 1, justifyContent: 'center', fontSize: 11, gap: 4 }}
          onClick={() => onPreview(plantilla)}
        >
          <Eye size={13} /> Previsualizar
        </button>
        <button
          type="button"
          className="fp-btn fp-btn-secondary"
          style={{ flex: 1, justifyContent: 'center', fontSize: 11 }}
          onClick={() => onSelect(plantilla)}
        >
          Seleccionar
        </button>
      </div>
    </article>
  );
};

interface RoutinePresetGalleryProps {
  embed?: ClientRoutineCreationEmbed;
}

export function RoutinePresetGallery({ embed }: RoutinePresetGalleryProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const creationCtx = embed?.creationContext ?? parseRoutineCreationContext(searchParams);
  const plantillas = useDataStore((s) => s.plantillas);
  const deletePlantilla = useDataStore((s) => s.deletePlantilla);
  const incrementPlantillaUsos = useDataStore((s) => s.incrementPlantillaUsos);

  const [category, setCategory] = useState<PlantillaCategoria | 'all'>('all');
  const [goal, setGoal] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Rutina | null>(null);
  const [preview, setPreview] = useState<Rutina | null>(null);
  const [blockWeeks, setBlockWeeks] = useState(4);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [toDelete, setToDelete] = useState<Rutina | null>(null);

  const list = useMemo(() => {
    let items = plantillas;
    if (category !== 'all') items = items.filter((p) => p.plantilla?.categoria === category);
    items = items.filter((p) => plantillaMatchesGoal(p, goal));
    const q = query.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q) ||
          (p.plantilla?.tags ?? []).some((t) => t.toLowerCase().includes(q)),
      );
    }
    return items;
  }, [plantillas, category, goal, query]);

  const handleApply = (plantilla: Rutina) => {
    const form = { ...rutinaToFormData(plantilla), semanas: blockWeeks };
    incrementPlantillaUsos(plantilla.id);
    const presetState = { presetForm: form, presetName: plantilla.nombre };
    const nivel = plantilla.plantilla?.nivel ?? 'intermedia';
    if (embed) {
      embed.onContinueToConstructor({ level: nivel, presetState });
      return;
    }
    navigate(forwardRoutineCreationContext(LEVEL_ROUTES[nivel], searchParams), { state: presetState });
  };

  const handleEdit = (plantilla: Rutina) => {
    const nivel = plantilla.plantilla?.nivel ?? 'intermedia';
    navigate(`${LEVEL_ROUTES[nivel]}?modo=plantilla&plantillaId=${plantilla.id}`);
  };

  if (!embed && searchParams.get('para') === 'mi') return <SelfTrainingRedirect />;

  const main = (
    <>
      <PageBackRow
        {...(embed
          ? { onClick: embed.onBackToHub }
          : { to: forwardRoutineCreationContext(ROUTES.library.rutinasNueva, searchParams) })}
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
          <>
            <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
              <LayoutTemplate size={10} style={{ marginRight: 3 }} />
              {plantillas.length} plantillas
            </span>
            {!embed ? (
              <button
                type="button"
                className="fp-btn fp-btn-primary"
                style={{ fontSize: 11, padding: '5px 10px', gap: 4 }}
                onClick={() => navigate(`${ROUTES.library.rutinaNueva('intermedia')}?modo=plantilla`)}
              >
                <Plus size={13} /> Nueva plantilla
              </button>
            ) : null}
          </>
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
            style={{ padding: '8px 10px', borderRadius: 8, background: viewMode === 'grid' ? 'var(--bg-card)' : 'transparent' }}
            aria-pressed={viewMode === 'grid'}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            className="fp-btn fp-btn-ghost"
            style={{ padding: '8px 10px', borderRadius: 8, background: viewMode === 'list' ? 'var(--bg-card)' : 'transparent' }}
            aria-pressed={viewMode === 'list'}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      <div className="scrollbar-hide animate-slide-up delay-100 flex gap-1.5 overflow-x-auto mb-2" style={{ paddingBottom: 4 }}>
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

      <div className="scrollbar-hide flex gap-1.5 overflow-x-auto mb-3" style={{ paddingBottom: 4 }}>
        {(['all', ...Object.keys(PLANTILLA_CATEGORY_LABELS)] as Array<PlantillaCategoria | 'all'>).map((id) => {
          const label = id === 'all' ? 'Todas' : PLANTILLA_CATEGORY_LABELS[id];
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

      {preview ? (
        <div className="fp-card mb-3" style={{ padding: 14 }}>
          <p className="font-sora" style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
            {preview.nombre}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{preview.descripcion}</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {countTotalEjercicios(preview.programacion_semanal ?? [])} ejercicios · {preview.duracion_min} min ·
            nivel {LEVEL_LABELS[preview.plantilla?.nivel ?? 'intermedia']}
          </p>
          <button type="button" className="fp-btn fp-btn-ghost mt-2" style={{ fontSize: 12 }} onClick={() => setPreview(null)}>
            Cerrar vista previa
          </button>
        </div>
      ) : null}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {list.map((plantilla, i) => (
            <div key={plantilla.id} style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
              <PlantillaCard
                plantilla={plantilla}
                selected={selected?.id === plantilla.id}
                onSelect={(p) => {
                  setSelected(p);
                  setPreview(null);
                }}
                onPreview={setPreview}
                onEdit={handleEdit}
                onDelete={setToDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {list.map((plantilla) => (
            <PlantillaCard
              key={plantilla.id}
              plantilla={plantilla}
              selected={selected?.id === plantilla.id}
              onSelect={(p) => {
                setSelected(p);
                setPreview(null);
              }}
              onPreview={setPreview}
              onEdit={handleEdit}
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      {list.length === 0 && (
        <div className="text-center" style={{ paddingTop: 40 }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sin plantillas con estos filtros</p>
        </div>
      )}

      <ConfirmDialog
        open={toDelete != null}
        title="Eliminar plantilla"
        description={toDelete ? `Esto elimina "${toDelete.nombre}" de la biblioteca de plantillas. No afecta a rutinas ya creadas a partir de ella.` : undefined}
        confirmLabel="Eliminar"
        danger
        onConfirm={() => {
          if (toDelete) {
            deletePlantilla(toDelete.id);
            if (selected?.id === toDelete.id) setSelected(null);
          }
        }}
        onClose={() => setToDelete(null)}
      />
    </>
  );

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <RoutineBlockParamsPanel
        level={selected?.plantilla?.nivel ?? 'intermedia'}
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
          disabled={!selected}
          onClick={() => selected && handleApply(selected)}
        >
          {creationCtx ? 'Continuar y asignar al cliente' : 'Comenzar con plantilla seleccionada'}
        </button>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.4 }}>
          ¿Estructura desde cero? Usa el constructor paso a paso en la pestaña superior.
        </p>
      </div>
    </div>
  );

  return (
    <div>
      <RoutineCreationMethodTabs
        mode={embed ? 'embedded' : 'route'}
        creationContext={creationCtx}
        embeddedActiveTab={embed?.activeTab ?? 'plantillas'}
        inPlace={embed ? { activeTab: embed.activeTab, onTabChange: embed.onTabChange } : undefined}
      />
      <RoutineCreationLayout main={main} sidebar={sidebar} />
    </div>
  );
}

export const RoutinePresetGalleryPage = () => {
  const [searchParams] = useSearchParams();
  if (searchParams.get('para') === 'mi') return <SelfTrainingRedirect />;
  return <RoutinePresetGallery />;
};
