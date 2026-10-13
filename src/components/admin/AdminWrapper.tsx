'use client'

import { AdminThemeProvider } from './AdminTheme'

export default function AdminWrapper({ children }: { children: React.ReactNode }) {
  return <AdminThemeProvider>{children}</AdminThemeProvider>
}
