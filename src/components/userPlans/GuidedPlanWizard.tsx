import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Sparkles,
  X,
} from 'lucide-react';
import type { Ejercicio, Rutina, Usuario } from '../../types';
import { DemoBadge } from '../common/DemoBadge';
import { Sheet } from '../common/Sheet';
import { FrecuenciaSelector } from './FrecuenciaSelector';
import { PlanModoSelector } from './PlanModoSelector';
import { PlanProgresionSelector } from './PlanProgresionSelector';
import { SesionEditorSheet } from '../users/SesionEditorSheet';
import { RutinaPickerSheet } from '../users/RutinaPickerSheet';
import type { SesionRef } from '../../hooks/usePlanMutations';
import {
  assignRutinaToDraftSesion,
  buildPlanFromGuidedDraft,
  buildProgressionPreview,
  countEmptyGuidedSlots,
  createInitialGuidedDraft,
  isReglaProgresionValida,
  resizeGuidedDraftSesiones,
  suggestCadenceLabels,
  validateCadencia,
  type GuidedPlanDraft,
} from '../../utils/guidedPlanUtils';
import { normalizeEjercicioPersonalizado } from '../../utils/planScheduleUtils';
import {
  entrenamientoLabel,
  estimateSesionMinutos,
  isSesionConfigured,
  type SesionPersonalizadaPayload,
} from '../../utils/sesionPlanUtils';
import { formatPesoKg, isNivelAvanzado } from '../../utils/userSummary';
import type { SesionDraft } from './SesionEditorContent';

const ACCENT = 'var(--accent-purple)';
const STEPS = [
  'Objetivo',
  'Ritmo',
  'Estructura',
  'Sesiones',
  'Progresión',
  'Revisar',
] as const;

type StepNum = 1 | 2 | 3 | 4 | 5 | 6;
type EditorMode = 'create' | 'edit';

interface Props {
  user: Usuario;
  rutinas: Rutina[];
  ejercicios: Ejercicio[];
  reconfigure: boolean;
  onClose: () => void;
  onSave: (plan: ReturnType<typeof buildPlanFromGuidedDraft>) => void;
}

function applySesionDraft(sesion: GuidedPlanDraft['sesiones'][0], payload: SesionPersonalizadaPayload) {
  const nombre = payload.nombre.trim();
  const fromLibrary = sesion.rutina_id != null && sesion.rutina_id > 0;
  return {
    ...sesion,
    nombre: nombre || sesion.nombre,
    rutina_id: fromLibrary ? sesion.rutina_id : 0,
    rutina_nombre: nombre || sesion.rutina_nombre || 'Rutina personalizada',
    ejercicios_personalizados: payload.ejercicios.map((e) => normalizeEjercicioPersonalizado(e)),
  };
}

export function GuidedPlanWizard({
  user,
  rutinas,
  ejercicios,
  reconfigure,
  onClose,
  onSave,
}: Props) {
  const [step, setStep] = useState<StepNum>(1);
  const [draft, setDraft] = useState<GuidedPlanDraft>(() => createInitialGuidedDraft(user));
  const [editorIndex, setEditorIndex] = useState<number | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>('create');
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  const cadencia = useMemo(
    () => validateCadencia(draft.frecuencia, draft.descanso_min_dias),
    [draft.frecuencia, draft.descanso_min_dias],
  );

  const cadenceLabels = useMemo(
    () => suggestCadenceLabels(draft.frecuencia, draft.descanso_min_dias),
    [draft.frecuencia, draft.descanso_min_dias],
  );

  const displaySesiones = useMemo(() => {
    if (draft.modo === 'repetitiva') return draft.sesiones.slice(0, 1);
    return draft.sesiones;
  }, [draft.modo, draft.sesiones]);

  const draftUser: Usuario = useMemo(
    () => ({
      ...user,
      plan: {
        ...user.plan,
        modo: draft.modo,
        programacion_semanal: [{ semana: 1, sesiones: draft.sesiones }],
      },
    }),
    [user, draft.modo, draft.sesiones],
  );

  const editorRef: SesionRef | null =
    editorIndex != null ? { semana: 1, sesionIndex: editorIndex } : null;

  const emptySlots = countEmptyGuidedSlots(displaySesiones);

  const progressionPreview = useMemo(() => {
    if (draft.progresion !== 'incremental' || !draft.regla_progresion_global) return null;
    const firstConfigured = displaySesiones.find((s) => s.ejercicios_personalizados.length > 0);
    const sample = firstConfigured?.ejercicios_personalizados[0];
    return buildProgressionPreview(
      draft.semanas,
      draft.regla_progresion_global,
      {
        valor: sample?.valor ?? 10,
        peso_objetivo_kg: sample?.peso_objetivo_kg ?? 40,
        unidad_id: sample?.unidad_id ?? 1,
      },
    );
  }, [draft.progresion, draft.regla_progresion_global, draft.semanas, displaySesiones]);

  const stepValid = (s: StepNum): boolean => {
    switch (s) {
      case 1:
        return draft.nombre.trim().length > 0 && draft.semanas >= 1 && draft.semanas <= 52;
      case 2:
        return cadencia.valid;
      case 3:
        return true;
      case 4:
        return emptySlots === 0;
      case 5:
        return draft.progresion === 'fijo' || isReglaProgresionValida(draft.regla_progresion_global);
      case 6:
        return emptySlots === 0 && cadencia.valid;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (!stepValid(step)) return;
    if (step === 6) {
      onSave(buildPlanFromGuidedDraft(user.id, draft));
      return;
    }
    setStep((s) => Math.min(6, s + 1) as StepNum);
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1) as StepNum);

  const updateDraft = (patch: Partial<GuidedPlanDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  };

  const handleFrecuenciaChange = (frecuencia: number) => {
    setDraft((d) => ({
      ...d,
      frecuencia,
      sesiones: resizeGuidedDraftSesiones(d, frecuencia, d.modo),
    }));
  };

  const handleModoChange = (modo: GuidedPlanDraft['modo']) => {
    setDraft((d) => ({
      ...d,
      modo,
      sesiones: resizeGuidedDraftSesiones(d, d.frecuencia, modo),
    }));
  };

  const handleDescansoChange = (descanso_min_dias: number) => {
    updateDraft({ descanso_min_dias: Math.max(0, Math.min(2, descanso_min_dias)) });
  };

  const openEditor = (idx: number, mode: EditorMode) => {
    setEditorMode(mode);
    setEditorIndex(idx);
  };

  const handleSaveSesion = (_ref: SesionRef, payload: SesionDraft) => {
    if (editorIndex == null) return;
    setDraft((d) => ({
      ...d,
      sesiones: d.sesiones.map((s, i) =>
        i === editorIndex ? applySesionDraft(s, payload) : s,
      ),
    }));
    setEditorIndex(null);
  };

  const handleSelectRutina = (rutina: Rutina) => {
    if (pickerIndex == null) return;
    setDraft((d) => ({
      ...d,
      sesiones: d.sesiones.map((s, i) =>
        i === pickerIndex ? assignRutinaToDraftSesion(s, rutina) : s,
      ),
    }));
    setPickerIndex(null);
  };

  const renderStepDots = () => (
    <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
      {STEPS.map((label, i) => {
        const num = (i + 1) as StepNum;
        const active = step === num;
        const done = step > num;
        return (
          <div key={label} className="flex items-center gap-1 shrink-0">
            <div
              className="flex items-center gap-1.5 rounded-full px-2 py-1"
              style={{
                background: active || done ? `${ACCENT}18` : 'transparent',
                border: active ? `1px solid ${ACCENT}` : '1px solid transparent',
              }}
            >
              <span
                className="flex items-center justify-center rounded-full font-bold"
                style={{
                  width: 22,
                  height: 22,
                  fontSize: 10,
                  background: done ? ACCENT : active ? ACCENT : 'var(--bg-overlay)',
                  color: done || active ? '#fff' : 'var(--text-muted)',
                }}
              >
                {done ? <Check size={12} /> : num}
              </span>
              <span
                className="font-sora text-xs font-semibold hidden sm:inline"
                style={{ color: active ? ACCENT : 'var(--text-muted)' }}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 ? (
              <div
                className="w-3 h-px shrink-0"
                style={{ background: done ? ACCENT : 'var(--border)' }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );

  const renderClientSummary = () => (
    <div
      className="rounded-xl mb-4 p-3 flex flex-wrap gap-x-4 gap-y-2"
      style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}
    >
      <div>
        <p className="fp-cal-label text-[10px] mb-0.5">Cliente</p>
        <p className="text-sm font-semibold text-primary">{user.nombre}</p>
      </div>
      <div>
        <p className="fp-cal-label text-[10px] mb-0.5">Objetivo</p>
        <p className="text-sm text-secondary">{user.objetivo}</p>
      </div>
      <div>
        <p className="fp-cal-label text-[10px] mb-0.5">Nivel</p>
        <p className="text-sm text-secondary">
          {isNivelAvanzado(user.nivel) ? 'Avanzado' : user.nivel}
        </p>
      </div>
      <div>
        <p className="fp-cal-label text-[10px] mb-0.5">Peso</p>
        <p className="text-sm text-secondary">{formatPesoKg(user.peso_kg)}</p>
      </div>
    </div>
  );

  return (
    <>
      <Sheet
        open
        onClose={onClose}
        flexColumn
        immersive
        zIndex={100}
        ariaLabel={reconfigure ? 'Reconfigurar plan guiado' : 'Crear plan guiado'}
        panelClassName="md:max-w-xl"
      >
        <div className="flex flex-col min-h-0 flex-1 max-w-[560px] mx-auto w-full">
          <div className="shrink-0 flex items-start justify-between gap-3 px-5 pt-5 pb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-sora text-xl font-bold text-primary tracking-tight">
                  {reconfigure ? 'Reconfigurar plan' : 'Crear plan guiado'}
                </h2>
                <DemoBadge label="Demo · mock" />
              </div>
              <p className="text-xs text-muted">
                Persistencia local — el plan se guarda al confirmar el último paso.
              </p>
            </div>
            <button type="button" onClick={onClose} className="fp-btn fp-btn-ghost p-2 shrink-0" aria-label="Cerrar">
              <X size={18} />
            </button>
          </div>

          <div className="shrink-0 px-5">{renderStepDots()}</div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
            {step === 1 && (
              <div className="animate-slide-up">
                <p className="text-[11px] font-bold mb-3 tracking-wider" style={{ color: ACCENT }}>
                  PASO 1 · OBJETIVO DEL PLAN
                </p>
                {renderClientSummary()}
                <div className="mb-3.5">
                  <label className="fp-cal-label" htmlFor="guided-plan-nombre">
                    Nombre del plan
                  </label>
                  <input
                    id="guided-plan-nombre"
                    className="fp-input"
                    value={draft.nombre}
                    onChange={(e) => updateDraft({ nombre: e.target.value })}
                    placeholder="Plan fuerza — 8 semanas"
                  />
                </div>
                <div className="mb-3.5">
                  <label className="fp-cal-label" htmlFor="guided-plan-desc">
                    Descripción
                  </label>
                  <textarea
                    id="guided-plan-desc"
                    className="fp-input min-h-[72px] resize-y"
                    value={draft.descripcion}
                    onChange={(e) => updateDraft({ descripcion: e.target.value })}
                    placeholder={draft.objetivo || 'Objetivo del cliente'}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3.5">
                  <div>
                    <label className="fp-cal-label" htmlFor="guided-plan-semanas">
                      Duración (semanas)
                    </label>
                    <input
                      id="guided-plan-semanas"
                      className="fp-input"
                      type="number"
                      min={1}
                      max={52}
                      value={draft.semanas}
                      onChange={(e) =>
                        updateDraft({ semanas: Math.max(1, Math.min(52, Number(e.target.value) || 1)) })
                      }
                    />
                  </div>
                  <div>
                    <label className="fp-cal-label" htmlFor="guided-plan-inicio">
                      Fecha de inicio
                    </label>
                    <input
                      id="guided-plan-inicio"
                      className="fp-input"
                      type="date"
                      value={draft.fecha_inicio}
                      onChange={(e) => updateDraft({ fecha_inicio: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-slide-up">
                <p className="text-[11px] font-bold mb-3 tracking-wider" style={{ color: ACCENT }}>
                  PASO 2 · RITMO Y RECUPERACIÓN
                </p>
                <FrecuenciaSelector
                  value={draft.frecuencia}
                  onChange={handleFrecuenciaChange}
                  accent={ACCENT}
                />
                <div className="fp-card mt-4" style={{ padding: 14, borderRadius: 12 }}>
                  <p className="fp-cal-label mb-2">Descanso mínimo entre sesiones</p>
                  <div className="flex gap-2">
                    {[0, 1, 2].map((n) => {
                      const active = draft.descanso_min_dias === n;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => handleDescansoChange(n)}
                          className="flex-1 rounded-lg py-2 text-sm font-semibold transition-colors"
                          style={{
                            border: active ? `2px solid ${ACCENT}` : '1px solid var(--border)',
                            background: active ? `${ACCENT}12` : 'var(--bg-overlay)',
                            color: active ? ACCENT : 'var(--text-secondary)',
                          }}
                        >
                          {n === 0 ? '0 días' : n === 1 ? '1 día' : '2 días'}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted mt-2 leading-relaxed">
                    Recomendación del plan — no fija días concretos de la semana.
                  </p>
                </div>
                {cadenceLabels.length > 0 ? (
                  <div
                    className="mt-4 rounded-xl p-3"
                    style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}
                  >
                    <p className="fp-cal-label mb-1.5">Cadencia sugerida</p>
                    <p className="text-sm text-secondary">
                      {cadenceLabels.join(' · ')}
                      <span className="text-muted"> (orientativa)</span>
                    </p>
                  </div>
                ) : null}
                {!cadencia.valid ? (
                  <div
                    role="alert"
                    className="mt-4 flex gap-2 rounded-xl p-3 text-sm"
                    style={{
                      background: 'rgba(248,81,73,.1)',
                      border: '1px solid rgba(248,81,73,.35)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <AlertTriangle size={18} className="shrink-0 text-red-400" aria-hidden />
                    <span>{cadencia.message}</span>
                  </div>
                ) : null}
              </div>
            )}

            {step === 3 && (
              <div className="animate-slide-up">
                <p className="text-[11px] font-bold mb-3 tracking-wider" style={{ color: ACCENT }}>
                  PASO 3 · ESTRUCTURA SEMANAL
                </p>
                <PlanModoSelector
                  value={draft.modo}
                  onChange={handleModoChange}
                  frecuencia={draft.frecuencia}
                  accent={ACCENT}
                />
                <div
                  className="mt-4 rounded-xl p-3 text-sm text-secondary"
                  style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}
                >
                  {draft.modo === 'repetitiva' ? (
                    <p>
                      Una rutina repetida en cada sesión de la semana ({draft.frecuencia}{' '}
                      {draft.frecuencia === 1 ? 'vez' : 'veces'}).
                    </p>
                  ) : (
                    <p>
                      {draft.frecuencia} sesiones distintas por semana — configúralas en el
                      siguiente paso.
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-slide-up">
                <p className="text-[11px] font-bold mb-3 tracking-wider" style={{ color: ACCENT }}>
                  PASO 4 · CONFIGURAR SESIONES
                </p>
                {emptySlots > 0 ? (
                  <p className="text-sm text-muted mb-3">
                    Faltan {emptySlots} {emptySlots === 1 ? 'sesión' : 'sesiones'} por configurar.
                  </p>
                ) : null}
                <div className="flex flex-col gap-3">
                  {displaySesiones.map((sesion, idx) => {
                    const configured = isSesionConfigured(sesion);
                    const label = entrenamientoLabel(sesion, idx, draft.modo);
                    const minutos = estimateSesionMinutos(sesion, rutinas);
                    const ejCount = sesion.ejercicios_personalizados.length;
                    return (
                      <div
                        key={idx}
                        className="fp-card"
                        style={{
                          padding: 14,
                          borderRadius: 12,
                          border: configured ? '1px solid var(--border)' : '1px dashed rgba(248,81,73,.5)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-sora text-sm font-bold text-primary">{label}</p>
                            {configured ? (
                              <p className="text-xs text-muted mt-0.5">
                                {sesion.rutina_nombre || 'Personalizada'}
                                {ejCount > 0
                                  ? ` · ${ejCount} ejercicios · ~${minutos} min`
                                  : ''}
                              </p>
                            ) : (
                              <p className="text-xs text-muted mt-0.5">Sin configurar</p>
                            )}
                          </div>
                          {configured ? (
                            <Check size={18} style={{ color: ACCENT }} aria-label="Configurada" />
                          ) : null}
                        </div>
                        {ejCount > 0 ? (
                          <ul className="text-xs text-secondary mb-3 space-y-0.5">
                            {sesion.ejercicios_personalizados.slice(0, 4).map((e, i) => (
                              <li key={i}>
                                {e.nombre} — {e.series}×{e.valor}
                                {e.peso_objetivo_kg != null ? ` @ ${e.peso_objetivo_kg} kg` : ''}
                              </li>
                            ))}
                            {ejCount > 4 ? (
                              <li className="text-muted">+{ejCount - 4} más</li>
                            ) : null}
                          </ul>
                        ) : null}
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="fp-btn fp-btn-secondary text-xs py-1.5 px-3"
                            onClick={() => setPickerIndex(idx)}
                          >
                            Elegir rutina
                          </button>
                          <button
                            type="button"
                            className="fp-btn fp-btn-ghost text-xs py-1.5 px-3"
                            onClick={() => openEditor(idx, configured ? 'edit' : 'create')}
                          >
                            {configured ? 'Editar sesión' : 'Crear sesión personalizada'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="animate-slide-up">
                <p className="text-[11px] font-bold mb-3 tracking-wider" style={{ color: ACCENT }}>
                  PASO 5 · PROGRESIÓN
                </p>
                <PlanProgresionSelector
                  value={draft.progresion}
                  onChange={(progresion) => updateDraft({ progresion })}
                  accent={ACCENT}
                />
                {draft.progresion === 'incremental' ? (
                  <div className="mt-4 space-y-3">
                    <p className="text-xs text-muted leading-relaxed">
                      Regla global aplicada a todos los ejercicios. Podrás ajustar cada uno
                      después en el editor avanzado.
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="fp-cal-label text-[10px]" htmlFor="guided-peso-inc">
                          + kg
                        </label>
                        <input
                          id="guided-peso-inc"
                          className="fp-input"
                          type="number"
                          min={0}
                          step={0.5}
                          value={draft.regla_progresion_global?.peso_incremento ?? 0}
                          onChange={(e) =>
                            updateDraft({
                              regla_progresion_global: {
                                ...draft.regla_progresion_global,
                                peso_incremento: Number(e.target.value) || 0,
                                reps_incremento: draft.regla_progresion_global?.reps_incremento ?? 0,
                                cada_semanas: draft.regla_progresion_global?.cada_semanas ?? 1,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="fp-cal-label text-[10px]" htmlFor="guided-reps-inc">
                          + reps
                        </label>
                        <input
                          id="guided-reps-inc"
                          className="fp-input"
                          type="number"
                          min={0}
                          step={1}
                          value={draft.regla_progresion_global?.reps_incremento ?? 0}
                          onChange={(e) =>
                            updateDraft({
                              regla_progresion_global: {
                                ...draft.regla_progresion_global,
                                peso_incremento: draft.regla_progresion_global?.peso_incremento ?? 0,
                                reps_incremento: Number(e.target.value) || 0,
                                cada_semanas: draft.regla_progresion_global?.cada_semanas ?? 1,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="fp-cal-label text-[10px]" htmlFor="guided-cada-sem">
                          Cada N sem
                        </label>
                        <input
                          id="guided-cada-sem"
                          className="fp-input"
                          type="number"
                          min={1}
                          max={12}
                          value={draft.regla_progresion_global?.cada_semanas ?? 1}
                          onChange={(e) =>
                            updateDraft({
                              regla_progresion_global: {
                                ...draft.regla_progresion_global,
                                peso_incremento: draft.regla_progresion_global?.peso_incremento ?? 0,
                                reps_incremento: draft.regla_progresion_global?.reps_incremento ?? 0,
                                cada_semanas: Math.max(1, Number(e.target.value) || 1),
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                    {!isReglaProgresionValida(draft.regla_progresion_global) ? (
                      <p className="text-xs text-red-400" role="alert">
                        Indica al menos un incremento de peso o repeticiones mayor que cero.
                      </p>
                    ) : null}
                    {progressionPreview ? (
                      <div
                        className="rounded-xl p-3"
                        style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}
                      >
                        <p className="fp-cal-label mb-2 flex items-center gap-1.5">
                          <Sparkles size={14} style={{ color: ACCENT }} />
                          Vista previa (ejemplo)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {progressionPreview.map((pt) => (
                            <div
                              key={pt.semana}
                              className="rounded-lg px-3 py-2 text-xs"
                              style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}
                            >
                              <p className="font-bold text-primary mb-0.5">Semana {pt.semana}</p>
                              <p className="text-secondary">
                                {pt.valor} reps
                                {pt.peso_objetivo_kg != null ? ` · ${pt.peso_objetivo_kg} kg` : ''}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-xs text-muted mt-3 leading-relaxed">
                    Misma carga en todas las semanas. Los cambios manuales se aplican a semanas
                    pendientes.
                  </p>
                )}
              </div>
            )}

            {step === 6 && (
              <div className="animate-slide-up">
                <p className="text-[11px] font-bold mb-3 tracking-wider" style={{ color: ACCENT }}>
                  PASO 6 · REVISAR Y GUARDAR
                </p>
                <div className="space-y-3">
                  <SummaryRow label="Plan" value={draft.nombre} />
                  <SummaryRow label="Duración" value={`${draft.semanas} semanas · desde ${draft.fecha_inicio}`} />
                  <SummaryRow
                    label="Ritmo"
                    value={`${draft.frecuencia} sesiones/semana · descanso mín. ${draft.descanso_min_dias} día(s)`}
                  />
                  <SummaryRow
                    label="Estructura"
                    value={draft.modo === 'repetitiva' ? 'Rutina repetida' : 'Sesiones variables'}
                  />
                  <SummaryRow
                    label="Progresión"
                    value={
                      draft.progresion === 'fijo'
                        ? 'Fija'
                        : `Incremental (+${draft.regla_progresion_global?.peso_incremento ?? 0} kg / +${draft.regla_progresion_global?.reps_incremento ?? 0} reps cada ${draft.regla_progresion_global?.cada_semanas ?? 1} sem)`
                    }
                  />
                  <div
                    className="rounded-xl p-3"
                    style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border)' }}
                  >
                    <p className="fp-cal-label mb-2">Sesiones</p>
                    <ul className="space-y-2">
                      {displaySesiones.map((s, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Dumbbell size={14} style={{ color: ACCENT }} aria-hidden />
                          <span className="text-primary">
                            {entrenamientoLabel(s, i, draft.modo)}
                            {' — '}
                            {isSesionConfigured(s)
                              ? s.rutina_nombre || 'Personalizada'
                              : 'Sin configurar'}
                          </span>
                          {!isSesionConfigured(s) ? (
                            <button
                              type="button"
                              className="text-xs underline ml-auto"
                              style={{ color: ACCENT }}
                              onClick={() => setStep(4)}
                            >
                              Ir al paso 4
                            </button>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {emptySlots > 0 ? (
                    <div role="alert" className="flex gap-2 text-sm text-red-400">
                      <AlertTriangle size={16} className="shrink-0" />
                      Completa todas las sesiones antes de guardar.
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          <div
            className="shrink-0 flex items-center gap-2 px-5 py-4 border-t"
            style={{ borderColor: 'var(--border)' }}
          >
            {step > 1 ? (
              <button type="button" className="fp-btn fp-btn-ghost flex items-center gap-1" onClick={goBack}>
                <ChevronLeft size={18} />
                Atrás
              </button>
            ) : (
              <button type="button" className="fp-btn fp-btn-ghost" onClick={onClose}>
                Cancelar
              </button>
            )}
            <div className="flex-1" />
            <button
              type="button"
              className="fp-btn fp-btn-primary flex items-center gap-1"
              disabled={!stepValid(step)}
              onClick={goNext}
            >
              {step === 6 ? 'Guardar plan' : 'Siguiente'}
              {step < 6 ? <ChevronRight size={18} /> : null}
            </button>
          </div>
        </div>
      </Sheet>

      {editorRef ? (
        <SesionEditorSheet
          open={editorIndex != null}
          mode={editorMode}
          user={draftUser}
          sesionRef={editorRef}
          rutinas={rutinas}
          ejercicios={ejercicios}
          onClose={() => setEditorIndex(null)}
          onSave={handleSaveSesion}
        />
      ) : null}

      <RutinaPickerSheet
        open={pickerIndex != null}
        rutinas={rutinas}
        semanasRestantes={0}
        entrenamientoLabel={
          pickerIndex != null
            ? entrenamientoLabel(displaySesiones[pickerIndex]!, pickerIndex, draft.modo)
            : 'Sesión'
        }
        semana={1}
        onClose={() => setPickerIndex(null)}
        onSelect={(rutina) => handleSelectRutina(rutina)}
      />
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-2 text-sm">
      <span className="fp-cal-label shrink-0 sm:w-28">{label}</span>
      <span className="text-secondary">{value}</span>
    </div>
  );
}
