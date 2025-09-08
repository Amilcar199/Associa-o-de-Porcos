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

    const methodologyPT = 'Preços por kg calculados como preço informado dividido pelo peso do produto (quando disponível). Para produtos sem peso, o ponto é ignorado no cálculo por kg. As variações (dia/semana/mês) comparam médias com seus períodos imediatamente anteriores. Fonte: base interna de produtos.'
    const methodologyEN = 'Prices per kg are computed as total price divided by product weight (when available). Products without weight are excluded from per‑kg calculations. Variations (daily/weekly/monthly) compare averages against their immediate prior periods. Source: internal products database.'

    return NextResponse.json(successResponse({
      lastUpdated: lastDoc?.updatedAt || null,
      regions: regions.filter(Boolean).map((r: string) => String(r).trim()).filter(Boolean).sort(),
      breeds: (breeds as string[]).filter(Boolean).map((b: string) => String(b).trim()).filter(Boolean).sort(),
      methodology: {
        pt: methodologyPT,
        en: methodologyEN
      },
      dataSource: 'Base interna de produtos',
      volumeSeriesAvailable: false
    }))
  } catch (error) {
    console.error('Erro em /api/market/meta:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

