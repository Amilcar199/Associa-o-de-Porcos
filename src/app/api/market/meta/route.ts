export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { errorResponse, successResponse } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const lastDoc = await (Product as any).findOne({ $or: [ { isActive: true }, { isActive: { $exists: false } } ], availability: 'available' })
      .sort({ updatedAt: -1 })
      .select({ updatedAt: 1 })
      .lean()

    const regions = await (Product as any).distinct('location', { $or: [ { isActive: true }, { isActive: { $exists: false } } ] })
    const breeds = await (Product as any).distinct('breed', { $or: [ { isActive: true }, { isActive: { $exists: false } } ] })

    const methodologyPT = 'Os indicadores desta Bolsa usam a média simples do preço por kg (AOA/kg) quando aplicável, e AOA/cabeça para a forma "vivo". As variações (dia/semana/mês) comparam as médias com os períodos imediatamente anteriores. A referência semanal poderá ser complementada por cotações oficiais coletadas com vendedores (MarketQuote), exigindo N mínimo de amostras e documentação de metodologia.'
    const methodologyEN = 'The board indicators use the simple average of price per kg (AOA/kg) when applicable, and AOA/head for the "live" form. Variations (daily/weekly/monthly) compare averages against prior periods. Weekly reference may be complemented by official quotes collected from vendors (MarketQuote), requiring a minimum number of samples and documented methodology.'

    return NextResponse.json(successResponse({
      lastUpdated: lastDoc?.updatedAt || null,
      regions: regions.filter(Boolean).map((r: string) => String(r).trim()).filter(Boolean).sort(),
      breeds: (breeds as string[]).filter(Boolean).map((b: string) => String(b).trim()).filter(Boolean).sort(),
      methodology: {
        pt: methodologyPT,
        en: methodologyEN
      },
      dataSource: 'Base interna de produtos e cotações coletadas (MarketQuote)',
      volumeSeriesAvailable: false
    }))
  } catch (error) {
    console.error('Erro em /api/market/meta:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

