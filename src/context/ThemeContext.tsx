import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  isDark: boolean
  theme: Theme
  resolvedTheme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

function readInitialTheme(): Theme {
  const saved = localStorage.getItem('fitpro-theme')
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function applyLightClass(isDark: boolean) {
  const root = document.documentElement
  if (isDark) root.classList.remove('light')
  else root.classList.add('light')
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => readInitialTheme())
  const isDark = theme === 'dark'
  const resolvedTheme = theme

  useEffect(() => {
    applyLightClass(isDark)
    localStorage.setItem('fitpro-theme', theme)
  }, [isDark, theme])

  const setTheme = (next: Theme) => setThemeState(next)

  const toggleTheme = () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider
      value={{ isDark, theme, resolvedTheme, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
