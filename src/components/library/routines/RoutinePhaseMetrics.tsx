interface Metric {
  label: string;
  value: string;
  hint?: string;
}

export const RoutinePhaseMetrics = ({ metrics }: { metrics: Metric[] }) => (
  <div
    className="grid gap-2 mb-4"
    style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}
  >
    {metrics.map((m) => (
      <div
        key={m.label}
        className="fp-card"
        style={{ padding: '10px 12px', boxShadow: 'none', background: 'var(--bg-elevated)' }}
      >
        <p className="fp-cal-label" style={{ marginBottom: 4 }}>
          {m.label}
        </p>
        <p className="font-sora" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
          {m.value}
        </p>
        {m.hint ? (
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{m.hint}</p>
        ) : null}
      </div>
    ))}
  </div>
);
