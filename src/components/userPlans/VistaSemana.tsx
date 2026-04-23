import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Rutina, Usuario } from '../../types';
import { DiaCard } from './DiaCard';
import { compareRutinaSnapshot } from '../../utils/compareRutinaSnapshot';

interface Props {
  user: Usuario;
  selectedWeek: number;
  onSelectWeek: (w: number) => void;
  onOpenDia: (semana: number, diaIndex: number) => void;
  rutinas: Rutina[];
}

export const VistaSemana = ({ user, selectedWeek, onSelectWeek, onOpenDia, rutinas }: Props) => {
  const semana = useMemo(
    () => user.plan.programacion_semanal.find((s) => s.semana === selectedWeek),
    [user, selectedWeek]
  );

  const stats = useMemo(() => {
    if (!semana) return { entreno: 0, descanso: 0, tiempo: 0 };
    const entreno = semana.dias.filter(
      (d) => d.rutina_id !== null && d.ejercicios_personalizados.length > 0
    );
    const descanso = semana.dias.filter(
      (d) => d.rutina_id === null || d.ejercicios_personalizados.length === 0
    );
    const tiempo = entreno.reduce((acc, d) => {
      const t = d.ejercicios_personalizados.reduce((s, e) => s + e.series * 0.5, 0);
      return acc + Math.max(t, 20);
    }, 0);
    return { entreno: entreno.length, descanso: descanso.length, tiempo };
  }, [semana]);

  if (!semana) return null;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => onSelectWeek(Math.max(1, selectedWeek - 1))}
            disabled={selectedWeek === 1}
            className="fp-btn fp-btn-ghost"
            style={{ padding: 6 }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 14, fontWeight: 600, minWidth: 100, textAlign: 'center' }}>
            Semana {selectedWeek}
          </span>
          <button
            onClick={() => onSelectWeek(Math.min(user.plan.semanas, selectedWeek + 1))}
            disabled={selectedWeek === user.plan.semanas}
            className="fp-btn fp-btn-ghost"
            style={{ padding: 6 }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {user.plan.programacion_semanal.map((s) => (
            <button
              key={s.semana}
              onClick={() => onSelectWeek(s.semana)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border:
                  selectedWeek === s.semana ? '2px solid #a371f7' : '1px solid var(--border)',
                background: selectedWeek === s.semana ? '#a371f720' : 'transparent',
                fontSize: 11,
                fontWeight: 600,
                color: selectedWeek === s.semana ? '#a371f7' : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {s.semana}
            </button>
          ))}
        </div>
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
            ENTRENAMIENTO
          </p>
          <p
            className="font-sora"
            style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', letterSpacing: '-0.02em' }}
          >
            {Math.round(stats.tiempo)} min
          </p>
          <p style={{ fontSize: 10, color: '#22c55e80' }}>{stats.entreno} días activos</p>
        </div>
        <div
          style={{
            padding: 12,
            borderRadius: 10,
            background: '#58a6ff15',
            border: '1px solid #58a6ff30',
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 600, color: '#58a6ff', marginBottom: 4 }}>
            DESCANSO
          </p>
          <p
            className="font-sora"
            style={{ fontSize: 20, fontWeight: 700, color: '#58a6ff', letterSpacing: '-0.02em' }}
          >
            {stats.descanso} días
          </p>
          <p style={{ fontSize: 10, color: '#58a6ff80' }}>recuperación</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {semana.dias.map((dia, diaIndex) => {
          const rutina = rutinas.find((r) => r.id === dia.rutina_id);
          const syncStatus = compareRutinaSnapshot(rutina, dia);
          return (
            <DiaCard
              key={diaIndex}
              dia={dia}
              semana={semana.semana}
              diaIndex={diaIndex}
              variant="full"
              syncStatus={syncStatus}
              onClick={() => onOpenDia(semana.semana, diaIndex)}
            />
          );
        })}
      </div>
    </div>
  );
};
