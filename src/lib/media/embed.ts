export type MediaKind = 'youtube' | 'vimeo' | 'file'

export function getYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url, 'https://assuino.com')
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '').split('/')[0] || null
    }
    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.searchParams.get('v')) return parsed.searchParams.get('v')
      const parts = parsed.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') {
        return parts[1] || null
      }
    }
  } catch {
    const match = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/)
    return match?.[1] || null
  }
  return null
}

export function getVimeoId(url: string): string | null {
  try {
    const parsed = new URL(url, 'https://assuino.com')
    if (!parsed.hostname.includes('vimeo.com')) return null
    const parts = parsed.pathname.split('/').filter(Boolean)
    const id = parts.find((part) => /^\d+$/.test(part))
    return id || null
  } catch {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
    return match?.[1] || null
  }
}

export function getMediaKind(url: string): MediaKind {
  if (getYoutubeId(url)) return 'youtube'
  if (getVimeoId(url)) return 'vimeo'
  return 'file'
}

export function toEmbedUrl(url: string): string {
  const youtubeId = getYoutubeId(url)
  if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}`
  const vimeoId = getVimeoId(url)
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`
  return url
}
