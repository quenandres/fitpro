import type { CSSProperties } from 'react';
import { Dumbbell, ChevronRight, RefreshCw } from 'lucide-react';
import type { SesionPlan } from '../../types';
import type { SyncStatus } from '../../utils/compareRutinaSnapshot';

export type SesionCardVariant = 'full' | 'compact' | 'mini';

export interface SesionCardProps {
  sesion: SesionPlan;
  semana: number;
  sesionIndex: number;
  variant: SesionCardVariant;
  syncStatus?: SyncStatus;
  selected?: boolean;
  onClick?: () => void;
  /** En modo repetitiva, cuántas veces por semana se repite. */
  repeticiones?: number;
}

const ENTRENO = '#22c55e';
const NUEVA = '#a371f7';
const WARN = '#f0883e';

export const SesionCard = ({
  sesion,
  semana,
  variant,
  syncStatus,
  selected,
  onClick,
  repeticiones,
}: SesionCardProps) => {
  const isEntreno = sesion.rutina_id !== null && sesion.rutina_id !== 0 && sesion.rutina_id !== -1;
  const isNueva = sesion.rutina_id === 0 || sesion.rutina_id === -1;
  const tieneEjercicios = sesion.ejercicios_personalizados.length > 0;
  const driftActivo = syncStatus === 'modificada' || syncStatus === 'desasignada';

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

  const commonStyle: CSSProperties = {
    transition: 'border-color .15s, background .15s',
    cursor: onClick ? 'pointer' : 'default',
    userSelect: 'none',
    background: bgByState,
    border: borderByState,
    outline: selected ? `2px solid ${NUEVA}` : 'none',
    outlineOffset: -1,
  };

  const titulo = sesion.nombre || `Sesión ${sesion.orden}`;
  const subtitulo = isEntreno
    ? sesion.rutina_nombre
    : isNueva
      ? 'Sin configurar'
      : 'Vacía';

  if (variant === 'mini') {
    return (
      <div
        onClick={onClick}
        title={`${titulo} · Semana ${semana}`}
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
        {sesion.orden}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        onClick={onClick}
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
            SESIÓN {sesion.orden}
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
          {subtitulo}
        </p>
        {tieneEjercicios && (
          <span style={{ fontSize: 9, fontWeight: 600, color: ENTRENO, marginTop: 'auto' }}>
            {sesion.ejercicios_personalizados.length} ejercicios
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        ...commonStyle,
        padding: 16,
        borderRadius: 12,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
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
            <Dumbbell size={18} color={isEntreno ? ENTRENO : isNueva ? NUEVA : 'var(--text-muted)'} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary">{titulo}</p>
            <p
              className="text-[11px] truncate"
              style={{ color: isEntreno ? ENTRENO : isNueva ? NUEVA : 'var(--text-muted)' }}
            >
              {subtitulo}
              {repeticiones != null && repeticiones > 1 ? ` · ×${repeticiones}/sem` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
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
              {sesion.ejercicios_personalizados.length} ejer
            </span>
          )}
          <ChevronRight size={16} color="var(--text-muted)" />
        </div>
      </div>

      {tieneEjercicios && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {sesion.ejercicios_personalizados.slice(0, 4).map((ej, i) => (
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
            {sesion.ejercicios_personalizados.length > 4 && (
              <span
                style={{
                  fontSize: 10,
                  padding: '3px 8px',
                  borderRadius: 4,
                  background: 'var(--bg-card)',
                  color: 'var(--text-muted)',
                }}
              >
                +{sesion.ejercicios_personalizados.length - 4}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
