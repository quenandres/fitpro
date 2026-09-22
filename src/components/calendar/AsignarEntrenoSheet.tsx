import { useMemo, useState, type FormEvent } from 'react';
import type { Rutina, Usuario } from '../../types';
import { useUsuariosStore } from '../../store/useUsuariosStore';
import { Sheet } from '../common/Sheet';
import { ClienteMultiPicker } from './ClienteMultiPicker';

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
  usuarios,
  rutinas,
  defaultClienteIds = [],
}: AsignarEntrenoSheetProps) {
  const assignRutinaToUsers = useUsuariosStore((s) => s.assignRutinaToUsers);

  const [clienteIds, setClienteIds] = useState<number[]>(() => [...defaultClienteIds]);
  const [sesionOrden, setSesionOrden] = useState('1');
  const [rutinaId, setRutinaId] = useState('');
  const [error, setError] = useState('');

  const rutina = useMemo(
    () => rutinas.find((r) => r.id === Number(rutinaId)),
    [rutinas, rutinaId],
  );

  const maxSesiones = useMemo(() => {
    if (clienteIds.length === 0) return 7;
    const selected = usuarios.filter((u) => clienteIds.includes(u.id));
    return Math.max(1, ...selected.map((u) => u.plan.dias_entrenar_semana));
  }, [clienteIds, usuarios]);

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

    const sesionIndex = Math.max(0, Number(sesionOrden) - 1);
    const ref = { semana: 1, sesionIndex };
    assignRutinaToUsers(clienteIds, ref, rutina);
    setClienteIds([]);
    setRutinaId('');
    setSesionOrden('1');
    onClose();
  };

  if (!open) return null;

  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Asignar entrenamiento" flexColumn>
      <div className="fp-cal-create-sheet flex flex-col min-h-0 flex-1">
        <div className="shrink-0">
          <h2 className="font-sora text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Asignar rutina a sesión
          </h2>
          <p className="mb-4" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Actualiza la plantilla de sesión en el plan del cliente (no fija un día de la semana)
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
              <label htmlFor="asignar-sesion" className="fp-cal-label">Sesión del plan</label>
              <select
                id="asignar-sesion"
                className="fp-input w-full"
                value={sesionOrden}
                onChange={(e) => setSesionOrden(e.target.value)}
                required
              >
                {Array.from({ length: maxSesiones }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>Sesión {n}</option>
                ))}
              </select>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                Semana 1 del plan · el cliente elige el día concreto en móvil
              </p>
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
              <p className="fp-cal-asignar-resumen">
                Sesión {sesionOrden} · {rutina.nombre} · {clienteIds.length}{' '}
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
                : 'Asignar rutina'}
            </button>
          </div>
        </form>
      </div>
    </Sheet>
  );
}
