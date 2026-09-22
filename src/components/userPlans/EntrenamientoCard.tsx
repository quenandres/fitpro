import { ClipboardList, Dumbbell, Pencil, Plus } from 'lucide-react';
import type { PlanModo, Rutina, SesionPlan } from '../../types';
import {
  entrenamientoLabel,
  estimateSesionMinutos,
  isSesionConfigured,
} from '../../utils/sesionPlanUtils';
import type { SyncStatus } from '../../utils/compareRutinaSnapshot';

const ACCENT = '#a371f7';
const BRAND = 'var(--brand)';

interface Props {
  sesion: SesionPlan;
  sesionIndex: number;
  modo: PlanModo;
  frecuencia: number;
  rutinas: Rutina[];
  syncStatus?: SyncStatus;
  onCreate: () => void;
  onAssignExisting: () => void;
  onEdit: () => void;
  onChangeRutina: () => void;
}

export function EntrenamientoCard({
  sesion,
  sesionIndex,
  modo,
  frecuencia,
  rutinas,
  syncStatus,
  onCreate,
  onAssignExisting,
  onEdit,
  onChangeRutina,
}: Props) {
  const configured = isSesionConfigured(sesion);
  const titulo = entrenamientoLabel(sesion, sesionIndex, modo);
  const minutos = estimateSesionMinutos(sesion, rutinas);
  const ejCount = sesion.ejercicios_personalizados.length;
  const drift = syncStatus === 'modificada' || syncStatus === 'desasignada';

  if (!configured) {
    return (
      <div
        className="fp-card"
        style={{
          padding: 16,
          borderRadius: 14,
          border: '1px dashed var(--border)',
          background: 'var(--bg-overlay)',
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="font-sora text-sm font-bold text-primary">{titulo}</p>
            {modo === 'repetitiva' ? (
              <span
                className="badge mt-1.5 inline-block"
                style={{
                  fontSize: 10,
                  padding: '3px 8px',
                  background: `${ACCENT}18`,
                  color: ACCENT,
                  border: `1px solid ${ACCENT}35`,
                }}
              >
                Repetir {frecuencia} veces/semana
              </span>
            ) : (
              <p className="text-[11px] text-muted mt-1">
                Entrenamiento {sesionIndex + 1} de {frecuencia} esta semana
              </p>
            )}
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Dumbbell size={18} color="var(--text-muted)" />
          </div>
        </div>

        <p className="text-[12px] text-muted leading-relaxed mb-4">
          Define qué hará el cliente en este entrenamiento. Puedes crear una rutina solo para
          esta persona o reutilizar una de tu biblioteca.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            className="fp-btn fp-btn-primary flex-1 gap-1.5 justify-center"
            onClick={onCreate}
          >
            <Plus size={14} />
            Crear rutina
          </button>
          <button
            type="button"
            className="fp-btn fp-btn-secondary flex-1 gap-1.5 justify-center"
            onClick={onAssignExisting}
          >
            <ClipboardList size={14} />
            Asignar existente
          </button>
        </div>
      </div>
    );
  }

  const subtitulo =
    sesion.rutina_id != null && sesion.rutina_id > 0
      ? sesion.rutina_nombre
      : sesion.rutina_nombre || 'Rutina personalizada';

  return (
    <div
      className="fp-card fp-card-hover"
      style={{
        padding: 16,
        borderRadius: 14,
        border: `1px solid ${drift ? 'rgba(240,136,62,.35)' : 'rgba(34,197,94,.25)'}`,
        background: 'rgba(34,197,94,.06)',
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-sora text-sm font-bold text-primary truncate">{titulo}</p>
            {modo === 'repetitiva' ? (
              <span
                className="badge shrink-0"
                style={{
                  fontSize: 9,
                  padding: '2px 7px',
                  background: `${ACCENT}18`,
                  color: ACCENT,
                }}
              >
                ×{frecuencia}/sem
              </span>
            ) : null}
            {drift ? (
              <span
                className="badge shrink-0"
                style={{
                  fontSize: 9,
                  padding: '2px 7px',
                  background: 'rgba(240,136,62,.15)',
                  color: '#f0883e',
                }}
              >
                Desincronizada
              </span>
            ) : null}
          </div>
          <p className="text-[12px] font-medium truncate" style={{ color: BRAND }}>
            {subtitulo}
          </p>
          <p className="text-[11px] text-muted mt-1">
            {ejCount} ejercicios · ~{minutos} min
          </p>
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(34,197,94,.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Dumbbell size={18} color={BRAND} />
        </div>
      </div>

      {ejCount > 0 ? (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {sesion.ejercicios_personalizados.slice(0, 5).map((ej, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-1 rounded-md"
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {ej.nombre}
            </span>
          ))}
          {ejCount > 5 ? (
            <span className="text-[10px] text-muted px-1 py-1">+{ejCount - 5}</span>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--border-subtle)]">
        <button
          type="button"
          className="fp-btn fp-btn-primary fp-btn-sm gap-1.5"
          onClick={onEdit}
        >
          <Pencil size={13} />
          Editar
        </button>
        <button
          type="button"
          className="fp-btn fp-btn-secondary fp-btn-sm gap-1.5"
          onClick={onChangeRutina}
        >
          <ClipboardList size={13} />
          Cambiar rutina
        </button>
      </div>
    </div>
  );
}
