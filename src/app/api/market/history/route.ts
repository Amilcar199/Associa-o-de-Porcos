export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { errorResponse, successResponse } from '@/lib/api-utils'

type Unit = 'kg' | 'head'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const unit = (searchParams.get('unit') as Unit) || 'kg'
    const region = searchParams.get('region') || undefined
    const breed = searchParams.get('breed') || undefined
    const startParam = searchParams.get('start')
    const endParam = searchParams.get('end')
    const now = new Date()
    const defaultStart = new Date(now)
    defaultStart.setDate(defaultStart.getDate() - 90)

    const start = startParam ? new Date(startParam) : defaultStart
    const end = endParam ? new Date(endParam) : now

    const matchStage: any = {
      $and: [
        { $or: [ { isActive: true }, { isActive: { $exists: false } } ] },
        { availability: 'available' },
        { updatedAt: { $gte: start, $lt: end } },
      ]
    }

    if (region) {
      matchStage.$and.push({ location: { $regex: new RegExp(region, 'i') } })
    }

    const pipeline: any[] = [
      { $match: matchStage },
      { $addFields: {
        pricePerKg: {
          $cond: [
            { $and: [ { $gt: ['$price', 0] }, { $gt: ['$weight', 0] } ] },
            { $divide: ['$price', '$weight'] },
            null
          ]
        }
      }},
    ]

    if (breed) {
      pipeline.push({ $match: { breed } })
    }

    pipeline.push(
      { $addFields: { day: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } } } },
      {
        $group: {
          _id: '$day',
          count: { $sum: 1 },
          avg: { $avg: unit === 'kg' ? '$pricePerKg' : '$price' }
        }
      },
      { $sort: { _id: 1 } }
    )

    const result = await (Product as any).aggregate(pipeline)
    return NextResponse.json(successResponse({ unit, series: (result as any[]).map((r: any) => ({ date: r._id as string, avg: r.avg as number | null, count: r.count as number })) }))
  } catch (error) {
    console.error('Erro em /api/market/history:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

