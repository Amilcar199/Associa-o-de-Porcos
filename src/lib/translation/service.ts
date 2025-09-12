import { splitHtmlIntoSegments, joinSegments, maskTermsInSegments } from './html'
import { providerTranslate } from './provider'
import { LocaleKey } from './config'

export async function translateRichText(
  htmlOrText: string,
  source: 'pt',
  target: LocaleKey,
  glossary: string[]
): Promise<{ text: string; provider: string; cost: number }> {
  // 1) Split HTML into segments and mask glossary terms on text segments
  const segments = splitHtmlIntoSegments(htmlOrText)
  const { masked, unmask } = maskTermsInSegments(segments, glossary)

  // 2) Extract only text segments for translation
  const textChunks = masked.filter((s) => s.type === 'text').map((s) => s.value)

  // 3) Provider translate
  const result = await providerTranslate(textChunks, { source, target: target === 'en' ? 'en' : 'es' })

  // 4) Reassemble: replace text segments with translated content (split by lines)
  const translatedTextChunks = result.text.split('\n')
  let textIndex = 0
  const reassembled = masked.map((seg) => {
    if (seg.type === 'tag') return seg
    const value = translatedTextChunks[textIndex++] ?? seg.value
    return { type: 'text' as const, value }
  })

  const joined = joinSegments(reassembled)
  const final = unmask(joined)

  return { text: final, provider: result.provider, cost: result.cost }
}

