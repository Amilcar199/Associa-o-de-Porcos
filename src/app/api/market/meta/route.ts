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

    const methodologyPT = 'Os indicadores desta Bolsa usam média simples ou ponderada por amostra do preço por kg (AOA/kg) na forma carcaça e AOA/cabeça na forma vivo. Variações (dia/semana/mês) comparam períodos imediatamente anteriores. Outliers podem ser limpos com base em bandas de ±10% em torno da cotação oficial (quando disponível) por região/forma. Referência semanal pode ser complementada por cotações oficiais coletadas com vendedores (MarketQuote), exigindo N mínimo de amostras.'
    const methodologyEN = 'The board indicators use simple or sample-weighted averages of price per kg (AOA/kg) for carcass and AOA/head for live. Variations (daily/weekly/monthly) compare against immediately prior periods. Outliers may be cleaned using ±10% bands around official quotes (when available) by region/form. Weekly reference may be complemented by official quotes collected from vendors (MarketQuote), requiring a minimum sample size.'

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

