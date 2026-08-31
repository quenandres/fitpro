import { useCallback, useMemo, useState } from 'react';
import { Calendar, Scale } from 'lucide-react';
import { AnatomyViewport } from '../anatomy/AnatomyViewport';
import { SegmentedControl } from '../anatomy/SegmentedControl';
import { MUSCLE_MAP } from '../anatomy/anatomy.constants';
import { getMeasurementMuscleFilter } from '../anatomy/anatomy.utils';
import type { AnatomyView, Gender } from '../anatomy/anatomy.types';
import { getSitioForCanonical, getSitiosForView, SITIOS_MEDIDA } from '../../data/sitiosMedida';
import { useMedidasStore } from '../../store/useMedidasStore';
import type { SitioMedidaId, Usuario, ValoresSitio } from '../../types';
import {
  formatCm,
  formatSitioResumen,
  getFilledCanonicals,
  parseCmInput,
  sitioHasValue,
} from '../../utils/medidasUtils';
import { fechaLocalISO } from '../../utils/trackingUtils';
import { MedidaSitioSheet } from './MedidaSitioSheet';
import '../anatomy/anatomy.css';

const GENDER_OPTIONS = [
  { label: 'Hombre', value: 'male' as const },
  { label: 'Mujer', value: 'female' as const },
];

const VIEW_OPTIONS = [
  { label: 'Frente', value: 'front' as const },
  { label: 'Perfil', value: 'side' as const },
  { label: 'Espalda', value: 'back' as const },
];

interface Props {
  user: Usuario;
}

export function UserMedidasPanel({ user }: Props) {
  const [gender, setGender] = useState<Gender>('male');
  const [view, setView] = useState<AnatomyView>('front');
  const [selectedCanonical, setSelectedCanonical] = useState<string | null>(null);
  const [sheetSitioId, setSheetSitioId] = useState<SitioMedidaId | null>(null);
  const [fecha] = useState(() => fechaLocalISO(new Date()));

  const getSnapshotByDate = useMedidasStore((s) => s.getSnapshotByDate);
  const snapshots = useMedidasStore((s) => s.snapshots);
  const getLatest = useMedidasStore((s) => s.getLatest);
  const updateSitio = useMedidasStore((s) => s.updateSitio);
  const updatePeso = useMedidasStore((s) => s.updatePeso);

  const snapshot = getSnapshotByDate(user.id, fecha);
  const previousSnapshot = useMemo(() => {
    return snapshots
      .filter((s) => s.usuario_id === user.id && s.fecha !== fecha)
      .sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  }, [snapshots, user.id, fecha]);

  const sitios = snapshot?.sitios ?? {};
  const pesoKg = snapshot?.peso_kg ?? user.peso_kg;
  const [pesoInput, setPesoInput] = useState(() =>
    pesoKg != null ? String(pesoKg) : '',
  );

  const muscles = useMemo(
    () => MUSCLE_MAP[view]?.[gender] ?? [],
    [view, gender],
  );

  const filledCanonicals = useMemo(() => getFilledCanonicals(sitios), [sitios]);

  const measurableCanonicals = useMemo(() => {
    const set = new Set<string>();
    for (const def of getSitiosForView(view)) {
      for (const c of def.canonicals) set.add(c);
    }
    return set;
  }, [view]);

  const resolveFilter = useCallback(
    (canonical: string, isSelected: boolean) =>
      getMeasurementMuscleFilter(
        filledCanonicals.has(canonical),
        isSelected,
        measurableCanonicals.has(canonical),
      ),
    [filledCanonicals, measurableCanonicals],
  );

  const handleSelectMuscle = useCallback(
    (canonical: string) => {
      const sitio = getSitioForCanonical(canonical, view);
      if (!sitio) return;
      setSelectedCanonical(canonical);
      setSheetSitioId(sitio.id);
    },
    [view],
  );

  const handleClearSelection = useCallback(() => {
    setSelectedCanonical(null);
  }, []);

  const handleSaveSitio = useCallback(
    (sitioId: SitioMedidaId, valores: ValoresSitio) => {
      updateSitio(user.id, fecha, sitioId, valores);
      setSelectedCanonical(null);
      setSheetSitioId(null);
    },
    [user.id, fecha, updateSitio],
  );

  const handlePesoBlur = () => {
    const parsed = parseCmInput(pesoInput);
    if (parsed != null) updatePeso(user.id, fecha, parsed);
  };

  const sitiosEnVista = getSitiosForView(view);
  const latest = getLatest(user.id);

  return (
    <div className="flex flex-col gap-4 min-w-0 animate-slide-up">
      <div className="fp-card" style={{ padding: 16, borderRadius: 16 }}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <p className="fp-cal-label">Sesión de medidas</p>
            <p className="font-sora text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 mt-0.5">
              <Calendar size={14} className="text-[var(--accent-blue)]" aria-hidden />
              {fecha}
            </p>
          </div>
          {latest && latest.fecha !== fecha ? (
            <span className="badge badge-blue text-[10px]">
              Última: {latest.fecha}
            </span>
          ) : null}
        </div>

        <label className="fp-cal-label" htmlFor="medidas-peso">
          Peso corporal
        </label>
        <div className="fp-input-group mt-1.5">
          <Scale size={16} className="text-[var(--text-muted)]" aria-hidden />
          <input
            id="medidas-peso"
            type="text"
            inputMode="decimal"
            className="fp-input"
            placeholder="Ej. 78.5"
            value={pesoInput}
            onChange={(e) => setPesoInput(e.target.value)}
            onBlur={handlePesoBlur}
          />
          <span className="text-xs font-semibold text-[var(--text-muted)] pr-1">kg</span>
        </div>
        {previousSnapshot?.peso_kg != null ? (
          <p className="text-[11px] text-[var(--text-muted)] mt-2">
            Anterior: {previousSnapshot.peso_kg.toFixed(1)} kg
          </p>
        ) : null}
      </div>

      <div className="fp-card" style={{ padding: 14, borderRadius: 16 }}>
        <div className="fp-admin-section-head fp-admin-section-head--compact" style={{ marginBottom: 12 }}>
          <h3 className="font-sora fp-admin-section-title">Mapa corporal</h3>
          <span className="fp-admin-section-rule" aria-hidden />
        </div>
        <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
          Toca una zona resaltada para registrar su circunferencia. Las zonas en verde ya tienen
          medida de hoy.
        </p>

        <div className="flex flex-col gap-2 mb-3">
          <SegmentedControl
            ariaLabel="Género"
            options={GENDER_OPTIONS}
            value={gender}
            onChange={(g) => {
              setGender(g);
              setSelectedCanonical(null);
            }}
          />
          <SegmentedControl
            ariaLabel="Vista anatómica"
            options={VIEW_OPTIONS}
            value={view}
            onChange={(v) => {
              setView(v);
              setSelectedCanonical(null);
            }}
          />
        </div>

        <div className="relative">
          <p
            className="text-[10px] font-bold tracking-widest text-center text-[var(--text-muted)] mb-1 uppercase"
            aria-hidden
          >
            {VIEW_OPTIONS.find((o) => o.value === view)?.label}
          </p>

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] gap-1 items-stretch">
            <div className="flex flex-col justify-center gap-3 py-2 min-w-0">
              {sitiosEnVista.map((def) => {
                const v = sitios[def.id];
                if (!def.bilateral) return null;
                return (
                  <button
                    key={`L-${def.id}`}
                    type="button"
                    className="text-left rounded-lg px-1 py-0.5 transition-colors hover:bg-[var(--bg-overlay)]"
                    onClick={() => {
                      setSelectedCanonical(def.canonicals[0] ?? null);
                      setSheetSitioId(def.id);
                    }}
                  >
                    <span className="block text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                      {def.label}
                    </span>
                    <span
                      className="block text-xs font-bold tabular-nums"
                      style={{
                        color: v?.der != null ? 'var(--brand-bright)' : 'var(--text-muted)',
                      }}
                    >
                      {v?.der != null ? `${v.der.toFixed(1)}` : '—'}
                      <span className="text-[9px] font-semibold ml-0.5 opacity-70">R</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="min-w-0">
              <AnatomyViewport
                view={view}
                gender={gender}
                muscles={muscles}
                selected={selectedCanonical}
                showHeatmap={false}
                getLevel={() => 1}
                onSelectMuscle={handleSelectMuscle}
                onDismiss={handleClearSelection}
                resolveFilter={resolveFilter}
              />
            </div>

            <div className="flex flex-col justify-center gap-3 py-2 min-w-0 items-end">
              {sitiosEnVista.map((def) => {
                const v = sitios[def.id];
                if (!def.bilateral) return null;
                return (
                  <button
                    key={`R-${def.id}`}
                    type="button"
                    className="text-right rounded-lg px-1 py-0.5 transition-colors hover:bg-[var(--bg-overlay)]"
                    onClick={() => {
                      setSelectedCanonical(def.canonicals[0] ?? null);
                      setSheetSitioId(def.id);
                    }}
                  >
                    <span className="block text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                      {def.label}
                    </span>
                    <span
                      className="block text-xs font-bold tabular-nums"
                      style={{
                        color: v?.izq != null ? 'var(--brand-bright)' : 'var(--text-muted)',
                      }}
                    >
                      {v?.izq != null ? `${v.izq.toFixed(1)}` : '—'}
                      <span className="text-[9px] font-semibold ml-0.5 opacity-70">L</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between text-[9px] font-bold text-[var(--text-muted)] px-1 mt-1">
            <span>R</span>
            <span>L</span>
          </div>
        </div>
      </div>

      <div className="fp-card" style={{ padding: 16, borderRadius: 16 }}>
        <div className="fp-admin-section-head fp-admin-section-head--compact" style={{ marginBottom: 12 }}>
          <h3 className="font-sora fp-admin-section-title">Todas las medidas</h3>
          <span className="fp-admin-section-rule" aria-hidden />
        </div>
        <ul className="flex flex-col gap-2">
          {SITIOS_MEDIDA.map((def) => {
              const v = sitios[def.id];
              const filled = sitioHasValue(v);
              return (
                <li key={def.id}>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--bg-overlay)]"
                    style={{
                      border: '1px solid var(--border-subtle)',
                      background: filled ? 'var(--brand-dim)' : 'var(--bg-elevated)',
                    }}
                    onClick={() => {
                      setSelectedCanonical(def.canonicals[0] ?? null);
                      setSheetSitioId(def.id);
                    }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{def.label}</p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">{def.hint}</p>
                    </div>
                    <span
                      className="text-sm font-bold tabular-nums shrink-0"
                      style={{ color: filled ? 'var(--brand-bright)' : 'var(--text-muted)' }}
                    >
                      {def.bilateral
                        ? formatSitioResumen(v, true)
                        : formatCm(v?.unico)}
                    </span>
                  </button>
                </li>
              );
            })}
        </ul>
      </div>

      <MedidaSitioSheet
        open={sheetSitioId != null}
        onClose={() => {
          setSheetSitioId(null);
          setSelectedCanonical(null);
        }}
        sitioId={sheetSitioId}
        valores={sheetSitioId ? sitios[sheetSitioId] : undefined}
        previous={sheetSitioId ? previousSnapshot?.sitios[sheetSitioId] : undefined}
        onSave={handleSaveSitio}
      />
    </div>
  );
}
