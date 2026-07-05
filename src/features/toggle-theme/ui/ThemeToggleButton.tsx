import { useTheme } from '@/shared/lib'
import { Button } from '@/shared/ui'

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme()
  const label = theme === 'light' ? '다크모드' : '라이트모드'

  return (
    <Button variant="secondary" onClick={toggleTheme} aria-label={label}>
      {label}
    </Button>
  )
}
