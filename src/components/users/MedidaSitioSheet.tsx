import { useEffect, useState, type FormEvent } from 'react';
import { Ruler, X } from 'lucide-react';
import { getSitioDef } from '../../data/sitiosMedida';
import type { SitioMedidaId, ValoresSitio } from '../../types';
import { formatCm, parseCmInput, sitioHasValue } from '../../utils/medidasUtils';
import { Sheet } from '../common/Sheet';

interface MedidaSitioSheetProps {
  open: boolean;
  onClose: () => void;
  sitioId: SitioMedidaId | null;
  valores?: ValoresSitio;
  previous?: ValoresSitio;
  onSave: (sitioId: SitioMedidaId, valores: ValoresSitio) => void;
}

function toInputValue(n?: number): string {
  return n != null && !Number.isNaN(n) ? String(n) : '';
}

export function MedidaSitioSheet({
  open,
  onClose,
  sitioId,
  valores,
  previous,
  onSave,
}: MedidaSitioSheetProps) {
  const [unico, setUnico] = useState('');
  const [der, setDer] = useState('');
  const [izq, setIzq] = useState('');
  const [error, setError] = useState('');

  const def = sitioId ? getSitioDef(sitioId) : null;

  useEffect(() => {
    if (!open || !def) return;
    setUnico(toInputValue(valores?.unico));
    setDer(toInputValue(valores?.der));
    setIzq(toInputValue(valores?.izq));
    setError('');
  }, [open, def, valores]);

  if (!def) return null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!def.bilateral) {
      const parsed = parseCmInput(unico);
      if (parsed == null) {
        setError('Indica una medida válida en centímetros.');
        return;
      }
      onSave(def.id, { unico: parsed });
      onClose();
      return;
    }

    const parsedDer = parseCmInput(der);
    const parsedIzq = parseCmInput(izq);
    if (parsedDer == null && parsedIzq == null) {
      setError('Indica al menos una medida (derecho o izquierdo).');
      return;
    }
    onSave(def.id, {
      ...(parsedDer != null ? { der: parsedDer } : {}),
      ...(parsedIzq != null ? { izq: parsedIzq } : {}),
    });
    onClose();
  };

  const prevLabel = previous && sitioHasValue(previous)
    ? def.bilateral
      ? `Anterior: D ${previous.der?.toFixed(1) ?? '—'} · I ${previous.izq?.toFixed(1) ?? '—'} cm`
      : `Anterior: ${formatCm(previous.unico)}`
    : null;

  return (
    <Sheet open={open} onClose={onClose} flexColumn ariaLabel={`Medida: ${def.label}`}>
      <form className="flex flex-col min-h-0 flex-1" onSubmit={handleSubmit}>
        <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-2 shrink-0">
          <div className="min-w-0">
            <p className="fp-cal-label mb-1">Circunferencia</p>
            <h2 className="font-sora text-lg font-bold text-[var(--text-primary)] truncate">
              {def.label}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{def.hint}</p>
            {prevLabel ? (
              <p className="text-[11px] text-[var(--text-muted)] mt-2">{prevLabel}</p>
            ) : null}
          </div>
          <button
            type="button"
            className="fp-btn fp-btn-ghost shrink-0 p-2 rounded-[10px]"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 flex flex-col gap-4">
          {def.bilateral ? (
            <>
              <div>
                <label className="fp-cal-label" htmlFor="medida-der">
                  Lado derecho (R)
                </label>
                <div className="fp-input-group mt-1.5">
                  <Ruler size={16} className="text-[var(--text-muted)]" aria-hidden />
                  <input
                    id="medida-der"
                    type="text"
                    inputMode="decimal"
                    className="fp-input"
                    placeholder="Ej. 32.5"
                    value={der}
                    onChange={(e) => setDer(e.target.value)}
                    autoFocus
                  />
                  <span className="text-xs font-semibold text-[var(--text-muted)] pr-1">cm</span>
                </div>
              </div>
              <div>
                <label className="fp-cal-label" htmlFor="medida-izq">
                  Lado izquierdo (L)
                </label>
                <div className="fp-input-group mt-1.5">
                  <Ruler size={16} className="text-[var(--text-muted)]" aria-hidden />
                  <input
                    id="medida-izq"
                    type="text"
                    inputMode="decimal"
                    className="fp-input"
                    placeholder="Ej. 32.0"
                    value={izq}
                    onChange={(e) => setIzq(e.target.value)}
                  />
                  <span className="text-xs font-semibold text-[var(--text-muted)] pr-1">cm</span>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="fp-cal-label" htmlFor="medida-unico">
                Medida (cm)
              </label>
              <div className="fp-input-group mt-1.5">
                <Ruler size={16} className="text-[var(--text-muted)]" aria-hidden />
                <input
                  id="medida-unico"
                  type="text"
                  inputMode="decimal"
                  className="fp-input"
                  placeholder="Ej. 98.0"
                  value={unico}
                  onChange={(e) => setUnico(e.target.value)}
                  autoFocus
                />
                <span className="text-xs font-semibold text-[var(--text-muted)] pr-1">cm</span>
              </div>
            </div>
          )}

          {error ? (
            <p className="text-xs font-medium text-[var(--danger,#ef4444)]" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 px-4 pt-2 pb-4 flex gap-2">
          <button type="button" className="fp-btn fp-btn-secondary flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="fp-btn fp-btn-primary flex-1">
            Guardar
          </button>
        </div>
      </form>
    </Sheet>
  );
}
