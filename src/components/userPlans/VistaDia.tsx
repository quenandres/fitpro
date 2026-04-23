import { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Dumbbell,
  RefreshCw,
  Search,
} from 'lucide-react';
import type { Ejercicio, EjercicioPersonalizado, Rutina, Usuario } from '../../types';
import { DIAS_SEMANA } from './diasSemana';
import { EjercicioSortable } from './EjercicioSortable';
import { RutinaVersionBanner } from './RutinaVersionBanner';
import { compareRutinaSnapshot } from '../../utils/compareRutinaSnapshot';
import { buildEjId } from './dragIds';

interface Props {
  user: Usuario;
  semana: number;
  diaIndex: number;
  onChangeSemana: (semana: number) => void;
  onChangeDia: (diaIndex: number) => void;
  onToggleEntreno: () => void;
  onSelectRutina: (rutina: Rutina) => void;
  onAddEjercicio: (ejercicio: EjercicioPersonalizado) => void;
  onRemoveEjercicio: (index: number) => void;
  onUpdateEjercicio: (index: number, updates: Partial<EjercicioPersonalizado>) => void;
  onResync: (rutina: Rutina) => void;
  rutinas: Rutina[];
  ejercicios: Ejercicio[];
}

const ACCENT = '#a371f7';
const ENTRENO = '#22c55e';

export const VistaDia = ({
  user,
  semana,
  diaIndex,
  onChangeSemana,
  onChangeDia,
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
  const [ejSearch, setEjSearch] = useState('');

  const semanaPlan = user.plan.programacion_semanal.find((s) => s.semana === semana);
  const dia = semanaPlan?.dias[diaIndex];

  const rutinaBase = rutinas.find((r) => r.id === dia?.rutina_id);
  const syncStatus = dia ? compareRutinaSnapshot(rutinaBase, dia) : 'sin_rutina';

  const ejSearchTerm = ejSearch.toLowerCase().trim();
  const ejerciciosFiltrados = ejSearchTerm
    ? ejercicios.filter(
        (e) =>
          e.nombre.toLowerCase().includes(ejSearchTerm) ||
          e.categoria.toLowerCase().includes(ejSearchTerm) ||
          e.grupo_muscular.some((g) => g.toLowerCase().includes(ejSearchTerm))
      )
    : ejercicios;

  if (!dia) return null;

  const isEntreno = dia.rutina_id !== null;
  const sinConfigurar =
    !isEntreno ||
    ((dia.rutina_id === -1 || dia.rutina_id === 0) && dia.ejercicios_personalizados.length === 0);

  const ejerciciosIds = dia.ejercicios_personalizados.map((_, i) =>
    buildEjId(semana, diaIndex, i)
  );

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => onChangeSemana(Math.max(1, semana - 1))}
            disabled={semana === 1}
            className="fp-btn fp-btn-ghost"
            style={{ padding: 6 }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Semana {semana}</span>
          <button
            onClick={() => onChangeSemana(Math.min(user.plan.semanas, semana + 1))}
            disabled={semana === user.plan.semanas}
            className="fp-btn fp-btn-ghost"
            style={{ padding: 6 }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <button
          onClick={onToggleEntreno}
          className="fp-btn"
          style={{
            background: isEntreno ? '#f8514920' : '#22c55e20',
            color: isEntreno ? '#f85149' : ENTRENO,
            border: 'none',
            fontSize: 12,
          }}
        >
          {isEntreno ? 'Marcar descanso' : 'Activar día'}
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

      <RutinaVersionBanner
        status={syncStatus}
        rutinaNombre={dia.rutina_nombre}
        onResync={rutinaBase ? () => onResync(rutinaBase) : undefined}
      />

      {sinConfigurar ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'var(--bg-overlay)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Calendar size={28} color="var(--text-muted)" />
          </div>
          <p
            style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}
          >
            Día sin configurar
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
            Elige una rutina base o añade ejercicios sueltos
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowRutinaPicker(true)}
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
              onClick={() => setShowEjercicioPicker((v) => !v)}
              className="fp-btn fp-btn-primary"
              style={{ gap: 4, fontSize: 11, padding: '6px 12px' }}
            >
              <Plus size={12} /> Añadir
            </button>
          </div>

          {showEjercicioPicker && (
            <div
              style={{
                marginBottom: 14,
                padding: 14,
                borderRadius: 12,
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border)',
              }}
              className="animate-slide-down"
            >
              <div style={{ position: 'relative', marginBottom: 10 }}>
                <Search
                  size={13}
                  color="var(--text-muted)"
                  style={{
                    position: 'absolute',
                    left: 11,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  className="fp-input"
                  style={{ paddingLeft: 32 }}
                  placeholder="Buscar ejercicio..."
                  value={ejSearch}
                  onChange={(e) => setEjSearch(e.target.value)}
                />
              </div>
              <div style={{ display: 'grid', gap: 6, maxHeight: 240, overflow: 'auto' }}>
                {ejerciciosFiltrados.map((ej) => (
                  <button
                    key={ej.id}
                    onClick={() => {
                      onAddEjercicio({
                        nombre: ej.nombre,
                        series: 3,
                        reps: ej.unidad_id_default === 1 ? 12 : 10,
                        notas: '',
                      });
                      setShowEjercicioPicker(false);
                    }}
                    style={{
                      padding: 10,
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-card)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12, color: 'var(--text-primary)' }}>{ej.nombre}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {ej.grupo_muscular.join(', ')}
                      </p>
                    </div>
                    <Plus size={14} color={ENTRENO} />
                  </button>
                ))}
                {ejerciciosFiltrados.length === 0 && (
                  <p
                    style={{
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                      padding: 12,
                    }}
                  >
                    Sin resultados
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowEjercicioPicker(false)}
                className="fp-btn fp-btn-ghost"
                style={{ marginTop: 10, width: '100%', fontSize: 11 }}
              >
                Cancelar
              </button>
            </div>
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
    </div>
  );
};
