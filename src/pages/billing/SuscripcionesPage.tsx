import { useMemo, useState } from 'react';
import { Search, BadgeCheck } from 'lucide-react';
import { SuscripcionRow } from '../../components/billing/cards/SuscripcionRow';
import { DemoBadge } from '../../components/common/DemoBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { SUSCRIPCION_TABS } from '../../components/billing/shared/billingMeta';
import { useBillingStore } from '../../store/useBillingStore';
import type { EstadoSuscripcion } from '../../types/billing';

type TabKey = EstadoSuscripcion | 'todas';

export function SuscripcionesPage() {
  const [tab, setTab] = useState<TabKey>('todas');
  const [search, setSearch] = useState('');

  const suscripciones = useBillingStore((s) => s.suscripciones);
  const planes = useBillingStore((s) => s.planes);

  const planMap = useMemo(
    () => new Map(planes.map((p) => [p.id, p])),
    [planes],
  );

  const filtered = useMemo(() => {
    let list = tab === 'todas' ? suscripciones : suscripciones.filter((s) => s.estado === tab);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.usuarioNombre.toLowerCase().includes(q)
          || (planMap.get(s.planId)?.nombre.toLowerCase().includes(q) ?? false),
      );
    }
    return list.sort(
      (a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime(),
    );
  }, [suscripciones, tab, search, planMap]);

  return (
    <div>
      <section style={{ paddingBottom: 14 }}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-blue" style={{ fontSize: 11, padding: '3px 9px' }}>
            <BadgeCheck size={10} style={{ marginRight: 3 }} />
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
          Suscripciones
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Estado de acceso de cada cliente: planes activos, vencimientos y cancelaciones.
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
            placeholder="Buscar por cliente o plan…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar suscripciones"
          />
        </div>

        <div className="fp-lib-tabs" role="tablist" aria-label="Filtrar por estado">
          {SUSCRIPCION_TABS.map((t) => (
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
          icon={BadgeCheck}
          title="Sin suscripciones"
          description="Prueba con otro estado o término de búsqueda."
        />
      ) : (
        <div className="fp-bill-list">
          {filtered.map((suscripcion) => (
            <SuscripcionRow
              key={suscripcion.id}
              suscripcion={suscripcion}
              plan={planMap.get(suscripcion.planId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
