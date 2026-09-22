import { useMemo, useState } from 'react';
import { Search, CreditCard } from 'lucide-react';
import { PagoRow } from '../../components/billing/cards/PagoRow';
import { DemoBadge } from '../../components/common/DemoBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { PAGO_TABS } from '../../components/billing/shared/billingMeta';
import { useBillingStore } from '../../store/useBillingStore';
import type { EstadoPago } from '../../types/billing';

type TabKey = EstadoPago | 'todos';

export function PagosPage() {
  const [tab, setTab] = useState<TabKey>('todos');
  const [search, setSearch] = useState('');

  const pagos = useBillingStore((s) => s.pagos);
  const planes = useBillingStore((s) => s.planes);

  const planMap = useMemo(
    () => new Map(planes.map((p) => [p.id, p])),
    [planes],
  );

  const filtered = useMemo(() => {
    let list = tab === 'todos' ? pagos : pagos.filter((p) => p.estado === tab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.usuarioNombre.toLowerCase().includes(q)
          || p.transaccionId.toLowerCase().includes(q)
          || p.referenciaExterna.toLowerCase().includes(q),
      );
    }
    return list.sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
    );
  }, [pagos, tab, search]);

  return (
    <div>
      <section style={{ paddingBottom: 14 }}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
            <CreditCard size={10} style={{ marginRight: 3 }} />
            Biblioteca
          </span>
          <DemoBadge label="Demo · mock" />
        </div>
        <h1
          className="font-sora"
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: '-.02em',
            color: 'var(--text-primary)',
            marginTop: 8,
            marginBottom: 4,
          }}
        >
          Pagos
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Transacciones recibidas desde la app de pagos: estado, método y referencia.
        </p>
      </section>

      <div
        className="fp-card"
        style={{
          padding: 14,
          marginBottom: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div className="fp-input-group">
          <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="search"
            placeholder="Buscar por cliente, transacción o referencia…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar pagos"
          />
        </div>

        <div className="fp-lib-tabs" role="tablist" aria-label="Filtrar por estado">
          {PAGO_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={`fp-lib-tab${tab === t.key ? ' is-active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Sin pagos"
          description="Prueba con otro estado o término de búsqueda."
        />
      ) : (
        <div className="fp-bill-list">
          {filtered.map((pago) => (
            <PagoRow
              key={pago.id}
              pago={pago}
              plan={planMap.get(pago.planId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
