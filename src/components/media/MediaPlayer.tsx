'use client'

import { toEmbedUrl, getMediaKind } from '@/lib/media/embed'
import { useState } from 'react'

export default function MediaPlayer({ url, title }: { url: string; title: string }) {
  const kind = getMediaKind(url)
  const [failed, setFailed] = useState(false)

  if (!url || failed) {
    return (
      <div className="flex h-full min-h-32 items-center justify-center bg-gray-900 px-4 text-center text-sm text-gray-300">
        Não foi possível carregar este vídeo.
      </div>
    )
  }

  if (kind === 'youtube' || kind === 'vimeo') {
    return (
      <iframe
        src={toEmbedUrl(url)}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        title={title}
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <video src={url} controls playsInline preload="metadata" className="w-full h-full bg-black" onError={() => setFailed(true)}>
      <source src={url} />
      O seu navegador não suporta a reprodução deste vídeo.
    </video>
  )
}
