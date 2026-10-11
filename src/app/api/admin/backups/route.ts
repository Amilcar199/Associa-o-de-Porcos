export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Product from '@/models/Product'
import Farm from '@/models/Farm'
import News from '@/models/News'
import MemberContent from '@/models/MemberContent'
import MarketQuote from '@/models/MarketQuote'
import QuoteRequest from '@/models/QuoteRequest'
import QuoteResponse from '@/models/QuoteResponse'
import SiteConfig from '@/models/SiteConfig'
import { errorResponse, validateSession } from '@/lib/api-utils'
import { rateLimitOrNull } from '@/lib/rate-limit'
import { backupUser } from '@/lib/audit'
import { recordAudit } from '@/lib/record-audit'

export async function GET(req: NextRequest) {
  const limited = rateLimitOrNull(req, { key: 'admin-backup', limit: 4, windowMs: 60 * 60 * 1000 })
  if (limited) return limited

  try {
    const auth = await validateSession(req, true)
    if ('error' in auth) return errorResponse(auth.error || 'Não autorizado', auth.status)

    await connectDB()
    const [users, products, farms, news, memberContent, marketQuotes, quoteRequests, quoteResponses, siteConfig] = await Promise.all([
      User.find().select('name email role plan planExpiresAt verificationStatus isActive phone company location createdAt updatedAt').lean(),
      Product.find().lean(),
      Farm.find().lean(),
      News.find().lean(),
      MemberContent.find().lean(),
      MarketQuote.find().lean(),
      QuoteRequest.find().lean(),
      QuoteResponse.find().lean(),
      SiteConfig.find().lean(),
    ])

    const payload = {
      exportedAt: new Date().toISOString(),
      note: 'Cópia sem senhas nem tokens. Guarde o ficheiro fora do servidor.',
      counts: {
        users: users.length,
        products: products.length,
        farms: farms.length,
        news: news.length,
        memberContent: memberContent.length,
        marketQuotes: marketQuotes.length,
        quoteRequests: quoteRequests.length,
        quoteResponses: quoteResponses.length,
      },
      users: users.map((user) => backupUser(user as Record<string, unknown>)),
      products,
      farms,
      news,
      memberContent,
      marketQuotes,
      quoteRequests,
      quoteResponses,
      siteConfig,
    }

    const actorId = (auth.user as { id?: string }).id
    await recordAudit({
      actorId,
      action: 'backup.export',
      entity: 'backup',
      summary: `${users.length} contas, ${products.length} suínos, ${farms.length} fazendas`,
    })

    const stamp = payload.exportedAt.slice(0, 10)
    return new NextResponse(JSON.stringify(payload), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="assuino-copia-${stamp}.json"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Erro ao gerar cópia de segurança:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}
