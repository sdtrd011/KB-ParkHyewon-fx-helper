import { DashboardPage } from '@/pages/dashboard'
import { ThemeProvider } from '@/shared/lib'

export function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
        <DashboardPage />
      </div>
    </ThemeProvider>
  )
}
