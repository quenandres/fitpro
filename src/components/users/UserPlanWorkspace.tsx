import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Sparkles } from 'lucide-react';
import type { Ejercicio, Rutina, Usuario } from '../../types';
import { GuidedPlanWizard } from '../userPlans/GuidedPlanWizard';
import { planHasConfiguredSessions } from '../../utils/guidedPlanUtils';
import { VistaSemana } from '../userPlans/VistaSemana';
import type { usePlanMutations } from '../../hooks/usePlanMutations';
import type { SesionRef } from '../../hooks/usePlanMutations';
import { PlanSessionNav } from '../userPlans/PlanSessionNav';
import { FrecuenciaSelector } from '../userPlans/FrecuenciaSelector';
import { PlanModoSelector } from '../userPlans/PlanModoSelector';
import { PlanProgresionSelector } from '../userPlans/PlanProgresionSelector';
import { UserPlannedLoadPanel } from './UserPlannedLoadPanel';
import { CompliancePanel } from './CompliancePanel';
import { SesionEditorSheet } from './SesionEditorSheet';
import { RutinaPickerSheet } from './RutinaPickerSheet';
import { formatPesoKg, isNivelAvanzado } from '../../utils/userSummary';
import { sesionesForDisplay } from '../../utils/planScheduleUtils';
import { isSemanaBloqueada } from '../../utils/planWeekUtils';
import { entrenamientoLabel, isSesionConfigured } from '../../utils/sesionPlanUtils';

type Mutations = ReturnType<typeof usePlanMutations>;
type EditorMode = 'create' | 'edit';

interface Props {
  user: Usuario;
  rutinas: Rutina[];
  ejercicios: Ejercicio[];
  mutations: Mutations;
  semana: number;
  onSemanaChange: (semana: number) => void;
  sesionEditorIndex: number | null;
  onSesionEditorChange: (sesionIndex: number | null) => void;
}

const PLAN_ACCENT = '#a371f7';

export function UserPlanWorkspace({
  user,
  rutinas,
  ejercicios,
  mutations,
  semana,
  onSemanaChange,
  sesionEditorIndex,
  onSesionEditorChange,
}: Props) {
  const [editorMode, setEditorMode] = useState<EditorMode>('create');
  const [pickerSesionIndex, setPickerSesionIndex] = useState<number | null>(null);
  const [guidedOpen, setGuidedOpen] = useState(false);

  const hasConfiguredPlan = planHasConfiguredSessions(user.plan);

  const semanaPlan = useMemo(
    () => user.plan.programacion_semanal.find((s) => s.semana === semana),
    [user, semana],
  );

  const displaySesiones = useMemo(
    () => (semanaPlan ? sesionesForDisplay(semanaPlan, user.plan.modo) : []),
    [semanaPlan, user.plan.modo],
  );

  const primerPendienteIndex = displaySesiones.findIndex((s) => !isSesionConfigured(s));
  const sesionesPendientes = displaySesiones.filter((s) => !isSesionConfigured(s)).length;

  const editorRef: SesionRef | null =
    sesionEditorIndex != null ? { semana, sesionIndex: sesionEditorIndex } : null;

  const pickerSesion = pickerSesionIndex != null ? displaySesiones[pickerSesionIndex] : null;
  const pickerLabel =
    pickerSesion && pickerSesionIndex != null
      ? entrenamientoLabel(pickerSesion, pickerSesionIndex, user.plan.modo)
      : 'Entrenamiento';

  const semanasRestantes = Math.max(0, user.plan.semanas - semana);

  useEffect(() => {
    if (sesionEditorIndex == null) return;
    const sesion = displaySesiones[sesionEditorIndex];
    if (!sesion) return;
    setEditorMode(isSesionConfigured(sesion) ? 'edit' : 'create');
  }, [sesionEditorIndex, displaySesiones]);

  const openEditor = (sesionIndex: number, mode: EditorMode) => {
    setEditorMode(mode);
    onSesionEditorChange(sesionIndex);
  };

  const openPicker = (sesionIndex: number) => {
    setPickerSesionIndex(sesionIndex);
  };

  const closeEditor = () => {
    onSesionEditorChange(null);
  };

  const closePicker = () => {
    setPickerSesionIndex(null);
  };

  const handleSelectRutina = (rutina: Rutina, replicar: boolean) => {
    if (pickerSesionIndex == null) return;
    const ref: SesionRef = { semana, sesionIndex: pickerSesionIndex };
    if (replicar) {
      mutations.selectRutinaForSesionReplicada(ref, rutina);
    } else {
      mutations.selectRutinaForSesion(ref, rutina);
    }
  };

  const handleSemanasChange = (n: number) => {
    mutations.setPlanSemanas(n);
    if (semana > n) onSemanaChange(n);
  };

  useEffect(() => {
    const definidas = user.plan.programacion_semanal.length;
    if (definidas < user.plan.semanas) {
      mutations.setPlanSemanas(user.plan.semanas);
    }
  }, [user.id, user.plan.semanas, user.plan.programacion_semanal.length, mutations]);

  return (
    <>
      {hasConfiguredPlan ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="fp-btn fp-btn-primary inline-flex items-center gap-2"
            onClick={() => setGuidedOpen(true)}
          >
            <Sparkles size={16} aria-hidden />
            Reconfigurar plan guiado
          </button>
          <p className="text-xs text-muted">
            Asistente paso a paso — frecuencia, descanso, sesiones y progresión.
          </p>
        </div>
      ) : (
        <div
          className="fp-card mb-4"
          style={{
            padding: 16,
            borderRadius: 14,
            border: '1px dashed rgba(34,197,94,.4)',
            background: 'rgba(34,197,94,.06)',
          }}
        >
          <div className="flex items-start gap-2.5 mb-3">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(34,197,94,.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ClipboardList size={18} color="var(--brand)" />
            </div>
            <div className="min-w-0">
              <h3 className="font-sora text-sm font-bold text-primary">
                {user.plan.nombre || 'Plan sin nombre'} · sin plantillas
              </h3>
              <p className="text-[12px] text-muted leading-relaxed mt-1">
                Hay {sesionesPendientes}{' '}
                {sesionesPendientes === 1 ? 'entrenamiento' : 'entrenamientos'} por definir esta
                semana. Asigna una plantilla de tu biblioteca a cada uno, o créala a medida, y
                replícala al resto de las {user.plan.semanas} semanas.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              className="fp-btn fp-btn-primary gap-1.5 justify-center"
              onClick={() => openPicker(Math.max(0, primerPendienteIndex))}
              disabled={displaySesiones.length === 0}
            >
              <ClipboardList size={14} aria-hidden />
              Asignar plantilla
            </button>
            <button
              type="button"
              className="fp-btn fp-btn-secondary gap-1.5 justify-center"
              onClick={() => setGuidedOpen(true)}
            >
              <Sparkles size={14} aria-hidden />
              Crear plan guiado
            </button>
          </div>
        </div>
      )}

      <div className="fp-user-spec">
        <div className="fp-user-spec-item">
          <p className="fp-user-spec-k">Objetivo</p>
          <p className="fp-user-spec-v">{user.objetivo.trim() || '—'}</p>
        </div>
        <div className="fp-user-spec-item">
          <p className="fp-user-spec-k">Nivel</p>
          <p className="fp-user-spec-v">{isNivelAvanzado(user.nivel) ? 'Avanzado' : user.nivel}</p>
        </div>
        <div className="fp-user-spec-item">
          <p className="fp-user-spec-k">Peso</p>
          <p className="fp-user-spec-v">{formatPesoKg(user.peso_kg)}</p>
        </div>
        <div className="fp-user-spec-item">
          <p className="fp-user-spec-k">Plan</p>
          <p className="fp-user-spec-v">{user.plan.semanas} sem</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <FrecuenciaSelector
          value={user.plan.dias_entrenar_semana}
          onChange={mutations.setDiasEntrenarSemana}
          accent={PLAN_ACCENT}
        />
        <div className="fp-card" style={{ padding: 14, borderRadius: 12 }}>
          <p className="fp-cal-label mb-2">Modo del plan</p>
          <PlanModoSelector
            value={user.plan.modo}
            onChange={mutations.setPlanModo}
            frecuencia={user.plan.dias_entrenar_semana}
            accent={PLAN_ACCENT}
          />
        </div>
      </div>

      <div className="fp-card mb-4" style={{ padding: 14, borderRadius: 12 }}>
        <p className="fp-cal-label mb-2">Progresión de carga</p>
        <PlanProgresionSelector
          value={user.plan.progresion}
          onChange={mutations.setPlanProgresion}
          accent={PLAN_ACCENT}
        />
      </div>

      <div className="fp-card mb-4" style={{ padding: 14, borderRadius: 14 }}>
        <PlanSessionNav
          variant="embedded"
          semanas={user.plan.semanas}
          semanaActiva={semana}
          durationLabel="Duración del plan"
          showBothWeekActions
          semanaBloqueada={isSemanaBloqueada(user.id, user.plan, semana)}
          onSemanasChange={handleSemanasChange}
          onSemanaChange={onSemanaChange}
          onApplyToAll={() => mutations.applyWeek1ToAll()}
          onCopyWeekFrom={(origen) => mutations.copyWeekFrom(semana, origen)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start min-w-0">
        <VistaSemana
          user={user}
          selectedWeek={semana}
          rutinas={rutinas}
          modo={user.plan.modo}
          frecuencia={user.plan.dias_entrenar_semana}
          onCreateRutina={(idx) => openEditor(idx, 'create')}
          onAssignExisting={openPicker}
          onEdit={(idx) => openEditor(idx, 'edit')}
          onChangeRutina={openPicker}
        />

        <div className="lg:sticky lg:top-[78px] min-w-0 flex flex-col gap-4">
          <CompliancePanel user={user} />
          <UserPlannedLoadPanel user={user} semana={semana} ejercicios={ejercicios} rutinas={rutinas} />
        </div>
      </div>

      {editorRef ? (
        <SesionEditorSheet
          open={sesionEditorIndex != null}
          mode={editorMode}
          user={user}
          sesionRef={editorRef}
          rutinas={rutinas}
          ejercicios={ejercicios}
          onClose={closeEditor}
          onSave={(ref, draft) => mutations.saveSesionPersonalizada(ref, draft)}
          onResync={(ref, rutina) => mutations.resincronizarDesdeRutina(ref, rutina)}
        />
      ) : null}

      <RutinaPickerSheet
        open={pickerSesionIndex != null}
        rutinas={rutinas}
        semanasRestantes={semanasRestantes}
        entrenamientoLabel={pickerLabel}
        semana={semana}
        onClose={closePicker}
        onSelect={handleSelectRutina}
      />

      {guidedOpen ? (
        <GuidedPlanWizard
          user={user}
          rutinas={rutinas}
          ejercicios={ejercicios}
          reconfigure={hasConfiguredPlan}
          onClose={() => setGuidedOpen(false)}
          onSave={(plan) => {
            mutations.replacePlan(plan);
            setGuidedOpen(false);
            onSemanaChange(1);
          }}
        />
      ) : null}
    </>
  );
}
