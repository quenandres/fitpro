import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Rutina, Usuario } from '../../types';
import { DiaCard } from './DiaCard';
import { DIAS_SEMANA } from './diasSemana';
import { compareRutinaSnapshot } from '../../utils/compareRutinaSnapshot';

interface Props {
  user: Usuario;
  onOpenDia: (semana: number, diaIndex: number) => void;
  rutinas: Rutina[];
}

const ACCENT = '#a371f7';

export const VistaMes = ({ user, onOpenDia, rutinas }: Props) => {
  const totalMeses = Math.max(1, Math.ceil(user.plan.semanas / 4));
  const [mes, setMes] = useState(1);

  const semanasVisibles = useMemo(() => {
    const startSemana = (mes - 1) * 4 + 1;
    const endSemana = Math.min(mes * 4, user.plan.semanas);
    return user.plan.programacion_semanal.filter(
      (s) => s.semana >= startSemana && s.semana <= endSemana
    );
  }, [user, mes]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setMes(Math.max(1, mes - 1))}
            disabled={mes === 1}
            className="fp-btn fp-btn-ghost"
            style={{ padding: 6 }}
          >
            <ChevronLeft size={16} />
          </button>
          <div style={{ textAlign: 'center', minWidth: 140 }}>
            <p
              className="font-sora"
              style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}
            >
              Mes {mes}
            </p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              Semanas {(mes - 1) * 4 + 1}-{Math.min(mes * 4, user.plan.semanas)}
            </p>
          </div>
          <button
            onClick={() => setMes(Math.min(totalMeses, mes + 1))}
            disabled={mes === totalMeses}
            className="fp-btn fp-btn-ghost"
            style={{ padding: 6 }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: totalMeses }, (_, i) => i + 1).map((m) => (
            <button
              key={m}
              onClick={() => setMes(m)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: mes === m ? `2px solid ${ACCENT}` : '1px solid var(--border)',
                background: mes === m ? `${ACCENT}20` : 'transparent',
                fontSize: 11,
                fontWeight: 600,
                color: mes === m ? ACCENT : 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '60px repeat(7, 1fr)',
          gap: 6,
          marginBottom: 8,
        }}
      >
        <div />
        {DIAS_SEMANA.map((d) => (
          <p
            key={d.dia}
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--text-muted)',
              textAlign: 'center',
              letterSpacing: '0.08em',
            }}
          >
            {d.nombreCorto.toUpperCase()}
          </p>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 6 }}>
        {semanasVisibles.map((s) => (
          <div
            key={s.semana}
            style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', gap: 6 }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border)',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-muted)',
              }}
            >
              S{s.semana}
            </div>
            {s.dias.map((dia, diaIndex) => {
              const rutina = rutinas.find((r) => r.id === dia.rutina_id);
              const syncStatus = compareRutinaSnapshot(rutina, dia);
              return (
                <DiaCard
                  key={diaIndex}
                  dia={dia}
                  semana={s.semana}
                  diaIndex={diaIndex}
                  variant="compact"
                  syncStatus={syncStatus}
                  onClick={() => onOpenDia(s.semana, diaIndex)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
