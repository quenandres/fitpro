interface Props {
  label?: string;
  className?: string;
}

/** Marca datos mock / no conectados al backend. */
export function DemoBadge({ label = 'Demo', className = '' }: Props) {
  return (
    <span
      className={`badge shrink-0 ${className}`}
      style={{
        fontSize: 9,
        padding: '2px 6px',
        background: 'rgba(240,136,62,.18)',
        color: '#f0883e',
        border: '1px solid rgba(240,136,62,.35)',
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}
