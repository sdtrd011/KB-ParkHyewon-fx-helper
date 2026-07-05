import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import {
  applyThemeToDocument,
  getStoredTheme,
  setStoredTheme,
  type ThemeMode,
} from './themeStorage'

interface ThemeContextValue {
  theme: ThemeMode
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme())

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: ThemeMode = current === 'light' ? 'dark' : 'light'

      setStoredTheme(next)
      applyThemeToDocument(next)

      return next
    })
  }, [])

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
