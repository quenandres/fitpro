import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useDataStore } from '../../../store/useDataStore';
import { rutinaToDraftRow } from '../../../utils/routineDraftSummary';
import { ROUTES } from '../../../routes/paths';

export const RoutineRecentDraftsTable = () => {
  const rutinas = useDataStore((s) => s.rutinas);

  const rows = useMemo(
    () => [...rutinas].slice(-8).reverse().map(rutinaToDraftRow),
    [rutinas],
  );

  if (rows.length === 0) return null;

  return (
    <section className="animate-slide-up delay-150" style={{ marginTop: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 className="font-sora" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
            Borradores recientes y del equipo
          </h2>
          <span className="badge badge-blue" style={{ fontSize: 9, padding: '2px 8px' }}>
            {rows.length} en biblioteca
          </span>
        </div>
        <Link to={ROUTES.library.rutinas} style={{ fontSize: 12, color: 'var(--accent-blue)', textDecoration: 'none' }}>
          Ver archivo completo
        </Link>
      </div>

      <div className="fp-card overflow-x-auto" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 560 }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>Nombre</th>
              <th style={{ padding: '10px 8px', fontWeight: 600 }}>Tipo</th>
              <th style={{ padding: '10px 8px', fontWeight: 600 }}>Atleta</th>
              <th style={{ padding: '10px 8px', fontWeight: 600 }}>Volumen</th>
              <th style={{ padding: '10px 8px', fontWeight: 600 }}>Estado</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '10px 12px' }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{row.nombre}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{row.codigo}</p>
                </td>
                <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{row.tipo}</td>
                <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{row.atleta}</td>
                <td style={{ padding: '10px 8px', color: 'var(--text-secondary)' }}>{row.volumenLabel}</td>
                <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>{row.modificadoLabel}</td>
                <td style={{ padding: '10px 12px' }}>
                  <Link
                    to={row.editPath}
                    className="fp-btn fp-btn-ghost"
                    style={{ fontSize: 11, padding: '4px 10px', textDecoration: 'none' }}
                  >
                    Reanudar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
