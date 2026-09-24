import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { ThemeToggler } from '../../lib/themeToggler'

export const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme()

  return (
    <ThemeToggler
      theme={theme}
      resolvedTheme={resolvedTheme}
      setTheme={setTheme}
      direction="ltr"
    >
      {({ toggleTheme, resolved }) => {
        const isDark = resolved === 'dark'
        return (
          <button
            type="button"
            onClick={() => toggleTheme(isDark ? 'light' : 'dark')}
            className="relative flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-150 hover:scale-105 fp-btn fp-btn-ghost p-0"
            style={{
              background: isDark ? 'var(--bg-elevated)' : 'var(--bg-overlay)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}
            aria-label={
              isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
            }
          >
            <span
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
              style={{ opacity: isDark ? 1 : 0 }}
              aria-hidden={!isDark}
            >
              <Moon className="h-5 w-5" style={{ color: 'var(--brand-bright)' }} />
            </span>
            <span
              className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
              style={{ opacity: isDark ? 0 : 1 }}
              aria-hidden={isDark}
            >
              <Sun className="h-5 w-5" style={{ color: 'var(--accent-orange)' }} />
            </span>
          </button>
        )
      }}
    </ThemeToggler>
  )
}
