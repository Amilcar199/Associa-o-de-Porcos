export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { errorResponse, successResponse } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const unit = (searchParams.get('unit') as ('kg' | 'head')) || 'kg'
    const saleFormParam = searchParams.get('saleForm') as ('carcaça' | 'vivo') | null
    const region = searchParams.get('region') || undefined
    const breed = searchParams.get('breed') || undefined

    const matchStage: any = {
      $and: [
        { $or: [ { isActive: true }, { isActive: { $exists: false } } ] },
        { $or: [ { availability: 'available' }, { availability: { $exists: false } } ] },
      ]
    }
    if (region) matchStage.$and.push({ location: { $regex: new RegExp(region, 'i') } })
    if (saleFormParam) matchStage.$and.push({ saleForm: saleFormParam })

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
        value: { $cond: [ { $eq: [unit, 'kg'] }, '$pricePerKg', '$price' ] }
      }},
      { $group: { _id: null, count: { $sum: 1 }, avg: { $avg: '$value' } } }
    ]

    if (breed) pipeline.splice(1, 0, { $match: { breed } })

    const result = await (Product as any).aggregate(pipeline)
    const data = result?.[0] || { count: 0, avg: null }
    return NextResponse.json(successResponse({ unit, count: data.count as number, avg: (data.avg as number | null) ?? null }))
  } catch (error) {
    console.error('Erro em /api/market/overall:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

