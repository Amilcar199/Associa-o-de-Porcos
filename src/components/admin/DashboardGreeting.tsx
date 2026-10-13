'use client'

import { useEffect, useState } from 'react'

export default function DashboardGreeting({ firstName }: { firstName?: string }) {
  const [greeting, setGreeting] = useState('Olá')
  const [today, setToday] = useState('')

  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    setGreeting(hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite')
    setToday(now.toLocaleDateString('pt-AO', { weekday: 'long', day: 'numeric', month: 'long' }))
  }, [])

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-primary-900 to-primary-700 px-6 py-8 lg:px-8 text-white shadow-sm">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 right-16 h-28 w-28 rounded-full bg-primary-400/20" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary-200">Painel</p>
          <h1 className="mt-1 text-2xl font-bold lg:text-3xl">
            {greeting}{firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-primary-100 sm:text-base">
            Visão do dia: números do sistema, filas que pedem ação e o que aconteceu por último.
          </p>
        </div>
        {today && (
          <p className="shrink-0 text-sm text-primary-100">{today}</p>
        )}
      </div>
    </div>
  )
}
