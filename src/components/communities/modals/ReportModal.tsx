import { useState } from 'react';
import { Sheet } from '../../common/Sheet';
import { useCommunitiesStore, CURRENT_MEMBER_ID } from '../../../store/useCommunitiesStore';
import type { MotivoReporte } from '../../../types/community';

const MOTIVOS: Array<{ value: MotivoReporte; label: string }> = [
  { value: 'spam', label: 'Spam o publicidad' },
  { value: 'contenido_inapropiado', label: 'Contenido inapropiado' },
  { value: 'acoso', label: 'Acoso u hostigamiento' },
  { value: 'otro', label: 'Otro motivo' },
];

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  comunidadId: string;
  postId?: string;
  discusionId?: string;
  onSubmitted?: () => void;
}

/** Reportar un post o una discusión — reutilizable en Fase 2 y Fase 4. */
export function ReportModal({ open, onClose, comunidadId, postId, discusionId, onSubmitted }: ReportModalProps) {
  const addReport = useCommunitiesStore((s) => s.addReport);
  const [motivo, setMotivo] = useState<MotivoReporte>('spam');
  const [detalle, setDetalle] = useState('');

  const handleSubmit = () => {
    addReport({
      comunidadId,
      postId,
      discusionId,
      reportadoPorId: CURRENT_MEMBER_ID,
      motivo,
      detalle: detalle.trim() || undefined,
    });
    setDetalle('');
    setMotivo('spam');
    onSubmitted?.();
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} ariaLabel="Reportar contenido">
      <div className="p-5">
        <h2 className="font-sora text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Reportar contenido
        </h2>

        <div className="flex flex-col gap-2">
          {MOTIVOS.map((m) => (
            <label
              key={m.value}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
              style={{ background: motivo === m.value ? 'var(--accent-pink-dim)' : 'var(--bg-overlay)' }}
            >
              <input
                type="radio"
                name="motivo-reporte"
                checked={motivo === m.value}
                onChange={() => setMotivo(m.value)}
                style={{ accentColor: 'var(--accent-pink)' }}
              />
              <span style={{ color: motivo === m.value ? 'var(--accent-pink)' : 'var(--text-primary)' }}>
                {m.label}
              </span>
            </label>
          ))}
        </div>

        <textarea
          value={detalle}
          onChange={(e) => setDetalle(e.target.value)}
          placeholder="Detalles adicionales (opcional)"
          rows={3}
          className="w-full mt-3 px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
          style={{ background: 'var(--bg-overlay)', color: 'var(--text-primary)' }}
        />

        <button type="button" className="fp-btn w-full mt-4" style={{ background: 'var(--accent-red)', color: '#fff' }} onClick={handleSubmit}>
          Enviar reporte
        </button>
      </div>
    </Sheet>
  );
}
