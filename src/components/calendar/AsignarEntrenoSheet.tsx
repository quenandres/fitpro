import { useMemo, useState, type FormEvent } from 'react';
import type { Rutina, Usuario } from '../../types';
import { dateToPlanRef, useUsuariosStore } from '../../store/useUsuariosStore';
import { Sheet } from '../common/Sheet';
import { ClienteMultiPicker } from './ClienteMultiPicker';
import { fechaLocalISO } from './calendarUtils';

interface AsignarEntrenoSheetProps {
  open: boolean;
  onClose: () => void;
  selectedDate: Date;
  usuarios: Usuario[];
  rutinas: Rutina[];
  defaultClienteIds?: number[];
}

export function AsignarEntrenoSheet({
  open,
  onClose,
  selectedDate,
  usuarios,
  rutinas,
  defaultClienteIds = [],
}: AsignarEntrenoSheetProps) {
  const assignRutinaToUsers = useUsuariosStore((s) => s.assignRutinaToUsers);

  const [clienteIds, setClienteIds] = useState<number[]>(() => [...defaultClienteIds]);
  const [fecha, setFecha] = useState(() => fechaLocalISO(selectedDate));
  const [rutinaId, setRutinaId] = useState('');
  const [error, setError] = useState('');

  const rutina = useMemo(
    () => rutinas.find((r) => r.id === Number(rutinaId)),
    [rutinas, rutinaId],
  );

  const resumenFecha = useMemo(() => {
    const d = new Date(`${fecha}T12:00:00`);
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    }).format(d);
  }, [fecha]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (clienteIds.length === 0) {
      setError('Selecciona al menos un cliente.');
      return;
    }

    if (!rutina) {
      setError('Selecciona una rutina.');
      return;
    }

    const ref = dateToPlanRef(new Date(`${fecha}T12:00:00`), 1);
    assignRutinaToUsers(clienteIds, ref, rutina);
    setClienteIds([]);
    setRutinaId('');
    onClose();
  };

  if (!open) return null;

  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Asignar entrenamiento" flexColumn>
      <div className="fp-cal-create-sheet flex flex-col min-h-0 flex-1">
        <div className="shrink-0">
          <h2 className="font-sora text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Asignar entrenamiento
          </h2>
          <p className="mb-4" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Actualiza el plan semanal de los clientes seleccionados
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 fp-cal-form">
          <div className="flex flex-col gap-3 min-h-0 flex-1 overflow-y-auto">
            <ClienteMultiPicker
              usuarios={usuarios}
              selectedIds={clienteIds}
              onChange={setClienteIds}
            />

            <div>
              <label htmlFor="asignar-fecha" className="fp-cal-label">Fecha</label>
              <input
                id="asignar-fecha"
                type="date"
                className="fp-input w-full"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="asignar-rutina" className="fp-cal-label">Rutina</label>
              <select
                id="asignar-rutina"
                className="fp-input w-full"
                value={rutinaId}
                onChange={(e) => setRutinaId(e.target.value)}
                required
              >
                <option value="">Seleccionar rutina…</option>
                {rutinas.map((r) => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
            </div>

            {rutina && clienteIds.length > 0 ? (
              <p className="fp-cal-asignar-resumen capitalize">
                {resumenFecha} · {rutina.nombre} · {clienteIds.length}{' '}
                {clienteIds.length === 1 ? 'cliente' : 'clientes'}
              </p>
            ) : null}

            {error ? (
              <p style={{ fontSize: 12, color: 'var(--accent-red)' }}>{error}</p>
            ) : null}
          </div>

          <div className="shrink-0 pt-3 mt-auto border-t border-line">
            <button type="submit" className="fp-btn fp-btn-primary w-full">
              {clienteIds.length > 1
                ? `Asignar a ${clienteIds.length} clientes`
                : 'Asignar entrenamiento'}
            </button>
          </div>
        </form>
      </div>
    </Sheet>
  );
}
