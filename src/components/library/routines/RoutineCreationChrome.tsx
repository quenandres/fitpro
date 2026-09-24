import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface Props {
  crumbs: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  badges?: ReactNode;
  aside?: ReactNode;
}

export const RoutineCreationChrome = ({ crumbs, title, subtitle, badges, aside }: Props) => (
  <section className="animate-slide-up" style={{ paddingBottom: 16 }}>
    <nav aria-label="Ruta" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginBottom: 10 }}>
      {crumbs.map((c, i) => (
        <span key={c.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {i > 0 ? <ChevronRight size={12} color="var(--text-muted)" aria-hidden /> : null}
          {c.to ? (
            <Link
              to={c.to}
              style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'none' }}
            >
              {c.label}
            </Link>
          ) : (
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{c.label}</span>
          )}
        </span>
      ))}
    </nav>

    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {badges ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>{badges}</div> : null}
        <h1
          className="font-sora"
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '-.02em',
            color: 'var(--text-primary)',
            marginBottom: subtitle ? 6 : 0,
            lineHeight: 1.15,
          }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 640, lineHeight: 1.5 }}>{subtitle}</p>
        ) : null}
      </div>
      {aside ? <div style={{ flexShrink: 0 }}>{aside}</div> : null}
    </div>
  </section>
);
