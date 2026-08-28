import { useMemo, useState, type FormEvent } from 'react';
import type { Rutina, Usuario } from '../../types';
import { useCitasStore } from '../../store/useCitasStore';
import { TimeSlotChips } from './TimeSlotChips';
import {
  fechaLocalISO,
  getDefaultTimeRange,
  minutesToTime,
  type SchedulerTimeRange,
} from './calendarUtils';

interface CitaFormProps {
  selectedDate: Date;
  usuarios: Usuario[];
  rutinas: Rutina[];
  defaultClienteId: number | null;
  defaultHora?: string;
  onCreated?: () => void;
  isMobile?: boolean;
  timeRange?: SchedulerTimeRange;
}

const DEFAULT_DURACION = 60;
const DURACION_OPTIONS = [30, 45, 60, 90] as const;

export function CitaForm({
  selectedDate,
  usuarios,
  rutinas,
  defaultClienteId,
  defaultHora = '10:00',
  onCreated,
  isMobile = false,
  timeRange = getDefaultTimeRange(),
}: CitaFormProps) {
  const addCita = useCitasStore((s) => s.addCita);
  const citas = useCitasStore((s) => s.citas);
  const [clienteId, setClienteId] = useState(
    () => String(defaultClienteId ?? usuarios[0]?.id ?? ''),
  );
  const [horaInicio, setHoraInicio] = useState(defaultHora);
  const [duracionMin, setDuracionMin] = useState(DEFAULT_DURACION);
  const [rutinaId, setRutinaId] = useState('');
  const [notas, setNotas] = useState('');
  const [error, setError] = useState('');

  const parsedClienteId = Number(clienteId);
  const clienteCitas = useMemo(
    () => citas.filter((c) => c.cliente_id === parsedClienteId),
    [citas, parsedClienteId],
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!parsedClienteId || !usuarios.some((u) => u.id === parsedClienteId)) {
      setError('Selecciona un cliente válido.');
      return;
    }

    if (!horaInicio) {
      setError('Indica la hora de inicio.');
      return;
    }

    addCita({
      cliente_id: parsedClienteId,
      fecha: fechaLocalISO(selectedDate),
      hora_inicio: horaInicio,
      duracion_min: duracionMin > 0 ? duracionMin : DEFAULT_DURACION,
      rutina_id: rutinaId ? Number(rutinaId) : null,
      notas: notas.trim() || undefined,
    });

    setNotas('');
    setRutinaId('');
    onCreated?.();
  };

  if (usuarios.length === 0) {
    return (
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        No hay clientes disponibles para agendar citas.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 fp-cal-form">
      <div className="flex flex-col gap-3 min-h-0 flex-1 overflow-y-auto">
        <div>
          <label htmlFor="cita-cliente" className="fp-cal-label">
            Cliente
          </label>
          <select
            id="cita-cliente"
            className="fp-input w-full"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
          >
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nombre}
              </option>
            ))}
          </select>
        </div>

        {isMobile ? (
          <>
            <TimeSlotChips
              selectedDate={selectedDate}
              value={horaInicio}
              onChange={setHoraInicio}
              timeRange={timeRange}
              duracionMin={duracionMin}
              clienteId={parsedClienteId}
              citas={clienteCitas}
            />
            <div>
              <p className="fp-cal-chip-section-label">Duración</p>
              <div className="fp-cal-chip-row fp-cal-duration-row">
                {DURACION_OPTIONS.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    className={`fp-cal-duration-chip${duracionMin === mins ? ' is-active' : ''}`}
                    onClick={() => setDuracionMin(mins)}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="cita-hora" className="fp-cal-label">
                Hora
              </label>
              <input
                id="cita-hora"
                type="time"
                className="fp-input w-full"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="cita-duracion" className="fp-cal-label">
                Duración (min)
              </label>
              <input
                id="cita-duracion"
                type="number"
                min={15}
                step={15}
                className="fp-input w-full"
                value={duracionMin}
                onChange={(e) => setDuracionMin(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="cita-rutina" className="fp-cal-label">
            Rutina (opcional)
          </label>
          <select
            id="cita-rutina"
            className="fp-input w-full"
            value={rutinaId}
            onChange={(e) => setRutinaId(e.target.value)}
          >
            <option value="">Sin rutina asignada</option>
            {rutinas.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="cita-notas" className="fp-cal-label">
            Notas
          </label>
          <textarea
            id="cita-notas"
            className="fp-input w-full resize-none"
            rows={2}
            placeholder="Objetivo de la sesión, recordatorios…"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>

        {error ? (
          <p style={{ fontSize: 12, color: 'var(--accent-red)' }}>{error}</p>
        ) : null}
      </div>

      <button type="submit" className="fp-btn fp-btn-primary w-full shrink-0 mt-3">
        Crear cita
      </button>
    </form>
  );
}

export { minutesToTime };
