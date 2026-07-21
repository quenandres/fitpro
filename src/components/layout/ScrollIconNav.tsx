import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

export interface ScrollIconNavItem {
  to: string;
  end?: boolean;
  Icon: LucideIcon;
  label: string;
}

interface Props {
  items: readonly ScrollIconNavItem[];
  accent: string;
  ariaLabel?: string;
}

const accentRgb = (hex: string): string => {
  const n = hex.replace('#', '');
  return `${parseInt(n.slice(0, 2), 16)}, ${parseInt(n.slice(2, 4), 16)}, ${parseInt(n.slice(4, 6), 16)}`;
};

export const ScrollIconNav = ({
  items,
  accent,
  ariaLabel = 'Secciones',
}: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const rgb = accentRgb(accent);

  useEffect(() => {
    const active = scrollRef.current?.querySelector('[aria-current="page"]');
    if (active instanceof HTMLElement) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [location.pathname]);

  return (
    <nav aria-label={ariaLabel} style={{ marginLeft: -16, marginRight: -16 }}>
      <div
        ref={scrollRef}
        className="scrollbar-hide"
        style={{
          display: 'flex',
          gap: 5,
          overflowX: 'auto',
          padding: '2px 16px 4px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {items.map(({ to, end, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            aria-label={label}
            style={({ isActive }) => ({
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isActive ? 5 : 0,
              minWidth: isActive ? undefined : 34,
              height: 34,
              padding: isActive ? '0 11px' : '0 9px',
              borderRadius: 100,
              fontSize: 11,
              fontWeight: 600,
              lineHeight: 1,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              background: isActive ? `rgba(${rgb}, .14)` : 'var(--bg-elevated)',
              color: isActive ? accent : 'var(--text-muted)',
              border: `1px solid ${isActive ? `rgba(${rgb}, .35)` : 'var(--border)'}`,
              transition:
                'background .15s, color .15s, border-color .15s, padding .2s ease, gap .2s ease, min-width .2s ease',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={14} strokeWidth={isActive ? 2.25 : 2} aria-hidden />
                <span
                  style={{
                    display: 'inline-block',
                    maxWidth: isActive ? 120 : 0,
                    opacity: isActive ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-width .2s ease, opacity .15s ease',
                  }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
