import { useState, type FormEvent } from 'react';
import type { CitaTipo, Rutina, Usuario } from '../../types';
import { useCitasStore } from '../../store/useCitasStore';
import { Sheet } from '../common/Sheet';
import { ClienteMultiPicker } from './ClienteMultiPicker';
import { TimeSlotChips } from './TimeSlotChips';
import {
  fechaLocalISO,
  getDefaultTimeRange,
  isSlotOccupied,
  type SchedulerTimeRange,
} from './calendarUtils';

interface CitaCreateSheetProps {
  open: boolean;
  onClose: () => void;
  selectedDate: Date;
  usuarios: Usuario[];
  rutinas: Rutina[];
  defaultHora?: string;
  defaultClienteIds?: number[];
  isMobile?: boolean;
  timeRange?: SchedulerTimeRange;
}

const DURACION_ENTRENO = [30, 45, 60, 90] as const;
const DURACION_MEDIDAS = [15, 30, 45] as const;

export function CitaCreateSheet({
  open,
  onClose,
  selectedDate,
  usuarios,
  rutinas,
  defaultHora = '10:00',
  defaultClienteIds = [],
  isMobile = false,
  timeRange = getDefaultTimeRange(),
}: CitaCreateSheetProps) {
  const addCitas = useCitasStore((s) => s.addCitas);
  const citas = useCitasStore((s) => s.citas);

  const [tipo, setTipo] = useState<CitaTipo>('entrenamiento');
  const [clienteIds, setClienteIds] = useState<number[]>(() => [...defaultClienteIds]);
  const [horaInicio, setHoraInicio] = useState(defaultHora);
  const [duracionMin, setDuracionMin] = useState(60);
  const [rutinaId, setRutinaId] = useState('');
  const [notas, setNotas] = useState('');
  const [error, setError] = useState('');

  const fecha = fechaLocalISO(selectedDate);
  const duracionOptions = tipo === 'medidas' ? DURACION_MEDIDAS : DURACION_ENTRENO;

  const handleTipoChange = (next: CitaTipo) => {
    setTipo(next);
    if (next === 'medidas') {
      setDuracionMin(30);
      setRutinaId('');
    } else if (duracionMin === 30 && tipo === 'medidas') {
      setDuracionMin(60);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (clienteIds.length === 0) {
      setError('Selecciona al menos un cliente.');
      return;
    }

    if (!horaInicio) {
      setError('Indica la hora de inicio.');
      return;
    }

    const slotMinutes = horaInicio.split(':').map(Number);
    const startMin = slotMinutes[0] * 60 + slotMinutes[1];

    for (const clienteId of clienteIds) {
      if (isSlotOccupied(fecha, startMin, duracionMin, citas, clienteId)) {
        const nombre = usuarios.find((u) => u.id === clienteId)?.nombre ?? 'Cliente';
        setError(`${nombre} ya tiene una cita en ese horario.`);
        return;
      }
    }

    addCitas(
      clienteIds.map((cliente_id) => ({
        cliente_id,
        fecha,
        hora_inicio: horaInicio,
        duracion_min: duracionMin,
        tipo,
        rutina_id: tipo === 'entrenamiento' && rutinaId ? Number(rutinaId) : null,
        notas: notas.trim() || undefined,
      })),
    );

    setNotas('');
    setRutinaId('');
    setClienteIds([]);
    onClose();
  };

  if (!open) return null;

  const citasForSlots = citas.filter((c) => clienteIds.length === 1 && c.cliente_id === clienteIds[0]);

  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Agendar cita" flexColumn>
      <div className="fp-cal-create-sheet flex flex-col min-h-0 flex-1">
        <div className="shrink-0">
          <h2 className="font-sora text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Agendar cita
          </h2>
          <p className="mb-4 capitalize" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {new Intl.DateTimeFormat('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            }).format(selectedDate)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 fp-cal-form">
          <div className="flex flex-col gap-3 min-h-0 flex-1 overflow-y-auto">
            <div>
              <p className="fp-cal-chip-section-label">Tipo de cita</p>
              <div className="fp-cal-chip-row">
                <button
                  type="button"
                  className={`fp-cal-duration-chip${tipo === 'entrenamiento' ? ' is-active' : ''}`}
                  onClick={() => handleTipoChange('entrenamiento')}
                >
                  Entrenamiento
                </button>
                <button
                  type="button"
                  className={`fp-cal-duration-chip${tipo === 'medidas' ? ' is-active' : ''}`}
                  onClick={() => handleTipoChange('medidas')}
                >
                  Seguimiento de medidas
                </button>
              </div>
            </div>

            <ClienteMultiPicker
              usuarios={usuarios}
              selectedIds={clienteIds}
              onChange={setClienteIds}
            />

            {isMobile && clienteIds.length === 1 ? (
              <TimeSlotChips
                selectedDate={selectedDate}
                value={horaInicio}
                onChange={setHoraInicio}
                timeRange={timeRange}
                duracionMin={duracionMin}
                clienteId={clienteIds[0]}
                citas={citasForSlots}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cita-hora" className="fp-cal-label">Hora</label>
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
                  <label htmlFor="cita-duracion" className="fp-cal-label">Duración (min)</label>
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

            {isMobile ? (
              <div>
                <p className="fp-cal-chip-section-label">Duración</p>
                <div className="fp-cal-chip-row fp-cal-duration-row">
                  {duracionOptions.map((mins) => (
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
            ) : null}

            {tipo === 'entrenamiento' ? (
              <div>
                <label htmlFor="cita-rutina" className="fp-cal-label">Rutina (opcional)</label>
                <select
                  id="cita-rutina"
                  className="fp-input w-full"
                  value={rutinaId}
                  onChange={(e) => setRutinaId(e.target.value)}
                >
                  <option value="">Sin rutina asignada</option>
                  {rutinas.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              </div>
            ) : null}

            <div>
              <label htmlFor="cita-notas" className="fp-cal-label">Notas</label>
              <textarea
                id="cita-notas"
                className="fp-input w-full resize-none"
                rows={2}
                placeholder={tipo === 'medidas' ? 'Medidas a tomar, recordatorios…' : 'Objetivo de la sesión, recordatorios…'}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
            </div>

            {error ? (
              <p style={{ fontSize: 12, color: 'var(--accent-red)' }}>{error}</p>
            ) : null}
          </div>

          <button type="submit" className="fp-btn fp-btn-primary w-full shrink-0 mt-3">
            {clienteIds.length > 1
              ? `Crear ${clienteIds.length} citas`
              : 'Crear cita'}
          </button>
        </form>
      </div>
    </Sheet>
  );
}
