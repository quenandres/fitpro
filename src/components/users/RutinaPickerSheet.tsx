import { useMemo, useState } from 'react';
import { Copy, Search, X } from 'lucide-react';
import type { Rutina } from '../../types';
import { Sheet } from '../common/Sheet';

interface Props {
  open: boolean;
  rutinas: Rutina[];
  semanasRestantes: number;
  entrenamientoLabel: string;
  semana: number;
  onClose: () => void;
  onSelect: (rutina: Rutina, replicar: boolean) => void;
}

export function RutinaPickerSheet({
  open,
  rutinas,
  semanasRestantes,
  entrenamientoLabel,
  semana,
  onClose,
  onSelect,
}: Props) {
  const [pending, setPending] = useState<Rutina | null>(null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rutinas;
    return rutinas.filter(
      (r) =>
        r.nombre.toLowerCase().includes(q)
        || r.dificultad.toLowerCase().includes(q)
        || (r.categoria?.toLowerCase().includes(q) ?? false),
    );
  }, [rutinas, query]);

  const handleClose = () => {
    setPending(null);
    setQuery('');
    onClose();
  };

  const confirm = (replicar: boolean) => {
    if (!pending) return;
    onSelect(pending, replicar);
    setPending(null);
    setQuery('');
    onClose();
  };

  const pickRutina = (r: Rutina) => {
    if (semanasRestantes <= 0) {
      onSelect(r, false);
      handleClose();
    } else {
      setPending(r);
    }
  };

  return (
    <Sheet open={open} onClose={handleClose} flexColumn ariaLabel="Asignar rutina existente">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 shrink-0 border-b border-line">
        <div className="min-w-0">
          <p className="font-sora text-base font-bold text-primary">Asignar rutina existente</p>
          <p className="text-xs text-muted truncate">
            {entrenamientoLabel} · Semana {semana}
          </p>
        </div>
        <button
          type="button"
          className="fp-btn fp-btn-ghost shrink-0 p-2"
          onClick={handleClose}
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
      </div>

      <div className="overflow-y-auto min-h-0 flex-1 px-5 py-4">
        {pending ? (
          <div className="animate-slide-up">
            <div
              className="fp-card mb-4"
              style={{ padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}
            >
              <p className="text-sm font-semibold text-primary mb-1">{pending.nombre}</p>
              <p className="text-[11px] text-muted">
                {pending.dificultad} · {pending.duracion_min} min · {pending.ejercicios.length}{' '}
                ejercicios
              </p>
            </div>
            <p className="text-xs text-muted mb-4 leading-relaxed">
              Elige el alcance de la asignación para <strong>{entrenamientoLabel}</strong>:
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="fp-btn fp-btn-secondary w-full justify-center"
                onClick={() => confirm(false)}
              >
                Solo semana {semana}
              </button>
              {semanasRestantes > 0 ? (
                <button
                  type="button"
                  className="fp-btn fp-btn-primary w-full justify-center gap-2"
                  onClick={() => confirm(true)}
                >
                  <Copy size={14} />
                  Desde esta semana hasta el final
                </button>
              ) : null}
              <button
                type="button"
                className="fp-btn fp-btn-ghost w-full"
                onClick={() => setPending(null)}
              >
                Elegir otra rutina
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="fp-input-group mb-4">
              <Search size={16} className="text-muted shrink-0" aria-hidden />
              <input
                type="search"
                className="fp-input border-0 bg-transparent shadow-none"
                placeholder="Buscar por nombre, categoría o dificultad…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar rutinas"
              />
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm font-semibold text-primary mb-1">Sin resultados</p>
                <p className="text-xs text-muted">
                  {query.trim()
                    ? 'Prueba otro término o crea una rutina personalizada para este cliente.'
                    : 'No hay rutinas en tu biblioteca. Crea una en Biblioteca → Rutinas.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="fp-card fp-card-hover text-left w-full"
                    style={{ padding: 12, borderRadius: 11 }}
                    onClick={() => pickRutina(r)}
                  >
                    <p className="text-sm font-semibold text-primary">{r.nombre}</p>
                    <p className="text-[11px] text-muted mt-0.5">
                      {r.dificultad} · {r.duracion_min} min · {r.ejercicios.length} ejercicios
                      {r.categoria ? ` · ${r.categoria}` : ''}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Sheet>
  );
}
