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

    const methodologyPT = 'Preços por kg estimados como preço total dividido pelo peso informado. Categorias derivadas: Leitão (<25kg ou <2 meses), Engorda (25–90kg ou 2–6 meses), Reprodutores (>90kg ou >6 meses). Indicadores calculam variações vs. período anterior equivalente.'
    const methodologyEN = 'Prices per kg estimated as total price divided by reported weight. Derived categories: Piglet (<25kg or <2 months), Fattening (25–90kg or 2–6 months), Breeders (>90kg or >6 months). Indicators compute changes vs the equivalent prior period.'

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

