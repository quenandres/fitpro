import { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Dumbbell,
  RefreshCw,
  Copy,
  X,
} from 'lucide-react';
import type { Ejercicio, EjercicioPersonalizado, Rutina, Usuario } from '../../types';
import { DIAS_SEMANA } from './diasSemana';
import { EjercicioSortable } from './EjercicioSortable';
import { RutinaVersionBanner } from './RutinaVersionBanner';
import { compareRutinaSnapshot } from '../../utils/compareRutinaSnapshot';
import { buildEjId } from './dragIds';
import {
  ExercisePickerOverlay,
  type PickedExercise,
} from '../exercise/ExercisePickerOverlay';

interface Props {
  user: Usuario;
  semana: number;
  diaIndex: number;
  onChangeSemana: (semana: number) => void;
  onChangeDia: (diaIndex: number) => void;
  onBack?: () => void;
  /** Oculta navegación semanal/diaria (p. ej. dentro de DiaEditorSheet). */
  embedded?: boolean;
  onToggleEntreno: () => void;
  onSelectRutina: (rutina: Rutina) => void;
  onAddEjercicio: (ejercicio: EjercicioPersonalizado, replicarEnSiguientes: boolean) => void;
  onRemoveEjercicio: (index: number) => void;
  onUpdateEjercicio: (index: number, updates: Partial<EjercicioPersonalizado>) => void;
  onResync: (rutina: Rutina) => void;
  rutinas: Rutina[];
  ejercicios: Ejercicio[];
}

const ACCENT = 'var(--accent-purple)';
const ENTRENO = 'var(--brand)';

export const VistaDia = ({
  user,
  semana,
  diaIndex,
  onChangeSemana,
  onChangeDia,
  onBack,
  embedded = false,
  onToggleEntreno,
  onSelectRutina,
  onAddEjercicio,
  onRemoveEjercicio,
  onUpdateEjercicio,
  onResync,
  rutinas,
  ejercicios,
}: Props) => {
  const [showRutinaPicker, setShowRutinaPicker] = useState(false);
  const [showEjercicioPicker, setShowEjercicioPicker] = useState(false);
  const [pendingEjercicio, setPendingEjercicio] = useState<EjercicioPersonalizado | null>(null);

  const semanasSiguientes = Math.max(0, user.plan.semanas - semana);

  const handlePickEjercicio = (ejercicio: EjercicioPersonalizado) => {
    setShowEjercicioPicker(false);
    if (semanasSiguientes === 0) {
      onAddEjercicio(ejercicio, false);
      return;
    }
    setPendingEjercicio(ejercicio);
  };

  const confirmAddEjercicio = (replicar: boolean) => {
    if (!pendingEjercicio) return;
    onAddEjercicio(pendingEjercicio, replicar);
    setPendingEjercicio(null);
  };

  const handlePickFromOverlay = (pick: PickedExercise) => {
    handlePickEjercicio({
      nombre: pick.nombre,
      series: 3,
      reps: pick.unidad_id_default === 1 ? 12 : 10,
      notas: '',
      ejercicio_id: pick.ejercicio_id,
      musculos_anatomia: pick.musculos_anatomia,
    });
  };

  const semanaPlan = user.plan.programacion_semanal.find((s) => s.semana === semana);
  const dia = semanaPlan?.dias[diaIndex];

  const rutinaBase = rutinas.find((r) => r.id === dia?.rutina_id);
  const syncStatus = dia ? compareRutinaSnapshot(rutinaBase, dia) : 'sin_rutina';

  if (!dia) return null;

  const isEntreno = dia.rutina_id !== null;
  const sinConfigurar = !isEntreno && dia.ejercicios_personalizados.length === 0;

  const ejerciciosIds = dia.ejercicios_personalizados.map((_, i) =>
    buildEjId(semana, diaIndex, i)
  );

  const nombreDia =
    DIAS_SEMANA.find((dd) => dd.dia === dia.dia)?.nombre ?? dia.dia;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            className="fp-btn fp-btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '5px 10px' }}
          >
            <ChevronLeft size={14} />
            Volver
          </button>
        )}
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--text-primary)',
            flex: 1,
            textAlign: onBack ? 'center' : 'left',
          }}
        >
          {nombreDia}
          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · Semana {semana}</span>
        </span>
        <button
          type="button"
          onClick={onToggleEntreno}
          className="fp-btn fp-btn-secondary text-xs"
          style={{
            background: isEntreno ? 'rgba(248,81,73,.12)' : 'var(--brand-dim)',
            color: isEntreno ? 'var(--accent-red)' : ENTRENO,
            borderColor: isEntreno ? 'rgba(248,81,73,.25)' : 'rgba(34,197,94,.25)',
          }}
        >
          {isEntreno ? 'Marcar descanso' : 'Activar día'}
        </button>
      </div>

      {!embedded ? (
        <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 14,
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => onChangeSemana(Math.max(1, semana - 1))}
          disabled={semana === 1}
          className="fp-btn fp-btn-ghost p-1.5"
          aria-label="Semana anterior"
        >
          <ChevronLeft size={14} />
        </button>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 70, textAlign: 'center' }}>
          Sem {semana} / {user.plan.semanas}
        </span>
        <button
          onClick={() => onChangeSemana(Math.min(user.plan.semanas, semana + 1))}
          disabled={semana === user.plan.semanas}
          className="fp-btn fp-btn-ghost"
          style={{ padding: 5 }}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 6,
          marginBottom: 16,
          overflowX: 'auto',
          paddingBottom: 4,
        }}
      >
        {semanaPlan?.dias.map((d, idx) => {
          const activo = idx === diaIndex;
          const tieneEjs = d.ejercicios_personalizados.length > 0;
          return (
            <button
              key={idx}
              onClick={() => onChangeDia(idx)}
              style={{
                flex: '0 0 auto',
                padding: '10px 14px',
                borderRadius: 10,
                border: activo ? `2px solid ${ACCENT}` : '1px solid var(--border)',
                background: activo ? `${ACCENT}20` : 'var(--bg-overlay)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                minWidth: 56,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: activo ? ACCENT : 'var(--text-muted)',
                  letterSpacing: '0.06em',
                }}
              >
                {DIAS_SEMANA.find((dd) => dd.dia === d.dia)?.nombreCorto.toUpperCase()}
              </span>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: tieneEjs ? ENTRENO : 'transparent',
                  border: tieneEjs ? 'none' : '1px solid var(--border)',
                }}
              />
            </button>
          );
        })}
      </div>
        </>
      ) : null}

      <RutinaVersionBanner
        status={syncStatus}
        rutinaNombre={dia.rutina_nombre}
        onResync={rutinaBase ? () => onResync(rutinaBase) : undefined}
      />

      {sinConfigurar ? (
        <div style={{ textAlign: 'center', padding: '32px 20px' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'var(--bg-overlay)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              border: '1px solid var(--border)',
            }}
          >
            <Calendar size={24} color="var(--text-muted)" />
          </div>
          <p
            style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}
          >
            Día de descanso
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
            Activa el día para asignar una rutina o añadir ejercicios sueltos
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                onToggleEntreno();
                setShowRutinaPicker(true);
              }}
              className="fp-btn fp-btn-primary"
              style={{ gap: 6 }}
            >
              <Dumbbell size={14} /> Asignar rutina
            </button>
            <button
              onClick={() => {
                if (!isEntreno) onToggleEntreno();
                setShowEjercicioPicker(true);
              }}
              className="fp-btn fp-btn-secondary"
              style={{ gap: 6 }}
            >
              <Plus size={14} /> Ejercicio suelto
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="fp-btn fp-btn-ghost"
                style={{ gap: 6, marginTop: 4 }}
              >
                <ChevronLeft size={14} /> Volver al calendario
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div
            style={{
              padding: 14,
              borderRadius: 12,
              background: rutinaBase ? `${ACCENT}15` : 'var(--bg-overlay)',
              border: rutinaBase ? `1px solid ${ACCENT}40` : '1px solid var(--border)',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}
            >
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {dia.rutina_nombre || 'Entrenamiento libre'}
              </p>
              <button
                onClick={() => setShowRutinaPicker((v) => !v)}
                className="fp-btn fp-btn-ghost"
                style={{ fontSize: 11, padding: '4px 8px' }}
              >
                {rutinaBase ? 'Cambiar' : 'Asignar rutina'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {dia.ejercicios_personalizados.length} ejercicios configurados
            </p>
          </div>

          {showRutinaPicker && (
            <div
              style={{
                marginBottom: 16,
                padding: 14,
                borderRadius: 12,
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border)',
              }}
              className="animate-slide-down"
            >
              <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
                Seleccionar rutina base
              </p>
              <div style={{ display: 'grid', gap: 6, maxHeight: 260, overflow: 'auto' }}>
                {rutinas.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onSelectRutina(r);
                      setShowRutinaPicker(false);
                    }}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {r.nombre}
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      {r.dificultad} · {r.duracion_min} min · {r.ejercicios.length} ejercicios
                    </p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowRutinaPicker(false)}
                className="fp-btn fp-btn-ghost"
                style={{ marginTop: 10, width: '100%', fontSize: 11 }}
              >
                Cancelar
              </button>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Ejercicios
            </p>
            <button
              onClick={() => setShowEjercicioPicker(true)}
              className="fp-btn fp-btn-primary"
              style={{ gap: 4, fontSize: 11, padding: '6px 12px' }}
            >
              <Plus size={12} /> Añadir
            </button>
          </div>

          {showEjercicioPicker && (
            <ExercisePickerOverlay
              localExercises={ejercicios}
              selectedNames={dia.ejercicios_personalizados.map((e) => e.nombre)}
              onSelect={handlePickFromOverlay}
              onClose={() => setShowEjercicioPicker(false)}
              title="Añadir ejercicio al día"
            />
          )}

          <SortableContext items={ejerciciosIds} strategy={verticalListSortingStrategy}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dia.ejercicios_personalizados.map((ej, ejIndex) => (
                <EjercicioSortable
                  key={ejerciciosIds[ejIndex]}
                  id={ejerciciosIds[ejIndex]}
                  ejercicio={ej}
                  onRemove={() => onRemoveEjercicio(ejIndex)}
                  onUpdate={(updates) => onUpdateEjercicio(ejIndex, updates)}
                />
              ))}
              {dia.ejercicios_personalizados.length === 0 && (
                <div
                  style={{
                    padding: 30,
                    textAlign: 'center',
                    background: 'var(--bg-overlay)',
                    borderRadius: 10,
                  }}
                >
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    No hay ejercicios. Toca "Añadir" para agregar.
                  </p>
                </div>
              )}
            </div>
          </SortableContext>

          {rutinaBase && syncStatus === 'modificada' && (
            <button
              onClick={() => onResync(rutinaBase)}
              className="fp-btn fp-btn-secondary"
              style={{ width: '100%', marginTop: 12, gap: 6, fontSize: 12 }}
            >
              <RefreshCw size={13} /> Resincronizar con {rutinaBase.nombre}
            </button>
          )}
        </div>
      )}

      {pendingEjercicio && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.55)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          className="animate-fade-in"
          onClick={() => setPendingEjercicio(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="fp-card animate-slide-up"
            style={{
              maxWidth: 420,
              width: '100%',
              padding: 20,
              borderRadius: 14,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${ACCENT}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Copy size={16} color={ACCENT} />
                </div>
                <p
                  className="font-sora"
                  style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}
                >
                  Añadir ejercicio
                </p>
              </div>
              <button
                onClick={() => setPendingEjercicio(null)}
                style={{
                  background: 'var(--bg-overlay)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: 6,
                  cursor: 'pointer',
                }}
                aria-label="Cerrar"
              >
                <X size={14} color="var(--text-muted)" />
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
              <strong style={{ color: 'var(--text-primary)' }}>{pendingEjercicio.nombre}</strong>
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18, lineHeight: 1.4 }}>
              Lo añadiremos al <strong>{dia.nombre}</strong> de la semana {semana}. ¿Replicarlo
              también en ese mismo día de las {semanasSiguientes}{' '}
              {semanasSiguientes === 1 ? 'semana siguiente' : 'semanas siguientes'}?
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => confirmAddEjercicio(true)}
                className="fp-btn fp-btn-primary"
                style={{ width: '100%', gap: 6, justifyContent: 'center' }}
              >
                <Copy size={13} /> Replicar en {semanasSiguientes}{' '}
                {semanasSiguientes === 1 ? 'semana' : 'semanas'}
              </button>
              <button
                onClick={() => confirmAddEjercicio(false)}
                className="fp-btn fp-btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Solo esta semana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
