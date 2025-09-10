// Utilities to preserve HTML and only translate text nodes in a naive but safe-enough way

// Split HTML into tokens: tags vs text
export function splitHtmlIntoSegments(input: string): Array<{ type: 'tag' | 'text'; value: string }> {
  const segments: Array<{ type: 'tag' | 'text'; value: string }> = []
  const regex = /(<[^>]+>)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: input.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'tag', value: match[1] })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < input.length) {
    segments.push({ type: 'text', value: input.slice(lastIndex) })
  }
  return segments
}

export function joinSegments(segments: Array<{ type: 'tag' | 'text'; value: string }>): string {
  return segments.map((s) => s.value).join('')
}

// Mask glossary terms in text segments only
export function maskTermsInSegments(segments: Array<{ type: 'tag' | 'text'; value: string }>, glossary: string[]) {
  const tokens: Record<string, string> = {}
  let tokenIndex = 0
  const escaped = glossary
    .filter(Boolean)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .filter(Boolean)
  if (escaped.length === 0) {
    return {
      masked: segments,
      unmask: (text: string) => text
    }
  }
  const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi')
  const masked = segments.map((seg) => {
    if (seg.type === 'tag') return seg
    return {
      type: 'text' as const,
      value: seg.value.replace(pattern, (match) => {
        const token = `__GLOSS_${tokenIndex++}__`
        tokens[token] = match
        return token
      })
    }
  })
  const unmask = (text: string) => text.replace(/__GLOSS_(\d+)__/g, (m) => tokens[m] || m)
  return { masked, unmask }
}

