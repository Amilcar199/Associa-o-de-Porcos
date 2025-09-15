export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import MarketQuote from '@/models/MarketQuote'
import { errorResponse, successResponse } from '@/lib/api-utils'

type Unit = 'kg' | 'head'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const saleFormParam = searchParams.get('saleForm') as ('carcaça' | 'vivo') | null
    const unit = (searchParams.get('unit') as Unit) || (saleFormParam === 'vivo' ? 'head' : 'kg')
    const region = searchParams.get('region') || undefined
    const breed = searchParams.get('breed') || undefined
    const startParam = searchParams.get('start')
    const endParam = searchParams.get('end')
    const cleanOutliers = String(searchParams.get('cleanOutliers') || 'false') === 'true'
    const weighted = String(searchParams.get('weighted') || 'false') === 'true'
    const bandPct = Math.min(Math.max(parseFloat(searchParams.get('bandPct') || '0.1'), 0.01), 0.5)
    const granularityParam = (searchParams.get('granularity') || 'day').toLowerCase()
    const granularity = ['hour','day','month','year'].includes(granularityParam) ? granularityParam : 'day'

    const now = new Date()
    const defaultStart = new Date(now)
    defaultStart.setDate(defaultStart.getDate() - 90)
    const start = startParam ? new Date(startParam) : defaultStart
    const end = endParam ? new Date(endParam) : now

    const matchStage: any = {
      $and: [
        { $or: [ { isActive: true }, { isActive: { $exists: false } } ] },
        { $or: [ { updatedAt: { $gte: start, $lt: end } }, { createdAt: { $gte: start, $lt: end } } ] },
        { $or: [ { availability: 'available' }, { availability: { $exists: false } } ] },
      ]
    }
    if (region) matchStage.$and.push({ location: { $regex: new RegExp(region, 'i') } })
    if (saleFormParam) matchStage.$and.push({ saleForm: saleFormParam })

    const pipeline: any[] = [
      { $match: matchStage },
      { $addFields: {
        ts: { $ifNull: ['$updatedAt', '$createdAt'] },
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
          $cond: [ { $and: [ { $eq: [unit, 'kg'] }, { $gt: ['$weight', 0] } ] }, '$weight', 1 ]
        }
      }},
    ]

    if (breed) pipeline.push({ $match: { breed } })

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

    const formatMap: Record<string, string> = {
      hour: '%Y-%m-%d %H:00',
      day: '%Y-%m-%d',
      month: '%Y-%m',
      year: '%Y'
    }
    const groupFormat = formatMap[granularity]

    pipeline.push(
      { $addFields: { bucket: { $dateToString: { format: groupFormat, date: '$ts' } } } },
      {
        $group: {
          _id: '$bucket',
          count: { $sum: 1 },
          avgSimple: { $avg: '$value' },
          sumWeightedValue: { $sum: { $multiply: ['$value', '$weightForWeighting'] } },
          sumWeight: { $sum: '$weightForWeighting' }
        }
      },
      { $project: {
        _id: 1,
        count: 1,
        avg: {
          $cond: [
            weighted,
            { $cond: [ { $gt: ['$sumWeight', 0] }, { $divide: ['$sumWeightedValue', '$sumWeight'] }, null ] },
            '$avgSimple'
          ]
        }
      } },
      { $sort: { _id: 1 } }
    )

    const result = await (Product as any).aggregate(pipeline)
    return NextResponse.json(successResponse({ unit, granularity, series: (result as any[]).map((r: any) => ({ date: r._id as string, avg: r.avg as number | null, count: r.count as number })) }))
  } catch (error) {
    console.error('Erro em /api/market/history:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

