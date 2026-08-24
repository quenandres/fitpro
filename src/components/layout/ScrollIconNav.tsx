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
    <nav aria-label={ariaLabel} className="-mx-4 md:mx-0">
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-1.5 overflow-x-auto px-4 py-0.5 md:flex-wrap md:overflow-visible md:px-0 md:gap-2"
        style={{ WebkitOverflowScrolling: 'touch' }}
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
            className="md:!gap-1.5 md:!px-3"
          >
            {({ isActive }) => (
              <>
                <Icon size={14} strokeWidth={isActive ? 2.25 : 2} aria-hidden />
                <span
                  className={`inline-block overflow-hidden transition-[max-width,opacity] duration-200 ${
                    isActive
                      ? 'max-w-[120px] opacity-100'
                      : 'max-w-0 opacity-0 md:max-w-[120px] md:opacity-100'
                  }`}
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
