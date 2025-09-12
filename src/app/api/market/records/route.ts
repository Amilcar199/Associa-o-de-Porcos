export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { errorResponse, successResponse } from '@/lib/api-utils'
import MarketQuote from '@/models/MarketQuote'

type Unit = 'kg' | 'head'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const unit = (searchParams.get('unit') as Unit) || 'kg'
    const region = searchParams.get('region') || undefined
    const breed = searchParams.get('breed') || undefined
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500)

    const matchStage: any = {
      $and: [
        { $or: [ { isActive: true }, { isActive: { $exists: false } } ] },
      ]
    }

    if (region) {
      matchStage.$and.push({ location: { $regex: new RegExp(region, 'i') } })
    }
    matchStage.$and.push({ $or: [ { availability: 'available' }, { availability: { $exists: false } } ] })

    const pipeline: any[] = [
      { $match: matchStage },
      { $addFields: {
        pricePerKg: {
          $cond: [
            { $and: [ { $gt: ['$price', 0] }, { $gt: ['$weight', 0] } ] },
            { $divide: ['$price', '$weight'] },
            null
          ]
        },
        value: { $cond: [ { $eq: [unit, 'kg'] }, '$pricePerKg', '$price' ] }
      }},
    ]

    if (breed) {
      pipeline.push({ $match: { breed } })
    }

    pipeline.push({ $sort: { updatedAt: -1 } })
    pipeline.push({ $limit: limit })
    pipeline.push({
      $project: {
        _id: 0,
        id: '$_id',
        name: '$name',
        date: '$updatedAt',
        region: '$location',
        breed: '$breed',
        weight: 1,
        price: 1,
        pricePerKg: 1,
        value: 1,
        age: 1
      }
    })

    const docs = await (Product as any).aggregate(pipeline)

    // Faixa-âncora baseada na cotação oficial mais recente para a região (se existir)
    let anchor: { ref: number | null, bandPct: number } = { ref: null, bandPct: 0.1 }
    try {
      if (region) {
        const weekISO = new Date().toISOString().slice(0,10) // simplificado; poderia converter para semana ISO
        const mq = await (MarketQuote as any).findOne({ region: new RegExp(region, 'i'), status: 'approved' }).sort({ updatedAt: -1 }).lean()
        if (mq) {
          anchor.ref = unit === 'kg' ? (mq.refPricePerKg ?? null) : (mq.refPricePerHead ?? null)
        }
      }
    } catch {}
    const data = (docs as any[]).map((d: any) => ({
      id: String(d.id),
      name: d.name,
      date: d.date,
      region: d.region,
      breed: d.breed,
      unit,
      value: d.value ?? null,
      // flag fora da banda se existir âncora
      outOfBand: anchor.ref != null && d.value != null ? (
        (d.value < (anchor.ref * (1 - anchor.bandPct))) || (d.value > (anchor.ref * (1 + anchor.bandPct)))
      ) : false
    }))

    return NextResponse.json(successResponse({ unit, records: data, anchor }))
  } catch (error) {
    console.error('Erro em /api/market/records:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

