import { STORAGE_KEYS } from '@/shared/config'

export type ThemeMode = 'light' | 'dark'

const DEFAULT_THEME: ThemeMode = 'light'

export function getStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.theme)

    return stored === 'dark' ? 'dark' : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function setStoredTheme(theme: ThemeMode): void {
  localStorage.setItem(STORAGE_KEYS.theme, theme)
}

export function applyThemeToDocument(theme: ThemeMode): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function initializeTheme(): void {
  applyThemeToDocument(getStoredTheme())
}
