import { FitProCalendar } from './FitProCalendar';
import { clienteIniciales } from './calendarUtils';
import type { Usuario } from '../../types';

export interface CalendarSidebarBodyProps {
  selected: Date;
  onSelectDate: (date: Date) => void;
  entrenoWeekdays: number[];
  citaDates: Date[];
  usuarios: Usuario[];
  visibleClientIds: number[];
  onToggleClient: (clienteId: number) => void;
  onShowAllClients: () => void;
}

export function CalendarSidebarBody({
  selected,
  onSelectDate,
  entrenoWeekdays,
  citaDates,
  usuarios,
  visibleClientIds,
  onToggleClient,
  onShowAllClients,
}: CalendarSidebarBodyProps) {
  const allVisible = visibleClientIds.length === 0;

  return (
    <>
      <FitProCalendar
        variant="mini"
        selected={selected}
        onSelect={(date) => date && onSelectDate(date)}
        entrenoWeekdays={entrenoWeekdays}
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
        <ul className="fp-cal-client-list">
          {usuarios.map((usuario) => {
            const checked = allVisible || visibleClientIds.includes(usuario.id);
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
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="fp-cal-sidebar-section">
        <h3>Categorías</h3>
        <ul className="fp-cal-category-list">
          <li>
            <span className="fp-cal-dot fp-cal-dot-entreno" />
            Entrenos programados
          </li>
          <li>
            <span className="fp-cal-dot fp-cal-dot-cita" />
            Citas agendadas
          </li>
        </ul>
      </section>
    </>
  );
}
