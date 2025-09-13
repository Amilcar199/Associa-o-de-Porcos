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
    const saleFormParam = searchParams.get('saleForm') as ('carcaça' | 'vivo') | null
    const unit: Unit = (searchParams.get('unit') as Unit) || (saleFormParam === 'vivo' ? 'head' : 'kg')
    const region = searchParams.get('region') || undefined
    const breed = searchParams.get('breed') || undefined
    const start = searchParams.get('start') ? new Date(searchParams.get('start')!) : undefined
    const end = searchParams.get('end') ? new Date(searchParams.get('end')!) : undefined
    const cleanOutliers = String(searchParams.get('cleanOutliers') || 'false') === 'true'
    const weighted = String(searchParams.get('weighted') || 'false') === 'true'
    const bandPct = Math.min(Math.max(parseFloat(searchParams.get('bandPct') || '0.1'), 0.01), 0.5)

    const matchStage: any = {
      $and: [
        { $or: [ { isActive: true }, { isActive: { $exists: false } } ] },
      ]
    }

    if (start && end) {
      matchStage.$and.push({ updatedAt: { $gte: start, $lt: end } })
    }
    if (region) {
      matchStage.$and.push({ location: { $regex: new RegExp(region, 'i') } })
    }
    if (saleFormParam) {
      matchStage.$and.push({ saleForm: saleFormParam })
    }
    matchStage.$and.push({ $or: [ { availability: 'available' }, { availability: { $exists: false } } ] })

    const pipeline: any[] = [
      { $match: matchStage },
      { $addFields: {
        pricePerKg: {
          $ifNull: [
            '$pricePerKg',
            {
              $cond: [
                { $and: [ { $gt: ['$price', 0] }, { $gt: ['$weight', 0] } ] },
                { $divide: ['$price', '$weight'] },
                null
              ]
            }
          ]
        },
        value: { $cond: [ { $eq: [unit, 'kg'] }, '$pricePerKg', '$price' ] },
        weightForWeighting: {
          $cond: [
            { $and: [ { $eq: [unit, 'kg'] }, { $gt: ['$weight', 0] } ] },
            '$weight',
            1
          ]
        }
      }},
    ]

    if (breed) {
      pipeline.push({ $match: { breed } })
    }

    if (cleanOutliers && region) {
      try {
        const mq = await (MarketQuote as any).findOne({ region: new RegExp(region, 'i'), status: 'approved', ...(saleFormParam ? { saleForm: saleFormParam } : {}) }).sort({ updatedAt: -1 }).lean()
        const anchorRef = mq ? (unit === 'kg' ? (mq.refPricePerKg ?? null) : (mq.refPricePerHead ?? null)) : null
        if (anchorRef != null && anchorRef > 0) {
          const minV = anchorRef * (1 - bandPct)
          const maxV = anchorRef * (1 + bandPct)
          pipeline.push({ $match: { value: { $gte: minV, $lte: maxV } } })
        }
      } catch {}
    }

    pipeline.push({
      $group: {
        _id: '$location',
        count: { $sum: 1 },
        avgSimple: { $avg: '$value' },
        min: { $min: '$value' },
        max: { $max: '$value' },
        sumWeightedValue: { $sum: { $multiply: ['$value', '$weightForWeighting'] } },
        sumWeight: { $sum: '$weightForWeighting' }
      }
    })
    pipeline.push({ $project: {
      _id: 1,
      count: 1,
      min: 1,
      max: 1,
      avg: {
        $cond: [
          weighted,
          { $cond: [ { $gt: ['$sumWeight', 0] }, { $divide: ['$sumWeightedValue', '$sumWeight'] }, null ] },
          '$avgSimple'
        ]
      }
    } })
    pipeline.push({ $sort: { _id: 1 } })

    const result = await (Product as any).aggregate(pipeline)
    return NextResponse.json(successResponse({ unit, regions: (result as any[]).map((r: any) => ({ region: r._id as string, count: r.count as number, avg: (r.avg as number | null), min: r.min as number | null, max: r.max as number | null })) }))
  } catch (error) {
    console.error('Erro em /api/market/regions:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

