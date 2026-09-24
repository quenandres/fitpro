import * as React from 'react'
import { flushSync } from 'react-dom'
import { DURACION_TEMA_MS, prefiereMovimientoReducido } from './themeMotion'

type ThemeSelection = 'light' | 'dark'
type Resolved = 'light' | 'dark'
type Direction = 'btt' | 'ttb' | 'ltr' | 'rtl'

type ChildrenRender = (state: {
  resolved: Resolved
  effective: ThemeSelection
  toggleTheme: (theme: ThemeSelection) => void
}) => React.ReactNode

function getClipKeyframes(direction: Direction): [string, string] {
  switch (direction) {
    case 'ltr':
      return ['inset(0 100% 0 0)', 'inset(0 0 0 0)']
    case 'rtl':
      return ['inset(0 0 0 100%)', 'inset(0 0 0 0)']
    case 'ttb':
      return ['inset(0 0 100% 0)', 'inset(0 0 0 0)']
    case 'btt':
      return ['inset(100% 0 0 0)', 'inset(0 0 0 0)']
    default:
      return ['inset(0 100% 0 0)', 'inset(0 0 0 0)']
  }
}

function applyLightClass(resolved: Resolved) {
  const root = document.documentElement
  if (resolved === 'light') root.classList.add('light')
  else root.classList.remove('light')
}

type ThemeTogglerProps = {
  theme: ThemeSelection
  resolvedTheme: Resolved
  setTheme: (theme: ThemeSelection) => void
  direction?: Direction
  children?: ChildrenRender
}

export function ThemeToggler({
  theme,
  resolvedTheme,
  setTheme,
  direction = 'ltr',
  children,
}: ThemeTogglerProps) {
  const [current, setCurrent] = React.useState({
    effective: theme,
    resolved: resolvedTheme,
  })

  React.useEffect(() => {
    setCurrent({ effective: theme, resolved: resolvedTheme })
  }, [theme, resolvedTheme])

  const [fromClip, toClip] = getClipKeyframes(direction)

  const toggleTheme = React.useCallback(
    async (next: ThemeSelection) => {
      const resolved: Resolved = next

      setCurrent({ effective: next, resolved })

      if (next === theme && resolved === resolvedTheme) return

      if (!document.startViewTransition || prefiereMovimientoReducido()) {
        flushSync(() => {
          applyLightClass(resolved)
        })
        setTheme(next)
        return
      }

      await document.startViewTransition(() => {
        flushSync(() => {
          applyLightClass(resolved)
        })
      }).ready

      document.documentElement
        .animate(
          { clipPath: [fromClip, toClip] },
          {
            duration: DURACION_TEMA_MS,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          },
        )
        .finished.finally(() => {
          setTheme(next)
        })
    },
    [theme, resolvedTheme, fromClip, toClip, setTheme],
  )

  return (
    <>
      {typeof children === 'function'
        ? children({
            effective: current.effective,
            resolved: current.resolved,
            toggleTheme,
          })
        : children}
      <style>{`::view-transition-old(root), ::view-transition-new(root){animation:none;mix-blend-mode:normal;}`}</style>
    </>
  )
}
