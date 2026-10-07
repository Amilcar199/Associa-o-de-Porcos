import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, type RateLimitOptions } from './rate-limit-core'

export { checkRateLimit }
export type { RateLimitOptions, RateLimitResult } from './rate-limit-core'

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

/**
 * Helper de conveniência para usar diretamente numa Route Handler do Next.js.
 * Devolve uma NextResponse 429 pronta a devolver quando o limite é excedido,
 * ou `null` quando o pedido pode prosseguir.
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
