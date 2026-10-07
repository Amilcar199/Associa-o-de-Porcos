/**
 * Contador em memória, sem dependência do Next.js, para poder ser testado
 * fora do servidor. Cada instância serverless tem o seu próprio mapa.
 */

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanupIfNeeded() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) buckets.delete(key)
  })
}

export interface RateLimitOptions {
  /** Identificador único da rota/ação (ex.: "login", "register") */
  key: string
  /** Número máximo de pedidos permitidos dentro da janela */
  limit: number
  /** Duração da janela, em milissegundos */
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function checkRateLimit(identifier: string, options: RateLimitOptions): RateLimitResult {
  cleanupIfNeeded()

  const bucketKey = `${options.key}:${identifier}`
  const now = Date.now()
  const existing = buckets.get(bucketKey)

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + options.windowMs
    buckets.set(bucketKey, { count: 1, resetAt })
    return { success: true, remaining: options.limit - 1, resetAt }
  }

  if (existing.count >= options.limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  return { success: true, remaining: options.limit - existing.count, resetAt: existing.resetAt }
}
