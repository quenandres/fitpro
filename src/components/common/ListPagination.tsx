interface Props {
  page: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function ListPagination({
  page,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
  className = '',
}: Props) {
  if (totalRecords <= pageSize) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalRecords);

  return (
    <nav
      className={`flex flex-wrap items-center justify-between gap-3 ${className}`}
      aria-label="Paginación"
    >
      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {from}–{to} de {totalRecords}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="fp-btn fp-btn-secondary"
          style={{ fontSize: 12, padding: '6px 12px' }}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </button>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 88, textAlign: 'center' }}>
          Página {page} / {totalPages}
        </span>
        <button
          type="button"
          className="fp-btn fp-btn-secondary"
          style={{ fontSize: 12, padding: '6px 12px' }}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </button>
      </div>
    </nav>
  );
}
