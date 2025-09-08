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
    const start = searchParams.get('start') ? new Date(searchParams.get('start')!) : undefined
    const end = searchParams.get('end') ? new Date(searchParams.get('end')!) : undefined

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
    matchStage.$and.push({ availability: 'available' })

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

    pipeline.push({
      $group: {
        _id: '$location',
        count: { $sum: 1 },
        avg: { $avg: unit === 'kg' ? '$pricePerKg' : '$price' },
        min: { $min: unit === 'kg' ? '$pricePerKg' : '$price' },
        max: { $max: unit === 'kg' ? '$pricePerKg' : '$price' },
      }
    })
    pipeline.push({ $sort: { _id: 1 } })

    const result = await (Product as any).aggregate(pipeline)
    return NextResponse.json(successResponse({ unit, regions: (result as any[]).map((r: any) => ({ region: r._id as string, count: r.count as number, avg: r.avg as number | null, min: r.min as number | null, max: r.max as number | null })) }))
  } catch (error) {
    console.error('Erro em /api/market/regions:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

