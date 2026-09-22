import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, ClipboardList, Plus, Sparkles, X } from 'lucide-react';
import type { SemanaPlan, Usuario } from '../../types';
import { FRECUENCIA_IDEAL, createEmptySemanaPlan } from '../../utils/planScheduleUtils';
import { fechaLocalISO } from '../../utils/trackingUtils';
import { gatewayErrorMessage } from '../../lib/gateway/errors';
import { inviteClient } from '../../lib/gateway/training.service';
import {
  composeClienteObjetivo,
  generateClientPlanFromObjetivo,
  programacionToInviteSemanas,
} from '../../utils/generateClientRoutine';
import { persistRoutineToGateway } from '../../utils/persistRoutineToGateway';
import { useDataStore } from '../../store/useDataStore';
import { FrecuenciaSelector } from './FrecuenciaSelector';
import { Sheet } from '../common/Sheet';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  nextUserId: number;
  onClose: () => void;
  onCreate: (user: Usuario) => void;
}

interface UsuarioDraft {
  nombre: string;
  email: string;
  objetivo: string;
  nivel: string;
  peso_kg: string;
}

interface PlanDraft {
  nombre: string;
  descripcion: string;
  semanas: number;
}

const ACCENT = 'var(--accent-purple)';
const MODO_INICIAL = 'sesiones_variables';

export const CreatePlanWizard = ({ nextUserId, onClose, onCreate }: Props) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [usuario, setUsuario] = useState<UsuarioDraft>({
    nombre: '',
    email: '',
    objetivo: '',
    nivel: 'Principiante',
    peso_kg: '',
  });
  const [plan, setPlan] = useState<PlanDraft>({ nombre: '', descripcion: '', semanas: 4 });
  const [frecuencia, setFrecuencia] = useState(FRECUENCIA_IDEAL);
  const [generateAi, setGenerateAi] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'generating' | 'inviting'>('idle');
  const [error, setError] = useState<string | null>(null);
  const addRutina = useDataStore((s) => s.addRutina);

  const emailOk = EMAIL_RE.test(usuario.email.trim());
  const objetivoMcp = composeClienteObjetivo(usuario.objetivo, plan.descripcion);
  const step1Valid = usuario.nombre.trim().length > 0 && emailOk;
  const aiReady = !generateAi || (objetivoMcp.length >= 10 && objetivoMcp.length <= 500);
  const step2Valid = plan.nombre.trim().length > 0 && aiReady;

  const goToStep2 = () => {
    setPlan((p) => ({
      ...p,
      nombre: p.nombre.trim() ? p.nombre : `Plan de ${usuario.nombre.trim()}`,
    }));
    setStep(2);
  };

  const handleCrear = async () => {
    if (!step1Valid || !step2Valid || saving) return;
    const nombre = usuario.nombre.trim();
    const email = usuario.email.trim().toLowerCase();
    const planNombre = plan.nombre.trim();
    const pesoParsed = usuario.peso_kg.trim() ? Number(usuario.peso_kg) : undefined;
    const pesoKg =
      pesoParsed != null && Number.isFinite(pesoParsed) && pesoParsed >= 20 && pesoParsed <= 300
        ? pesoParsed
        : undefined;

    setSaving(true);
    setError(null);
    let currentPhase: 'generating' | 'inviting' = 'inviting';
    try {
      let programacion: SemanaPlan[] = Array.from({ length: plan.semanas }, (_, i) =>
        createEmptySemanaPlan(i + 1, frecuencia, MODO_INICIAL),
      );
      let generatedDraft: Awaited<ReturnType<typeof generateClientPlanFromObjetivo>>['draft'] | null =
        null;

      if (generateAi) {
        currentPhase = 'generating';
        setPhase('generating');
        const generated = await generateClientPlanFromObjetivo({
          objetivo: objetivoMcp,
          nivel: usuario.nivel,
          pesoKg,
          diasEntrenar: frecuencia,
          semanas: plan.semanas,
        });
        programacion = generated.programacion;
        generatedDraft = generated.draft;
      }

      currentPhase = 'inviting';
      setPhase('inviting');
      const created = await inviteClient({
        email,
        full_name: nombre,
        plan_nombre: planNombre,
        semanas: programacionToInviteSemanas(programacion),
      });

      if (generatedDraft) {
        try {
          await persistRoutineToGateway({
            ...generatedDraft.rutina,
            descripcion: generatedDraft.rutina.descripcion || objetivoMcp,
          });
          addRutina(generatedDraft.rutina);
        } catch {
          // La plantilla en biblioteca es opcional; el plan ya viajó en el invite.
        }
      }

      const newUser: Usuario = {
        id: nextUserId,
        client_uuid: created.client_id,
        nombre,
        email: created.email,
        objetivo: usuario.objetivo,
        nivel: usuario.nivel,
        peso_kg: pesoKg,
        dias_entrenar: frecuencia,
        plan: {
          id: nextUserId,
          nombre: planNombre,
          descripcion: plan.descripcion,
          semanas: plan.semanas,
          dias_entrenar_semana: frecuencia,
          modo: MODO_INICIAL,
          progresion: 'fijo',
          fecha_inicio: fechaLocalISO(new Date()),
          rutinas_asignadas: [],
          ejercicios_personalizados: [],
          programacion_semanal: programacion,
        },
      };
      onCreate(newUser);
    } catch (err) {
      if (currentPhase === 'generating') {
        const message =
          err instanceof Error && err.message
            ? err.message
            : 'No se pudo generar la rutina. Desactiva la IA para crear el plan vacío.';
        setError(message);
      } else {
        setError(gatewayErrorMessage(err, 'No se pudo crear el cliente'));
      }
    } finally {
      setSaving(false);
      setPhase('idle');
    }
  };

  const renderStepDots = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
      {[1, 2].map((s) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: s === 2 ? 'initial' : 1 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: step >= s ? ACCENT : 'var(--bg-overlay)',
              color: step >= s ? '#fff' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              border: step === s ? `2px solid ${ACCENT}` : '2px solid transparent',
              transition: 'background .2s',
            }}
          >
            {step > s ? <Check size={14} /> : s}
          </div>
          {s < 2 && (
            <div
              style={{
                flex: 1,
                height: 2,
                background: step > s ? ACCENT : 'var(--border)',
                transition: 'background .2s',
              }}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Sheet
      open
      onClose={onClose}
      flexColumn
      immersive
      zIndex={100}
      ariaLabel="Nuevo cliente"
      panelClassName="md:max-w-lg"
    >
      <div className="flex flex-col min-h-0 flex-1 max-w-[520px] mx-auto w-full">
        <div className="shrink-0 flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-sora text-xl font-bold text-primary tracking-tight">
            Nuevo cliente
          </h2>
          <button type="button" onClick={onClose} className="fp-btn fp-btn-ghost p-2" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="shrink-0 px-5">{renderStepDots()}</div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
          {step === 1 && (
            <div className="animate-slide-up">
              <p style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: '0.08em', marginBottom: 14 }}>
                PASO 1 · CLIENTE
              </p>
              <div className="mb-3.5">
                <label className="fp-cal-label">Nombre</label>
                <input
                  className="fp-input"
                  placeholder="Juan Pérez"
                  value={usuario.nombre}
                  onChange={(e) => setUsuario({ ...usuario, nombre: e.target.value })}
                />
              </div>
              <div className="mb-3.5">
                <label className="fp-cal-label" htmlFor="nuevo-cliente-email">Email</label>
                <input
                  id="nuevo-cliente-email"
                  className="fp-input"
                  type="email"
                  autoComplete="email"
                  placeholder="juan@email.com"
                  value={usuario.email}
                  onChange={(e) => setUsuario({ ...usuario, email: e.target.value })}
                />
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                  Le enviaremos un enlace para entrar a la app.
                </p>
                {usuario.email.trim() && !emailOk ? (
                  <p style={{ fontSize: 12, color: 'var(--accent-red)', marginTop: 6 }}>
                    Escribe un email válido para poder enviar el acceso.
                  </p>
                ) : null}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label className="fp-cal-label">Objetivo</label>
                  <input
                    className="fp-input"
                    placeholder="Ganar músculo"
                    value={usuario.objetivo}
                    onChange={(e) => setUsuario({ ...usuario, objetivo: e.target.value })}
                  />
                </div>
                <div>
                  <label className="fp-cal-label">Nivel</label>
                  <select
                    className="fp-input"
                    value={usuario.nivel}
                    onChange={(e) => setUsuario({ ...usuario, nivel: e.target.value })}
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>
              <div className="mb-3.5">
                <label className="fp-cal-label">Peso (kg)</label>
                <input
                  className="fp-input"
                  type="number"
                  min={30}
                  max={250}
                  placeholder="75"
                  value={usuario.peso_kg}
                  onChange={(e) => setUsuario({ ...usuario, peso_kg: e.target.value })}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-slide-up">
              <p style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: '0.08em', marginBottom: 14 }}>
                PASO 2 · PLAN
              </p>
              <div className="mb-3.5">
                <label className="fp-cal-label">Nombre del plan</label>
                <input
                  className="fp-input"
                  placeholder="Plan Fuerza 12 semanas"
                  value={plan.nombre}
                  onChange={(e) => setPlan({ ...plan, nombre: e.target.value })}
                />
              </div>
              <div className="mb-3.5">
                <label className="fp-cal-label" htmlFor="nuevo-cliente-descripcion">
                  Qué quiere entrenar
                </label>
                <textarea
                  id="nuevo-cliente-descripcion"
                  className="fp-input resize-none"
                  rows={4}
                  maxLength={500}
                  placeholder="Hipertrofia de tren superior, 4 días, sin lesiones. Prefiere mancuernas y polea."
                  value={plan.descripcion}
                  onChange={(e) => setPlan({ ...plan, descripcion: e.target.value })}
                />
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                  Se combina con el objetivo del paso 1
                  {generateAi ? ' para que la IA arme la rutina.' : '.'}{' '}
                  {objetivoMcp.length}/500
                </p>
                {generateAi && !aiReady ? (
                  <p style={{ fontSize: 12, color: 'var(--accent-red)', marginTop: 6 }}>
                    Escribe al menos 10 caracteres entre el objetivo y esta descripción.
                  </p>
                ) : null}
              </div>

              <label
                className="mb-4 flex items-start gap-3 cursor-pointer"
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: generateAi ? `${ACCENT}10` : 'var(--bg-overlay)',
                  border: `1px solid ${generateAi ? `${ACCENT}40` : 'var(--border)'}`,
                }}
              >
                <input
                  type="checkbox"
                  id="nuevo-cliente-ia"
                  checked={generateAi}
                  onChange={(e) => setGenerateAi(e.target.checked)}
                  disabled={saving}
                  aria-label="Crear rutina automáticamente con IA"
                  style={{ marginTop: 3 }}
                />
                <span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 700,
                      color: generateAi ? ACCENT : 'var(--text-primary)',
                    }}
                  >
                    <Sparkles size={14} /> Crear rutina automáticamente con IA
                  </span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.45 }}>
                    La IA del gateway genera los ejercicios y los asignamos al plan al crear el cliente.
                  </span>
                </span>
              </label>
              <div className="mb-4">
                <label className="fp-cal-label">Duración (semanas)</label>
                <input
                  type="number"
                  min={1}
                  max={52}
                  className="fp-input"
                  value={plan.semanas}
                  onChange={(e) => setPlan({ ...plan, semanas: Math.max(1, parseInt(e.target.value) || 1) })}
                />
              </div>

              <div className="mb-4">
                <FrecuenciaSelector value={frecuencia} onChange={setFrecuencia} accent={ACCENT} />
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: `${ACCENT}10`,
                  border: `1px solid ${ACCENT}40`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <ClipboardList size={14} color={ACCENT} />
                  <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT }}>Siguiente paso</p>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {generateAi
                    ? `La IA arma ${frecuencia} ${frecuencia === 1 ? 'entrenamiento' : 'entrenamientos'} por semana a partir de lo que quiere el cliente. Si falla, desactiva la IA para crear el plan vacío.`
                    : `Al crear el cliente guardamos su plan con ${frecuencia} ${frecuencia === 1 ? 'entrenamiento' : 'entrenamientos'} por semana y le enviamos el enlace de acceso. Después asignas las plantillas en Entrenamientos.`}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 flex flex-col gap-2.5 px-5 py-4 border-t border-line bg-elevated">
          {error ? (
            <p style={{ fontSize: 13, color: 'var(--accent-red)', margin: 0 }} role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex gap-2.5">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="fp-btn fp-btn-secondary flex-1 gap-1.5"
              disabled={saving}
            >
              <ChevronLeft size={14} /> Atrás
            </button>
          )}
          {step === 1 ? (
            <button
              type="button"
              onClick={goToStep2}
              className="fp-btn fp-btn-primary flex-1 gap-1.5"
              disabled={!step1Valid || saving}
            >
              Siguiente <ChevronRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleCrear()}
              className="fp-btn fp-btn-primary flex-1 gap-1.5"
              disabled={!step2Valid || saving}
            >
              {generateAi ? <Sparkles size={14} /> : <Plus size={14} />}{' '}
              {phase === 'generating'
                ? 'Generando rutina…'
                : phase === 'inviting'
                  ? 'Enviando acceso…'
                  : generateAi
                    ? 'Crear con rutina IA'
                    : 'Crear y enviar acceso'}
            </button>
          )}
          </div>
        </div>
      </div>
    </Sheet>
  );
};
