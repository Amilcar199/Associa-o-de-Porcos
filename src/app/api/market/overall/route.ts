export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { errorResponse, successResponse } from '@/lib/api-utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const pipeline: any[] = [
      { $match: { $and: [ { $or: [ { isActive: true }, { isActive: { $exists: false } } ] }, { availability: 'available' } ] } },
      { $group: { _id: null, count: { $sum: 1 }, avg: { $avg: '$price' } } }
    ]

    const result = await (Product as any).aggregate(pipeline)
    const data = result?.[0] || { count: 0, avg: null }
    return NextResponse.json(successResponse({ count: data.count as number, avg: (data.avg as number | null) ?? null }))
  } catch (error) {
    console.error('Erro em /api/market/overall:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

