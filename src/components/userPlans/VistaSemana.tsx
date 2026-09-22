import { useMemo } from 'react';
import type { PlanModo, Rutina, Usuario } from '../../types';
import { EntrenamientoCard } from './EntrenamientoCard';
import { compareRutinaSnapshot } from '../../utils/compareRutinaSnapshot';
import { sesionesForDisplay } from '../../utils/planScheduleUtils';
import { estimateSesionMinutos, isSesionConfigured } from '../../utils/sesionPlanUtils';

interface Props {
  user: Usuario;
  selectedWeek: number;
  rutinas: Rutina[];
  modo: PlanModo;
  frecuencia: number;
  onCreateRutina: (sesionIndex: number) => void;
  onAssignExisting: (sesionIndex: number) => void;
  onEdit: (sesionIndex: number) => void;
  onChangeRutina: (sesionIndex: number) => void;
}

export const VistaSemana = ({
  user,
  selectedWeek,
  rutinas,
  modo,
  frecuencia,
  onCreateRutina,
  onAssignExisting,
  onEdit,
  onChangeRutina,
}: Props) => {
  const semana = useMemo(
    () => user.plan.programacion_semanal.find((s) => s.semana === selectedWeek),
    [user, selectedWeek],
  );

  const displaySesiones = useMemo(() => {
    if (!semana) return [];
    return sesionesForDisplay(semana, modo);
  }, [semana, modo]);

  const stats = useMemo(() => {
    if (!semana) return { sesiones: 0, ejercicios: 0, tiempo: 0 };
    const conContenido = displaySesiones.filter(isSesionConfigured);
    const ejercicios = displaySesiones.reduce(
      (acc, s) => acc + s.ejercicios_personalizados.length,
      0,
    );
    const tiempo = conContenido.reduce(
      (acc, s) => acc + estimateSesionMinutos(s, rutinas),
      0,
    );
    return {
      sesiones: conContenido.length,
      ejercicios,
      tiempo,
    };
  }, [semana, displaySesiones, rutinas]);

  if (!semana) {
    return (
      <div className="fp-card text-center" style={{ padding: 28, borderRadius: 12 }}>
        <p className="text-sm font-semibold text-primary mb-1">Semana {selectedWeek}</p>
        <p className="text-xs text-muted">Esta semana aún no tiene datos en el plan.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3.5">
        <p className="font-sora text-sm font-semibold text-primary">
          Semana {selectedWeek}
          {modo === 'repetitiva' ? (
            <span className="text-muted font-normal"> · ×{frecuencia}/sem</span>
          ) : null}
        </p>
        <p className="text-[11px] text-muted mt-1">
          {modo === 'repetitiva'
            ? 'Una rutina que se repite a lo largo de la semana.'
            : `${displaySesiones.length} entrenamientos distintos esta semana.`}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            background: '#22c55e15',
            border: '1px solid #22c55e30',
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 600, color: '#22c55e', marginBottom: 4 }}>
            PLANIFICADO
          </p>
          <p
            className="font-sora"
            style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', letterSpacing: '-0.02em' }}
          >
            {Math.round(stats.tiempo)} min
          </p>
          <p style={{ fontSize: 10, color: '#22c55e80' }}>
            {stats.sesiones}{' '}
            {stats.sesiones === 1 ? 'entrenamiento' : 'entrenamientos'}
          </p>
        </div>
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            background: '#a371f715',
            border: '1px solid #a371f730',
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 600, color: '#a371f7', marginBottom: 4 }}>
            CUOTA SEMANAL
          </p>
          <p
            className="font-sora"
            style={{ fontSize: 20, fontWeight: 700, color: '#a371f7', letterSpacing: '-0.02em' }}
          >
            {frecuencia} días
          </p>
          <p style={{ fontSize: 10, color: '#a371f780' }}>{stats.ejercicios} ejercicios</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {displaySesiones.map((sesion, sesionIndex) => {
          const rutina = rutinas.find((r) => r.id === sesion.rutina_id);
          const syncStatus = compareRutinaSnapshot(rutina, sesion);
          return (
            <EntrenamientoCard
              key={sesionIndex}
              sesion={sesion}
              sesionIndex={sesionIndex}
              modo={modo}
              frecuencia={frecuencia}
              rutinas={rutinas}
              syncStatus={syncStatus}
              onCreate={() => onCreateRutina(sesionIndex)}
              onAssignExisting={() => onAssignExisting(sesionIndex)}
              onEdit={() => onEdit(sesionIndex)}
              onChangeRutina={() => onChangeRutina(sesionIndex)}
            />
          );
        })}
      </div>
    </div>
  );
};
