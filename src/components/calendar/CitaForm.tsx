import { useState, type FormEvent } from 'react';
import type { Rutina, Usuario } from '../../types';
import { useCitasStore } from '../../store/useCitasStore';
import { fechaLocalISO } from './calendarUtils';

interface CitaFormProps {
  selectedDate: Date;
  usuarios: Usuario[];
  rutinas: Rutina[];
  defaultClienteId: number | null;
  defaultHora?: string;
  onCreated?: () => void;
}

const DEFAULT_DURACION = 60;

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function CitaForm({
  selectedDate,
  usuarios,
  rutinas,
  defaultClienteId,
  defaultHora = '10:00',
  onCreated,
}: CitaFormProps) {
  const addCita = useCitasStore((s) => s.addCita);
  const [clienteId, setClienteId] = useState(
    () => String(defaultClienteId ?? usuarios[0]?.id ?? ''),
  );
  const [horaInicio, setHoraInicio] = useState(defaultHora);
  const [duracionMin, setDuracionMin] = useState(DEFAULT_DURACION);
  const [rutinaId, setRutinaId] = useState('');
  const [notas, setNotas] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const parsedClienteId = Number(clienteId);
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
          className="fp-input w-full"
          rows={2}
          placeholder="Objetivo de la sesión, recordatorios…"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </div>

      {error ? (
        <p style={{ fontSize: 12, color: 'var(--accent-red)' }}>{error}</p>
      ) : null}

      <button type="submit" className="fp-btn fp-btn-primary w-full">
        Crear cita
      </button>
    </form>
  );
}

export { minutesToTime };
