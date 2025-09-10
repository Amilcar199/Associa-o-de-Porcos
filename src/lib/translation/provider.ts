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

  if (provider === 'none' || !apiKey) {
    // Fallback: return original text to avoid breaking the pipeline
    return { text: joined, provider: 'none', cost: 0 }
  }

  // Note: For brevity, this uses a mock request. Integrate real providers as needed.
  // DeepL/Google/AWS SDK calls can be added here using the apiKey
  // Example structure (pseudo):
  // if(provider==='deepl'){ const res = await fetch('https://api.deepl.com/v2/translate', { ... }) }

  // For now, echo the content to keep code runnable without external keys
  return { text: joined, provider, cost: estimateCost(joined) }
}

