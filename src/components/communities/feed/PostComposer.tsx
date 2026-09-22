import { useState } from 'react';
import type { TipoPost } from '../../../types/community';

interface PostComposerProps {
  tipo: TipoPost;
  onSubmit: (texto: string) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const TIPO_LABEL: Record<TipoPost, string> = {
  general: 'Publicación',
  logro: 'Logro',
  pregunta: 'Pregunta',
  anuncio: 'Anuncio',
};

export function PostComposer({ tipo, onSubmit, onCancel, submitLabel = 'Publicar' }: PostComposerProps) {
  const [texto, setTexto] = useState('');

  const canSubmit = texto.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(texto.trim());
  };

  return (
    <div className="flex flex-col gap-3">
      <span
        className="self-start text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ background: 'var(--accent-pink-dim)', color: 'var(--accent-pink)' }}
      >
        {TIPO_LABEL[tipo]}
      </span>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="¿Qué quieres compartir con la comunidad?"
        rows={5}
        autoFocus
        className="fp-input w-full resize-none"
      />

      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <button type="button" className="fp-btn fp-btn-secondary text-sm" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
        <button
          type="button"
          className="fp-btn fp-btn-primary text-sm"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
