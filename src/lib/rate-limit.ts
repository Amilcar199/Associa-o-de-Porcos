import { NextRequest, NextResponse } from 'next/server'

/**
 * Rate limiting simples, em memória, para proteger endpoints sensíveis
 * (login, registo, recuperação de senha, formulário de contacto, etc.)
 * contra força bruta e spam automatizado.
 *
 * IMPORTANTE (limitação conhecida):
 * Em ambientes serverless (Vercel), cada instância da função tem a sua
 * própria memória — ou seja, este limitador é "por instância", não
 * globalmente partilhado. Isto já bloqueia a grande maioria dos ataques
 * automatizados simples (o mesmo IP tende a bater na mesma instância em
 * rajadas curtas), mas para uma proteção robusta e distribuída entre
 * todas as instâncias, o recomendado é usar um serviço externo como o
 * Upstash Redis (@upstash/ratelimit), que tem tier gratuito e integra-se
 * facilmente com Vercel. Este ficheiro pode ser substituído por essa
 * implementação sem alterar a forma como é chamado nas rotas.
 */

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Limpeza periódica para não deixar crescer a memória indefinidamente
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

/**
 * Extrai um identificador do cliente a partir dos cabeçalhos do pedido.
 * Vercel/Next.js populam x-forwarded-for com o IP real do visitante.
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp
  return 'unknown'
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

/**
 * Verifica e regista uma tentativa para o identificador dado.
 * Devolve success=false quando o limite foi excedido.
 */
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

/**
 * Helper de conveniência para usar diretamente numa Route Handler do Next.js.
 * Devolve uma NextResponse 429 pronta a devolver quando o limite é excedido,
 * ou `null` quando o pedido pode prosseguir.
 *
 * Exemplo de uso numa rota:
 *   const limited = rateLimitOrNull(req, { key: 'login', limit: 5, windowMs: 60_000 })
 *   if (limited) return limited
 */
export function rateLimitOrNull(req: NextRequest, options: RateLimitOptions): NextResponse | null {
  const ip = getClientIp(req)
  const result = checkRateLimit(ip, options)

  if (!result.success) {
    const retryAfterSeconds = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))
    return NextResponse.json(
      {
        success: false,
        error: 'Demasiadas tentativas. Por favor, aguarde antes de tentar novamente.',
      },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSeconds) },
      }
    )
  }

  return null
}
