import { useMemo } from 'react';
import type { Ejercicio, Rutina, Usuario } from '../../types';
import { DiaCard } from './DiaCard';
import { DIAS_SEMANA } from './diasSemana';
import { compareRutinaSnapshot } from '../../utils/compareRutinaSnapshot';

interface Props {
  user: Usuario;
  onOpenDia: (semana: number, diaIndex: number) => void;
  rutinas: Rutina[];
  ejercicios: Ejercicio[];
}

const ACCENT = '#a371f7';

export const VistaTotal = ({ user, onOpenDia, rutinas, ejercicios }: Props) => {
  const stats = useMemo(() => {
    let entrenos = 0;
    let descansos = 0;
    const gruposMusculares = new Map<string, number>();

    user.plan.programacion_semanal.forEach((s) => {
      s.dias.forEach((d) => {
        const activo = d.ejercicios_personalizados.length > 0;
        if (activo) {
          entrenos++;
          d.ejercicios_personalizados.forEach((ep) => {
            const ej = ejercicios.find((e) => e.nombre === ep.nombre);
            if (ej) {
              ej.grupo_muscular.forEach((g) => {
                gruposMusculares.set(g, (gruposMusculares.get(g) || 0) + 1);
              });
            }
          });
        } else {
          descansos++;
        }
      });
    });

    const topGrupos = Array.from(gruposMusculares.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return { entrenos, descansos, topGrupos };
  }, [user, ejercicios]);

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <p
          className="font-sora"
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          Plan completo
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {user.plan.semanas} semanas · {user.plan.semanas * 7} días
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            padding: 10,
            borderRadius: 10,
            background: '#22c55e15',
            border: '1px solid #22c55e30',
          }}
        >
          <p style={{ fontSize: 9, fontWeight: 700, color: '#22c55e', letterSpacing: '0.08em' }}>
            ENTRENOS
          </p>
          <p
            className="font-sora"
            style={{ fontSize: 20, fontWeight: 700, color: '#22c55e', letterSpacing: '-0.02em' }}
          >
            {stats.entrenos}
          </p>
        </div>
        <div
          style={{
            padding: 10,
            borderRadius: 10,
            background: '#58a6ff15',
            border: '1px solid #58a6ff30',
          }}
        >
          <p style={{ fontSize: 9, fontWeight: 700, color: '#58a6ff', letterSpacing: '0.08em' }}>
            DESCANSOS
          </p>
          <p
            className="font-sora"
            style={{ fontSize: 20, fontWeight: 700, color: '#58a6ff', letterSpacing: '-0.02em' }}
          >
            {stats.descansos}
          </p>
        </div>
        <div
          style={{
            padding: 10,
            borderRadius: 10,
            background: `${ACCENT}15`,
            border: `1px solid ${ACCENT}40`,
            gridColumn: 'span 1',
          }}
        >
          <p
            style={{ fontSize: 9, fontWeight: 700, color: ACCENT, letterSpacing: '0.08em', marginBottom: 4 }}
          >
            TOP MÚSCULOS
          </p>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {stats.topGrupos.length === 0 ? (
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>—</span>
            ) : (
              stats.topGrupos.map(([nombre, n]) => (
                <span
                  key={nombre}
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: 'var(--bg-card)',
                    color: ACCENT,
                  }}
                >
                  {nombre} · {n}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '40px repeat(7, 1fr)',
          gap: 4,
          marginBottom: 6,
        }}
      >
        <div />
        {DIAS_SEMANA.map((d) => (
          <p
            key={d.dia}
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: 'var(--text-muted)',
              textAlign: 'center',
              letterSpacing: '0.08em',
            }}
          >
            {d.nombreCorto.charAt(0).toUpperCase()}
          </p>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 4 }}>
        {user.plan.programacion_semanal.map((s) => (
          <div
            key={s.semana}
            style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', gap: 4 }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
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
                  variant="mini"
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
