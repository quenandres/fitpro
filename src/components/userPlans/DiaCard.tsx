import type { CSSProperties } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Dumbbell, Calendar, ChevronRight, GripVertical, RefreshCw } from 'lucide-react';
import type { DiaSemana } from '../../types';
import { isDiaEntreno, isDiaNueva } from './diasSemana';
import type { SyncStatus } from '../../utils/compareRutinaSnapshot';
import { buildDragId } from './dragIds';

export type DiaCardVariant = 'full' | 'compact' | 'mini';

export interface DiaCardProps {
  dia: DiaSemana;
  semana: number;
  diaIndex: number;
  variant: DiaCardVariant;
  syncStatus?: SyncStatus;
  selected?: boolean;
  onClick?: () => void;
  draggable?: boolean;
}

const ENTRENO = '#22c55e';
const NUEVA = '#a371f7';
const WARN = '#f0883e';

export const DiaCard = ({
  dia,
  semana,
  diaIndex,
  variant,
  syncStatus,
  selected,
  onClick,
  draggable = true,
}: DiaCardProps) => {
  const id = buildDragId(semana, diaIndex);
  const isEntreno = isDiaEntreno(dia.rutina_id) && !isDiaNueva(dia.rutina_id);
  const isNueva = isDiaNueva(dia.rutina_id);
  const tieneEjercicios = dia.ejercicios_personalizados.length > 0;
  const driftActivo = syncStatus === 'modificada' || syncStatus === 'desasignada';

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({ id, disabled: !draggable });

  const { setNodeRef: setDropRef, isOver } = useDroppable({ id });

  const setRefs = (node: HTMLElement | null) => {
    setDragRef(node);
    setDropRef(node);
  };

  const bgByState = isEntreno
    ? '#22c55e10'
    : isNueva
      ? `${NUEVA}15`
      : 'var(--bg-overlay)';
  const borderByState = isEntreno
    ? '1px solid #22c55e40'
    : isNueva
      ? `1px solid ${NUEVA}40`
      : '1px solid var(--border)';
  const overBorder = isOver ? `2px solid ${NUEVA}` : borderByState;

  const commonStyle: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    transition: isDragging ? undefined : 'border-color .15s, background .15s',
    cursor: onClick ? 'pointer' : draggable ? 'grab' : 'default',
    userSelect: 'none',
    background: isOver ? `${NUEVA}15` : bgByState,
    border: overBorder,
    outline: selected ? `2px solid ${NUEVA}` : 'none',
    outlineOffset: -1,
  };

  if (variant === 'mini') {
    return (
      <div
        ref={setRefs}
        onClick={onClick}
        {...attributes}
        {...listeners}
        title={`${dia.nombre} · Semana ${semana}${dia.rutina_nombre ? ` · ${dia.rutina_nombre}` : ''}`}
        style={{
          ...commonStyle,
          borderRadius: 6,
          height: 28,
          padding: '0 6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 600,
          color: isEntreno ? ENTRENO : 'var(--text-muted)',
        }}
      >
        {tieneEjercicios ? dia.ejercicios_personalizados.length : isEntreno ? '·' : ''}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        ref={setRefs}
        onClick={onClick}
        {...attributes}
        {...listeners}
        style={{
          ...commonStyle,
          borderRadius: 10,
          padding: 10,
          minHeight: 78,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            {dia.nombre.slice(0, 3).toUpperCase()}
          </span>
          {driftActivo && <RefreshCw size={10} color={WARN} />}
        </div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: isEntreno ? ENTRENO : isNueva ? NUEVA : 'var(--text-muted)',
            lineHeight: 1.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {isEntreno ? dia.rutina_nombre : isNueva ? 'Nueva' : 'Descanso'}
        </p>
        {tieneEjercicios && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              color: ENTRENO,
              marginTop: 'auto',
            }}
          >
            {dia.ejercicios_personalizados.length} ejercicios
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      ref={setRefs}
      onClick={onClick}
      style={{
        ...commonStyle,
        padding: 16,
        borderRadius: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {draggable && (
            <button
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
              aria-label="Mover día"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'grab',
                padding: 4,
                color: 'var(--text-muted)',
                touchAction: 'none',
              }}
            >
              <GripVertical size={16} />
            </button>
          )}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: isEntreno ? '#22c55e30' : isNueva ? `${NUEVA}30` : 'var(--bg-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isEntreno ? (
              <Dumbbell size={18} color={ENTRENO} />
            ) : (
              <Calendar size={18} color={isNueva ? NUEVA : 'var(--text-muted)'} />
            )}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              {dia.nombre}
            </p>
            <p
              style={{
                fontSize: 11,
                color: isEntreno ? ENTRENO : isNueva ? NUEVA : 'var(--text-muted)',
              }}
            >
              {isEntreno ? dia.rutina_nombre : isNueva ? 'Nueva Rutina' : 'Descanso'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {driftActivo && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: 6,
                background: `${WARN}20`,
                color: WARN,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <RefreshCw size={10} /> actualizada
            </span>
          )}
          {tieneEjercicios && (
            <span
              style={{
                fontSize: 10,
                padding: '2px 8px',
                borderRadius: 4,
                background: '#22c55e20',
                color: ENTRENO,
              }}
            >
              {dia.ejercicios_personalizados.length} ejer
            </span>
          )}
          <ChevronRight size={16} color="var(--text-muted)" />
        </div>
      </div>

      {tieneEjercicios && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {dia.ejercicios_personalizados.slice(0, 4).map((ej, i) => (
              <span
                key={i}
                style={{
                  fontSize: 10,
                  padding: '3px 8px',
                  borderRadius: 4,
                  background: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                }}
              >
                {ej.nombre}
              </span>
            ))}
            {dia.ejercicios_personalizados.length > 4 && (
              <span
                style={{
                  fontSize: 10,
                  padding: '3px 8px',
                  borderRadius: 4,
                  background: 'var(--bg-card)',
                  color: 'var(--text-muted)',
                }}
              >
                +{dia.ejercicios_personalizados.length - 4}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
