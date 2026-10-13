'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Theme = 'light' | 'dark'

const AdminThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
}>({
  theme: 'light',
  toggleTheme: () => {},
})

export function useAdminTheme() {
  return useContext(AdminThemeContext)
}

function readStoredTheme(): Theme {
  const stored = localStorage.getItem('admin-theme')
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setTheme(readStoredTheme())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem('admin-theme', theme)
  }, [ready, theme])

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`admin-shell min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  )
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useAdminTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
      className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}
