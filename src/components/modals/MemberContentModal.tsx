"use client";

import { useCallback, useEffect } from 'react'

type MemberContentType = 'document' | 'video' | 'article' | 'event'

export interface MemberContentModalData {
  id?: string
  _id?: string
  title: string
  description?: string
  type: MemberContentType
  category?: string
  url?: string
  thumbnail?: string
  content?: string
  fileUrl?: string
  videoUrl?: string
  eventDate?: string | Date | null
  eventLocation?: string
  createdAt?: string | Date
}

interface MemberContentModalProps {
  isOpen: boolean
  onClose: () => void
  data: MemberContentModalData | null
  isEn?: boolean
}

const getYouTubeEmbed = (url?: string) => {
  if (!url) return null
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/)
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`
  }
  return null
}

export default function MemberContentModal({ isOpen, onClose, data, isEn = false }: MemberContentModalProps) {
  const contentId = data?.id || (data as any)?._id

  useEffect(() => {
    if (!isOpen || !contentId) return
    try {
      const url = `/api/members/content/${contentId}/view`
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url)
      } else {
        fetch(url, { method: 'POST', keepalive: true })
      }
    } catch {}
  }, [isOpen, contentId])

  const onOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  if (!isOpen || !data) return null

  const embed = getYouTubeEmbed(data.videoUrl || data.url)
  const dateLabel = data.eventDate ? new Date(data.eventDate).toLocaleString(isEn ? 'en-US' : 'pt-AO') : null

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onOverlayClick} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="flex items-start justify-between p-4 border-b">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
              {data.category && (
                <p className="text-xs text-gray-500 mt-0.5">{data.category}</p>
              )}
            </div>
            <button onClick={onClose} aria-label={isEn ? 'Close' : 'Fechar'} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
            {data.thumbnail && (
              <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                <img src={data.thumbnail} alt={data.title} className="w-full h-full object-cover" />
              </div>
            )}

            {data.type === 'article' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{data.content || data.description}</p>
              </div>
            )}

            {data.type === 'video' && (
              embed ? (
                <div className="aspect-video">
                  <iframe
                    className="w-full h-full"
                    src={embed}
                    title={data.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div>
                  <p className="text-gray-700 mb-3">{data.description}</p>
                  {(data.videoUrl || data.url) && (
                    <a href={data.videoUrl || data.url} target="_blank" rel="noreferrer" className="btn-primary inline-flex items-center">
                      ▶ {isEn ? 'Watch video' : 'Assistir vídeo'}
                    </a>
                  )}
                </div>
              )
            )}

            {data.type === 'document' && (
              <div>
                <p className="text-gray-700 mb-3">{data.description}</p>
                {(data.fileUrl || data.url) && (
                  <a
                    href={data.fileUrl || data.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    📥 {isEn ? 'Download' : 'Baixar'}
                  </a>
                )}
              </div>
            )}

            {data.type === 'event' && (
              <div className="space-y-2">
                {dateLabel && (
                  <div className="text-sm text-gray-700">{isEn ? 'Date' : 'Data'}: {dateLabel}</div>
                )}
                {data.eventLocation && (
                  <div className="text-sm text-gray-700">{isEn ? 'Location' : 'Local'}: {data.eventLocation}</div>
                )}
                {data.description && (
                  <p className="text-gray-700">{data.description}</p>
                )}
                {data.url && (
                  <a href={data.url} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    {isEn ? 'Open link' : 'Abrir link'}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

