import { Clock, Tag, Trash2, X } from 'lucide-react';
import { Sheet } from '../common/Sheet';
import type { Rutina, Usuario } from '../../types';
import type { CalendarEvent } from './calendarUtils';
import { useCitasStore } from '../../store/useCitasStore';
import {
  formatFechaLarga,
  formatMinutesRange,
  parseFechaLocal,
  rutinaNombre,
} from './calendarUtils';

interface CitaDetailSheetProps {
  event: CalendarEvent | null;
  usuarios: Usuario[];
  rutinas: Rutina[];
  onClose: () => void;
}

function clienteNombre(usuarios: Usuario[], id: number): string {
  return usuarios.find((u) => u.id === id)?.nombre ?? 'Cliente';
}

export function CitaDetailSheet({ event, usuarios, rutinas, onClose }: CitaDetailSheetProps) {
  const deleteCita = useCitasStore((s) => s.deleteCita);

  if (!event) return null;

  const fecha = parseFechaLocal(event.fecha);
  const rutina = rutinaNombre(rutinas, event.rutinaId);

  const handleDelete = () => {
    if (event.citaId != null) {
      deleteCita(event.citaId);
    }
    onClose();
  };

  return (
    <Sheet open ariaLabel="Detalle del evento" onClose={onClose}>
      <div className="fp-cal-detail">
        <div className="fp-cal-detail-header">
          <h2 className="font-sora">{event.kind === 'cita' ? event.title : event.title}</h2>
          <button type="button" className="fp-cal-detail-close" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="fp-cal-detail-tags">
          <span className={`fp-cal-tag fp-cal-tag-${event.kind}`}>
            {event.kind === 'cita' ? 'Cita' : 'Entreno'}
          </span>
          {rutina ? <span className="fp-cal-tag fp-cal-tag-rutina">{rutina}</span> : null}
        </div>

        <div className="fp-cal-detail-row">
          <Clock size={16} color="var(--text-muted)" />
          <div>
            <p className="fp-cal-detail-label">Fecha y hora</p>
            <p className="fp-cal-detail-value capitalize">{formatFechaLarga(fecha)}</p>
            <p className="fp-cal-detail-value">
              {formatMinutesRange(event.startMinutes, event.durationMin)}
            </p>
          </div>
        </div>

        <div className="fp-cal-detail-row">
          <Tag size={16} color="var(--text-muted)" />
          <div>
            <p className="fp-cal-detail-label">Cliente</p>
            <p className="fp-cal-detail-value">{clienteNombre(usuarios, event.clienteId)}</p>
          </div>
        </div>

        {event.kind === 'entreno' ? (
          <p className="fp-cal-detail-note">
            Rutina recurrente según el plan semanal del cliente.
          </p>
        ) : null}

        {event.notas ? (
          <div className="fp-cal-detail-notes">
            <p className="fp-cal-detail-label">Notas</p>
            <p>{event.notas}</p>
          </div>
        ) : null}

        {event.citaId != null ? (
          <button type="button" className="fp-cal-detail-delete" onClick={handleDelete}>
            <Trash2 size={16} />
            Eliminar cita
          </button>
        ) : null}
      </div>
    </Sheet>
  );
}
