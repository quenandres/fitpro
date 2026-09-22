import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { FitProCalendar } from './FitProCalendar';
import { clienteIniciales } from './calendarUtils';
import type { CuotaSemanalCliente } from './calendarUtils';
import type { Usuario } from '../../types';

export interface CalendarSidebarBodyProps {
  selected: Date;
  onSelectDate: (date: Date) => void;
  loggedSessionDates: Date[];
  citaDates: Date[];
  cuotasSemanales: CuotaSemanalCliente[];
  usuarios: Usuario[];
  visibleClientIds: number[];
  onToggleClient: (clienteId: number) => void;
  onShowAllClients: () => void;
}

export function CalendarSidebarBody({
  selected,
  onSelectDate,
  loggedSessionDates,
  citaDates,
  cuotasSemanales,
  usuarios,
  visibleClientIds,
  onToggleClient,
  onShowAllClients,
}: CalendarSidebarBodyProps) {
  const [search, setSearch] = useState('');
  const allVisible = visibleClientIds.length === 0;

  const cuotaById = useMemo(
    () => new Map(cuotasSemanales.map((c) => [c.clienteId, c])),
    [cuotasSemanales],
  );

  const filteredUsuarios = useMemo(() => {
    if (!search.trim()) return usuarios;
    const q = search.trim().toLowerCase();
    return usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(q)
        || u.email.toLowerCase().includes(q),
    );
  }, [usuarios, search]);

  return (
    <>
      <FitProCalendar
        variant="mini"
        selected={selected}
        onSelect={(date) => date && onSelectDate(date)}
        loggedSessionDates={loggedSessionDates}
        citaDates={citaDates}
        month={selected}
      />

      <section className="fp-cal-sidebar-section">
        <div className="fp-cal-sidebar-section-head">
          <h3>Mis clientes</h3>
          {!allVisible ? (
            <button type="button" className="fp-cal-sidebar-link" onClick={onShowAllClients}>
              Ver todos
            </button>
          ) : null}
        </div>
        <div className="fp-cal-sidebar-search fp-input-group">
          <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="search"
            placeholder="Buscar cliente…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar clientes"
          />
        </div>
        <ul className="fp-cal-client-list">
          {filteredUsuarios.map((usuario) => {
            const checked = allVisible || visibleClientIds.includes(usuario.id);
            const cuota = cuotaById.get(usuario.id);
            return (
              <li key={usuario.id}>
                <label className="fp-cal-client-row">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleClient(usuario.id)}
                  />
                  <span className="fp-cal-avatar" aria-hidden>
                    {clienteIniciales(usuario.nombre)}
                  </span>
                  <span className="fp-cal-client-name">{usuario.nombre}</span>
                  {cuota ? (
                    <span
                      className="badge shrink-0 tabular-nums"
                      style={{
                        fontSize: 10,
                        padding: '2px 7px',
                        marginLeft: 'auto',
                        background:
                          cuota.completadas >= cuota.objetivo
                            ? 'rgba(34,197,94,.15)'
                            : 'var(--bg-overlay)',
                        color:
                          cuota.completadas >= cuota.objetivo
                            ? 'var(--brand)'
                            : 'var(--text-muted)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {cuota.completadas}/{cuota.objetivo}
                    </span>
                  ) : null}
                </label>
              </li>
            );
          })}
          {filteredUsuarios.length === 0 ? (
            <li className="fp-cal-cliente-empty">Sin resultados</li>
          ) : null}
        </ul>
      </section>

      <section className="fp-cal-sidebar-section">
        <h3>Leyenda</h3>
        <ul className="fp-cal-category-list">
          <li>
            <span className="fp-cal-dot fp-cal-dot-entreno" />
            Entrenos registrados
          </li>
          <li>
            <span className="fp-cal-dot fp-cal-dot-cita" />
            Citas agendadas
          </li>
          <li style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Badge 2/4 = cumplimiento demo (mock)
          </li>
        </ul>
      </section>
    </>
  );
}
