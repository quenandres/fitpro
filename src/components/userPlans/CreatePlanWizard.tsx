import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Dumbbell, Check, Sparkles } from 'lucide-react';
import type { Rutina, Usuario, SemanaPlan, DiaSemana } from '../../types';
import { DIAS_SEMANA } from './diasSemana';
import { distribuirEjercicios } from '../../utils/distributeExercises';
import { Sheet } from '../common/Sheet';

interface Props {
  rutinas: Rutina[];
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

const ACCENT = '#a371f7';

export const CreatePlanWizard = ({ rutinas, nextUserId, onClose, onCreate }: Props) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [usuario, setUsuario] = useState<UsuarioDraft>({
    nombre: '',
    email: '',
    objetivo: '',
    nivel: 'Principiante',
    peso_kg: '',
  });
  const [plan, setPlan] = useState<PlanDraft>({ nombre: '', descripcion: '', semanas: 4 });
  const [diasSeleccionados, setDiasSeleccionados] = useState<number[]>([1, 3, 5]);
  const [rutinaBaseId, setRutinaBaseId] = useState<number | null>(null);
  const [aplicarATodas, setAplicarATodas] = useState(true);

  const rutinaBase = useMemo(
    () => rutinas.find((r) => r.id === rutinaBaseId),
    [rutinas, rutinaBaseId]
  );

  const distribucionPreview = useMemo(() => {
    if (!rutinaBase) return null;
    const ordenados = [...diasSeleccionados].sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b));
    return distribuirEjercicios(rutinaBase.ejercicios, ordenados);
  }, [rutinaBase, diasSeleccionados]);

  const step1Valid = usuario.nombre.trim().length > 0;
  const step2Valid = plan.nombre.trim().length > 0 && diasSeleccionados.length > 0;

  const toggleDia = (dia: number) => {
    setDiasSeleccionados((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const handleCrear = () => {
    const ordenados = [...diasSeleccionados].sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b));
    const distribucion = rutinaBase
      ? distribuirEjercicios(rutinaBase.ejercicios, ordenados)
      : null;

    const buildSemana = (semanaNum: number): SemanaPlan => {
      const dias: DiaSemana[] = DIAS_SEMANA.map((d) => {
        const seleccionado = diasSeleccionados.includes(d.dia);
        if (!seleccionado) {
          return {
            dia: d.dia,
            nombre: d.nombre,
            rutina_id: null,
            rutina_nombre: '',
            ejercicios_personalizados: [],
          };
        }
        if (distribucion && rutinaBase && (aplicarATodas || semanaNum === 1)) {
          const ejercicios = distribucion.get(d.dia) || [];
          return {
            dia: d.dia,
            nombre: d.nombre,
            rutina_id: rutinaBase.id,
            rutina_nombre: rutinaBase.nombre,
            ejercicios_personalizados: ejercicios,
          };
        }
        return {
          dia: d.dia,
          nombre: d.nombre,
          rutina_id: 0,
          rutina_nombre: 'Entrenamiento',
          ejercicios_personalizados: [],
        };
      });
      return { semana: semanaNum, dias, notas: '' };
    };

    const newUser: Usuario = {
      id: nextUserId,
      nombre: usuario.nombre,
      email: usuario.email,
      objetivo: usuario.objetivo,
      nivel: usuario.nivel,
      peso_kg: usuario.peso_kg.trim() ? Number(usuario.peso_kg) : undefined,
      dias_entrenar: diasSeleccionados.length,
      plan: {
        id: nextUserId,
        nombre: plan.nombre,
        descripcion: plan.descripcion,
        semanas: plan.semanas,
        dias_entrenar_semana: diasSeleccionados.length,
        rutinas_asignadas: rutinaBase
          ? [
              {
                rutina_id: rutinaBase.id,
                nombre_rutina: rutinaBase.nombre,
                frecuencia: `${diasSeleccionados.length} días/semana`,
              },
            ]
          : [],
        ejercicios_personalizados: [],
        programacion_semanal: Array.from({ length: plan.semanas }, (_, i) => buildSemana(i + 1)),
      },
    };

    onCreate(newUser);
  };

  const renderStepDots = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
      {[1, 2, 3].map((s) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: s === 3 ? 'initial' : 1 }}>
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
          {s < 3 && (
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
      immersive
      zIndex={100}
      ariaLabel="Crear nuevo plan"
      panelClassName="p-5 md:p-6"
    >
      <div className="max-w-[520px] mx-auto w-full">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <h2
            className="font-sora"
            style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
          >
            Crear Nuevo Plan
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              cursor: 'pointer',
              padding: 8,
            }}
            aria-label="Cerrar"
          >
            <X size={18} color="var(--text-muted)" />
          </button>
        </div>

        {renderStepDots()}

        {step === 1 && (
          <div className="animate-slide-up">
            <p style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: '0.08em', marginBottom: 14 }}>
              PASO 1 · USUARIO
            </p>
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Nombre
              </p>
              <input
                className="fp-input"
                placeholder="Juan Pérez"
                value={usuario.nombre}
                onChange={(e) => setUsuario({ ...usuario, nombre: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Email
              </p>
              <input
                className="fp-input"
                placeholder="juan@email.com"
                value={usuario.email}
                onChange={(e) => setUsuario({ ...usuario, email: e.target.value })}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                  Objetivo
                </p>
                <input
                  className="fp-input"
                  placeholder="Ganar músculo"
                  value={usuario.objetivo}
                  onChange={(e) => setUsuario({ ...usuario, objetivo: e.target.value })}
                />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                  Nivel
                </p>
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
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Peso (kg)
              </p>
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
              PASO 2 · PLAN Y CALENDARIO
            </p>
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Nombre del plan
              </p>
              <input
                className="fp-input"
                placeholder="Plan Fuerza 12 semanas"
                value={plan.nombre}
                onChange={(e) => setPlan({ ...plan, nombre: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Descripción
              </p>
              <input
                className="fp-input"
                placeholder="Descripción breve"
                value={plan.descripcion}
                onChange={(e) => setPlan({ ...plan, descripcion: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Duración (semanas)
              </p>
              <input
                type="number"
                min={1}
                max={52}
                className="fp-input"
                value={plan.semanas}
                onChange={(e) => setPlan({ ...plan, semanas: Math.max(1, parseInt(e.target.value) || 1) })}
              />
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                {Math.ceil(plan.semanas / 4)} {Math.ceil(plan.semanas / 4) === 1 ? 'mes' : 'meses'} aproximados
              </p>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 12,
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border)',
                marginBottom: 16,
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT, marginBottom: 10 }}>
                Días de entrenamiento
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {DIAS_SEMANA.map((d) => {
                  const activo = diasSeleccionados.includes(d.dia);
                  return (
                    <button
                      key={d.dia}
                      onClick={() => toggleDia(d.dia)}
                      type="button"
                      style={{
                        padding: '8px 14px',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 600,
                        border: activo ? `2px solid ${ACCENT}` : '1px solid var(--border)',
                        background: activo ? `${ACCENT}20` : 'var(--bg-card)',
                        color: activo ? ACCENT : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all .15s',
                      }}
                    >
                      {d.nombreCorto}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
                {diasSeleccionados.length} {diasSeleccionados.length === 1 ? 'día' : 'días'} por semana ·{' '}
                {7 - diasSeleccionados.length} descanso
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-slide-up">
            <p style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: '0.08em', marginBottom: 14 }}>
              PASO 3 · RUTINA BASE (OPCIONAL)
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Los ejercicios se repartirán equitativamente entre los {diasSeleccionados.length} días
              seleccionados.
            </p>

            <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
              <button
                onClick={() => setRutinaBaseId(null)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border:
                    rutinaBaseId === null
                      ? `2px solid ${ACCENT}`
                      : '1px solid var(--border)',
                  background: rutinaBaseId === null ? `${ACCENT}15` : 'var(--bg-card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9,
                    background: 'var(--bg-overlay)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={16} color="var(--text-muted)" />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Sin rutina base
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Crear días vacíos</p>
                </div>
              </button>

              {rutinas.map((r) => {
                const activa = rutinaBaseId === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setRutinaBaseId(r.id)}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      border: activa ? `2px solid ${ACCENT}` : '1px solid var(--border)',
                      background: activa ? `${ACCENT}15` : 'var(--bg-card)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 9,
                        background: 'linear-gradient(135deg,#22c55e,#15803d)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Dumbbell size={16} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {r.nombre}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {r.dificultad} · {r.ejercicios.length} ejercicios · {r.duracion_min} min
                      </p>
                    </div>
                    {activa && <Check size={16} color={ACCENT} />}
                  </button>
                );
              })}
            </div>

            {rutinaBase && distribucionPreview && (
              <div
                style={{
                  padding: 14,
                  borderRadius: 12,
                  background: `${ACCENT}10`,
                  border: `1px solid ${ACCENT}40`,
                  marginBottom: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Sparkles size={14} color={ACCENT} />
                  <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT }}>
                    Auto-distribución
                  </p>
                </div>
                <div style={{ display: 'grid', gap: 4 }}>
                  {DIAS_SEMANA.filter((d) => diasSeleccionados.includes(d.dia)).map((d) => {
                    const cantidad = distribucionPreview.get(d.dia)?.length ?? 0;
                    return (
                      <div
                        key={d.dia}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '4px 0',
                        }}
                      >
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.nombre}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, color: ACCENT }}>
                          {cantidad} {cantidad === 1 ? 'ejercicio' : 'ejercicios'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: 12,
                borderRadius: 10,
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                marginBottom: 12,
              }}
            >
              <input
                type="checkbox"
                checked={aplicarATodas}
                onChange={(e) => setAplicarATodas(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                  Aplicar a todas las semanas
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  Replicar la distribución a las {plan.semanas} semanas del plan
                </p>
              </div>
            </label>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          {step > 1 && (
            <button
              onClick={() => setStep((step - 1) as 1 | 2 | 3)}
              className="fp-btn fp-btn-secondary"
              style={{ flex: 1, gap: 6 }}
            >
              <ChevronLeft size={14} /> Atrás
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep((step + 1) as 1 | 2 | 3)}
              className="fp-btn fp-btn-primary"
              style={{ flex: 1, gap: 6 }}
              disabled={(step === 1 && !step1Valid) || (step === 2 && !step2Valid)}
            >
              Siguiente <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleCrear}
              className="fp-btn fp-btn-primary"
              style={{ flex: 1, gap: 6 }}
            >
              <Plus size={14} /> Crear Plan
            </button>
          )}
        </div>
      </div>
    </Sheet>
  );
};
