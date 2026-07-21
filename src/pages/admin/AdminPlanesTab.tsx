import { useNavigate } from 'react-router-dom';
import { ChevronRight, Ruler, Users } from 'lucide-react';
import { useDataStore } from '../../store/useDataStore';

export const AdminPlanesTab = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          <span style={{ color: '#a371f7', fontWeight: 700 }}>Planes</span> por usuario
        </p>
        <button className="fp-btn fp-btn-primary" style={{ gap: 6, fontSize: 12 }} onClick={() => navigate('/admin/planes/full')}>
          <Users size={14} /> Gestionar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {[
          { nombre: 'Carlos Martínez', objetivo: 'Ganar masa muscular' },
          { nombre: 'Ana López', objetivo: 'Perder grasa y tonificar' },
          { nombre: 'Miguel Sánchez', objetivo: 'Competencia Hyrox' },
        ].map((u) => (
          <div key={u.nombre} className="fp-card" style={{ padding: '11px 13px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: '#a371f718', border: '1px solid #a371f728', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={16} color="#a371f7" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{u.nombre}</p>
              <p style={{ fontSize: 10, color: '#a371f7' }}>{u.objetivo}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        className="fp-btn fp-btn-secondary"
        style={{ width: '100%', gap: 7, fontSize: 13, justifyContent: 'center', padding: '12px' }}
        onClick={() => navigate('/admin/planes/full')}
      >
        Ver todos los planes <ChevronRight size={15} />
      </button>
    </div>
  );
};

export const AdminUnidadesTab = () => {
  const navigate = useNavigate();
  const unidades = useDataStore((s) => s.unidades);

  const ACCENT: Record<string, string> = {
    conteo: '#22c55e', distancia: '#58a6ff', tiempo: '#a371f7', peso: '#f0883e',
    energia: '#d2a679', intensidad: '#f85149',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          <span style={{ color: '#58a6ff', fontWeight: 700 }}>{unidades.length}</span> unidades
        </p>
        <button className="fp-btn fp-btn-primary" style={{ gap: 6, fontSize: 12 }} onClick={() => navigate('/admin/unidades/full')}>
          <Ruler size={14} /> Gestionar
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {unidades.map((u) => {
          const accent = ACCENT[u.tipo] ?? '#22c55e';
          return (
            <div key={u.id} className="fp-card" style={{ padding: '11px 13px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: `${accent}18`, border: `1px solid ${accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="font-sora" style={{ fontSize: 11, fontWeight: 800, color: accent }}>{u.simbolo}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{u.nombre}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{u.tipo}</p>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="fp-btn fp-btn-secondary"
        style={{ width: '100%', gap: 7, fontSize: 13, justifyContent: 'center', padding: '12px' }}
        onClick={() => navigate('/admin/unidades/full')}
      >
        Gestionar unidades <ChevronRight size={15} />
      </button>
    </div>
  );
};
