import { useState } from 'react';

interface AvatarProps {
  src?: string;
  nombre: string;
  size?: number;
  className?: string;
  /** Punto de color en la esquina (ej. indicador online/rol). */
  ringColor?: string;
}

const initialsOf = (nombre: string) =>
  nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

/** Avatar circular con imagen y fallback de iniciales. */
export function Avatar({ src, nombre, size = 40, className = '', ringColor }: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const showImage = Boolean(src) && !errored;

  return (
    <div
      className={`shrink-0 rounded-full overflow-hidden flex items-center justify-center font-sora font-semibold ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(11, size * 0.38),
        background: 'var(--bg-overlay)',
        color: 'var(--text-secondary)',
        boxShadow: ringColor ? `0 0 0 2px ${ringColor}` : undefined,
      }}
      aria-hidden={showImage ? undefined : true}
    >
      {showImage ? (
        <img
          src={src}
          alt={nombre}
          className="w-full h-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <span>{initialsOf(nombre)}</span>
      )}
    </div>
  );
}
