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

    const methodologyPT = 'Os indicadores usam média simples ou ponderada (quando habilitado) do preço por kg (AOA/kg) para "carcaça" e AOA/cabeça para "vivo". Outliers podem ser limpos por banda (±X%) em torno da cotação oficial por região/forma, quando disponível.'
    const methodologyEN = 'Indicators use simple or weighted averages (when enabled): AOA/kg for "carcass" and AOA/head for "live". Outliers may be cleaned using a band (±X%) around the official quote by region/form, when available.'

    return NextResponse.json(successResponse({
      lastUpdated: lastDoc?.updatedAt || null,
      regions: (regions as string[]).filter(Boolean).map(r => String(r).trim()).filter(Boolean).sort(),
      breeds: (breeds as string[]).filter(Boolean).map(b => String(b).trim()).filter(Boolean).sort(),
      methodology: {
        pt: methodologyPT,
        en: methodologyEN
      },
      dataSource: 'Pesquisa de vendedores + base interna (MarketQuote)',
      volumeSeriesAvailable: false,
      notes: ''
    }))
  } catch (error) {
    console.error('Erro em /api/market/meta:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

