'use client'

import { useEffect, useState } from 'react'

interface ViewCounterProps {
  newsId: string
  initialViews: number
}

export default function ViewCounter({ newsId, initialViews }: ViewCounterProps) {
  const [views, setViews] = useState(initialViews)
  const [hasIncremented, setHasIncremented] = useState(false)

  useEffect(() => {
    // Incrementar visualizações apenas uma vez quando o componente for montado
    if (!hasIncremented) {
      const incrementViews = async () => {
        try {
          const response = await fetch(`/api/news/${newsId}/views`, {
            method: 'POST'
          })
          
          if (response.ok) {
            const data = await response.json()
            setViews(data.data.views)
            setHasIncremented(true)
          }
        } catch (error) {
          console.error('Erro ao incrementar visualizações:', error)
        }
      }

      incrementViews()
    }
  }, [newsId, hasIncremented])

  return (
    <div className="flex items-center space-x-1">
      <span>👁️</span>
      <span>{views.toLocaleString()} visualizações</span>
    </div>
  )
}