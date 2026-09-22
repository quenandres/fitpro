import { useState } from 'react';
import { Sheet } from '../../common/Sheet';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (motivo: string, mantieneAcceso: boolean) => void;
  usuarioNombre: string;
}

export function CancelarSuscripcionSheet({ open, onClose, onConfirm, usuarioNombre }: Props) {
  const [motivo, setMotivo] = useState('');
  const [mantieneAcceso, setMantieneAcceso] = useState(true);

  const handleClose = () => {
    setMotivo('');
    setMantieneAcceso(true);
    onClose();
  };

  const handleConfirm = () => {
    if (!motivo.trim()) return;
    onConfirm(motivo.trim(), mantieneAcceso);
    setMotivo('');
    setMantieneAcceso(true);
  };

  return (
    <Sheet open={open} onClose={handleClose} ariaLabel="Cancelar suscripción" flexColumn>
      <div className="flex flex-col min-h-0 flex-1 px-5 pt-5">
        <div className="shrink-0">
          <h2
            className="font-sora"
            style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}
          >
            Cancelar suscripción
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
            Vas a cancelar la suscripción de {usuarioNombre}. Esta acción queda registrada en el historial.
          </p>
        </div>

        <div className="flex flex-col gap-4 min-h-0 flex-1 overflow-y-auto mt-5">
          <div>
            <label className="fp-cal-label" htmlFor="cancel-motivo">
              Motivo de cancelación
            </label>
            <textarea
              id="cancel-motivo"
              className="fp-input min-h-[88px] resize-y mt-2 w-full"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej.: Cliente cambió de entrenador"
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={mantieneAcceso}
              onChange={(e) => setMantieneAcceso(e.target.checked)}
              className="mt-0.5"
            />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Mantener acceso hasta fin del período actual
            </span>
          </label>
        </div>

        <div className="flex gap-2 shrink-0 pt-5 pb-5">
          <button type="button" className="fp-btn fp-btn-secondary flex-1" onClick={handleClose}>
            Volver
          </button>
          <button
            type="button"
            className="fp-btn flex-1"
            style={{ background: 'var(--accent-red)', color: 'var(--on-brand)' }}
            disabled={!motivo.trim()}
            onClick={handleConfirm}
          >
            Confirmar cancelación
          </button>
        </div>
      </div>
    </Sheet>
  );
}
