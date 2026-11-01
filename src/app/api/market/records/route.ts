export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import MarketQuote from '@/models/MarketQuote'
import { errorResponse, successResponse } from '@/lib/api-utils'
import { publicListingFilter } from '@/lib/pig-listings'
import { priceValueStages } from '@/lib/market-price'

type Unit = 'kg' | 'head'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const saleFormParam = searchParams.get('saleForm') as ('carcaça' | 'vivo') | null
    const unit: Unit = (searchParams.get('unit') as Unit) || (saleFormParam === 'vivo' ? 'head' : 'kg')
    const region = searchParams.get('region') || undefined
    const breed = searchParams.get('breed') || undefined
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500)
    const startParam = searchParams.get('start')
    const endParam = searchParams.get('end')
    const cleanOutliers = String(searchParams.get('cleanOutliers') || 'false') === 'true'
    const bandPct = Math.min(Math.max(parseFloat(searchParams.get('bandPct') || '0.1'), 0.01), 0.5)

    const matchStage: any = {
      $and: [
        publicListingFilter(),
      ]
    }
    if (startParam && endParam) {
      const start = new Date(startParam)
      const end = new Date(endParam)
      matchStage.$and.push({ $or: [{ updatedAt: { $gte: start, $lt: end } }, { createdAt: { $gte: start, $lt: end } }] })
    }
    if (region) matchStage.$and.push({ location: { $regex: new RegExp(region, 'i') } })
    if (saleFormParam) matchStage.$and.push({ saleForm: saleFormParam })

    const pipeline: any[] = [
      { $match: matchStage },
      ...priceValueStages(unit),
      { $match: { value: { $gt: 0 } } },
    ]

    if (breed) pipeline.push({ $match: { breed } })

    pipeline.push({ $sort: { updatedAt: -1 } })
    pipeline.push({ $limit: limit })
    pipeline.push({
      $project: {
        _id: 0,
        id: '$_id',
        name: '$name',
        date: { $ifNull: ['$updatedAt', '$createdAt'] },
        region: '$location',
        breed: '$breed',
        unit: { $literal: unit },
        value: '$value',
        saleForm: '$saleForm',
        source: { $literal: 'Anúncio publicado' }
      }
    })

    const docs = await (Product as any).aggregate(pipeline)

    // Anchor based on latest approved quote for the region (if provided)
    let anchor: { ref: number | null, bandPct: number } = { ref: null, bandPct }
    try {
      if (region) {
        const mq = await (MarketQuote as any).findOne({ region: new RegExp(region, 'i'), status: 'approved', ...(saleFormParam ? { saleForm: saleFormParam } : {}) }).sort({ updatedAt: -1 }).lean()
        if (mq) anchor.ref = unit === 'kg' ? (mq.refPricePerKg ?? null) : (mq.refPricePerHead ?? null)
      }
    } catch {}

    const data = (docs as any[]).map((d: any) => {
      const outOfBand = !!(anchor.ref != null && d.value != null && (
        d.value < (anchor.ref * (1 - anchor.bandPct)) || d.value > (anchor.ref * (1 + anchor.bandPct))
      ))
      return {
        id: String(d.id),
        name: d.name,
        date: d.date,
        region: d.region,
        breed: d.breed,
        unit,
        value: d.value ?? null,
        saleForm: d.saleForm || saleFormParam || null,
        source: 'Anúncio publicado',
        outOfBand: cleanOutliers ? false : outOfBand
      }
    })

    return NextResponse.json(successResponse({ unit, records: data, anchor }))
  } catch (error) {
    console.error('Erro em /api/market/records:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

