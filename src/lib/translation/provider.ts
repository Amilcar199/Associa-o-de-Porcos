import { getProvider, getProviderApiKey, TranslationProvider } from './config'

export type ProviderResult = { text: string; provider: TranslationProvider; cost: number }

// Very small rough estimator: characters / 1000 * unit cost (placeholder)
function estimateCost(text: string): number {
  const units = Math.ceil((text || '').length / 1000)
  const provider = getProvider()
  const unitCost = provider === 'deepl' ? 0.002 : provider === 'google' ? 0.0005 : provider === 'aws' ? 0.001 : 0
  return units * unitCost
}

export async function providerTranslate(
  chunks: string[],
  opts: { source: 'pt'; target: 'en' | 'es' }
): Promise<ProviderResult> {
  const provider = getProvider()
  const apiKey = getProviderApiKey()

  const joined = chunks.join('\n')

  if (provider === 'libre') {
    try {
      const endpoint = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.de/translate'
      const body = {
        q: joined,
        source: opts.source,
        target: opts.target,
        format: 'html'
      }
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (resp.ok) {
        const json: any = await resp.json()
        const text = json?.translatedText || joined
        return { text, provider: 'libre', cost: 0 }
      }
    } catch {}
    return { text: joined, provider: 'libre', cost: 0 }
  }

  if (provider === 'none' || !apiKey) {
    return { text: joined, provider: 'none', cost: 0 }
  }

  // Note: For brevity, this uses a mock request. Integrate real providers as needed.
  // DeepL/Google/AWS SDK calls can be added here using the apiKey
  // Example structure (pseudo):
  // if(provider==='deepl'){ const res = await fetch('https://api.deepl.com/v2/translate', { ... }) }

  // For now, echo the content to keep code runnable without external keys
  return { text: joined, provider, cost: estimateCost(joined) }
}

