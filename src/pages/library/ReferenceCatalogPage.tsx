import { Link } from 'react-router-dom';
import { ChevronRight, RefreshCw, Search } from 'lucide-react';
import type { ReferenceItem } from '../../lib/exercisedb';
import { SkeletonCard } from '../../components/admin/common/Skeleton';

export type CatalogFilterKey = 'bodyPart' | 'equipment' | 'exerciseType' | 'muscle';

interface Props {
  title: string;
  subtitle: string;
  badge: string;
  accent: string;
  accentBg: string;
  filterKey: CatalogFilterKey;
  items: ReferenceItem[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
}

export const ReferenceCatalogPage = ({
  title,
  subtitle,
  badge,
  accent,
  accentBg,
  filterKey,
  items,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: Props) => (
  <div>
    <section className="animate-slide-up" style={{ paddingBottom: 14 }}>
      <div style={{ marginBottom: 10 }}>
        <span
          className="badge"
          style={{
            fontSize: 11,
            padding: '3px 9px',
            background: accentBg,
            color: accent,
            border: `1px solid ${accent}33`,
          }}
        >
          {badge}
        </span>
      </div>
      <h1
        className="font-sora"
        style={{
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: '-.02em',
          color: 'var(--text-primary)',
          marginBottom: 4,
        }}
      >
        {title}
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
        {isLoading ? 'Cargando catálogo…' : `${items.length} opciones · toca para filtrar ejercicios`}
      </p>
      {!isLoading && !isError && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          {subtitle}
        </p>
      )}
    </section>

    {isLoading && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )}

    {isError && (
      <div className="animate-fade-in text-center" style={{ paddingTop: 40 }}>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
          No se pudo cargar el catálogo
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          {errorMessage ?? 'Intenta de nuevo más tarde'}
        </p>
        <button type="button" className="fp-btn fp-btn-secondary" onClick={onRetry}>
          <RefreshCw size={14} /> Reintentar
        </button>
      </div>
    )}

    {!isLoading && !isError && items.length === 0 && (
      <div className="animate-fade-in text-center" style={{ paddingTop: 40 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'var(--bg-overlay)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}
        >
          <Search size={22} color="var(--text-muted)" />
        </div>
        <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Sin datos</p>
      </div>
    )}

    {!isLoading && !isError && items.length > 0 && (
      <div
        className="animate-slide-up delay-100"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
        }}
      >
        {items.map((item, i) => (
          <Link
            key={item.name}
            to={`/library/ejercicios?${filterKey}=${encodeURIComponent(item.name)}`}
            className="fp-card fp-card-hover animate-slide-up"
            style={{
              textDecoration: 'none',
              padding: 0,
              borderRadius: 13,
              overflow: 'hidden',
              animationDelay: `${Math.min(i, 12) * 25}ms`,
            }}
          >
            <div
              style={{
                aspectRatio: '1.15',
                background: accentBg,
                position: 'relative',
              }}
            >
              <img
                src={item.imageUrl}
                alt=""
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `linear-gradient(to top, var(--bg-card) 0%, transparent 55%)`,
                }}
              />
            </div>
            <div
              style={{
                padding: '8px 10px 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 6,
              }}
            >
              <span
                className="font-sora"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.25,
                }}
              >
                {item.name}
              </span>
              <ChevronRight size={12} color="var(--text-muted)" className="shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
);
