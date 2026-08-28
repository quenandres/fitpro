import { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Usuario } from '../../types';

interface ClienteMultiPickerProps {
  usuarios: Usuario[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  max?: number;
}

export function ClienteMultiPicker({
  usuarios,
  selectedIds,
  onChange,
  max,
}: ClienteMultiPickerProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return usuarios;
    const q = search.trim().toLowerCase();
    return usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(q)
        || u.email.toLowerCase().includes(q),
    );
  }, [usuarios, search]);

  const selectedUsers = useMemo(
    () => usuarios.filter((u) => selectedIds.includes(u.id)),
    [usuarios, selectedIds],
  );

  const toggle = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
      return;
    }
    if (max != null && selectedIds.length >= max) return;
    onChange([...selectedIds, id]);
  };

  const remove = (id: number) => {
    onChange(selectedIds.filter((x) => x !== id));
  };

  return (
    <div className="fp-cal-cliente-picker">
      <label className="fp-cal-label">Clientes</label>

      {selectedUsers.length > 0 ? (
        <div className="fp-cal-cliente-chips">
          {selectedUsers.map((u) => (
            <span key={u.id} className="fp-cal-cliente-chip">
              {u.nombre}
              <button
                type="button"
                className="fp-cal-cliente-chip-remove"
                aria-label={`Quitar ${u.nombre}`}
                onClick={() => remove(u.id)}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="fp-input-group">
        <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="search"
          placeholder="Buscar cliente…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <ul className="fp-cal-cliente-list">
        {filtered.map((u) => {
          const checked = selectedIds.includes(u.id);
          const disabled = !checked && max != null && selectedIds.length >= max;

          return (
            <li key={u.id}>
              <label className={`fp-cal-cliente-row${disabled ? ' is-disabled' : ''}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggle(u.id)}
                />
                <span className="fp-cal-cliente-row-name">{u.nombre}</span>
                <span className="fp-cal-cliente-row-meta">{u.nivel}</span>
              </label>
            </li>
          );
        })}
        {filtered.length === 0 ? (
          <li className="fp-cal-cliente-empty">Sin resultados</li>
        ) : null}
      </ul>
    </div>
  );
}
