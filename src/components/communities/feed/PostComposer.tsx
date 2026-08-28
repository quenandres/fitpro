import { useRef, useState } from 'react';
import { Image as ImageIcon, Loader2, X } from 'lucide-react';
import type { MediaPost, TipoPost } from '../../../types/community';

interface AttachedMedia extends MediaPost {
  id: string;
  estado: 'subiendo' | 'listo' | 'error';
}

interface PostComposerProps {
  tipo: TipoPost;
  onSubmit: (texto: string, media: MediaPost[]) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const TIPO_LABEL: Record<TipoPost, string> = {
  general: 'Publicación',
  logro: 'Logro',
  pregunta: 'Pregunta',
  anuncio: 'Anuncio',
};

/** Composer de publicación con adjuntar multimedia simulado (preview local, sin upload real). */
export function PostComposer({ tipo, onSubmit, onCancel, submitLabel = 'Publicar' }: PostComposerProps) {
  const [texto, setTexto] = useState('');
  const [media, setMedia] = useState<AttachedMedia[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const id = `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`;
      const url = URL.createObjectURL(file);
      const item: AttachedMedia = {
        id,
        tipo: file.type.startsWith('video') ? 'video' : 'imagen',
        url,
        estado: 'subiendo',
      };
      setMedia((prev) => [...prev, item]);
      setTimeout(() => {
        setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, estado: 'listo' } : m)));
      }, 900);
    });
  };

  const removeMedia = (id: string) => setMedia((prev) => prev.filter((m) => m.id !== id));

  const canSubmit = texto.trim().length > 0 && media.every((m) => m.estado !== 'subiendo');

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(
      texto.trim(),
      media.map(({ tipo: t, url }) => ({ tipo: t, url })),
    );
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

      {media.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {media.map((m) => (
            <div key={m.id} className="relative rounded-lg overflow-hidden aspect-square" style={{ background: 'var(--bg-overlay)' }}>
              {m.tipo === 'video' ? (
                <video src={m.url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              )}
              {m.estado === 'subiendo' ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 size={20} className="animate-spin text-white" />
                </div>
              ) : null}
              <button
                type="button"
                className="absolute top-1 right-1 rounded-full p-1"
                style={{ background: 'rgba(0,0,0,.6)', color: '#fff' }}
                onClick={() => removeMedia(m.id)}
                aria-label="Quitar adjunto"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <button
          type="button"
          className="fp-btn fp-btn-ghost flex items-center gap-2 text-sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon size={16} />
          Adjuntar
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex gap-2">
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
    </div>
  );
}
