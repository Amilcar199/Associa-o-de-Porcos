export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/models/Product'
import { errorResponse, successResponse } from '@/lib/api-utils'

type Unit = 'kg' | 'head'

function deriveCategory(weight?: number, age?: number) {
  if (weight !== undefined && weight < 25) return { key: 'piglet', label: 'Leitão' }
  if (age !== undefined && age < 2) return { key: 'piglet', label: 'Leitão' }
  if ((weight !== undefined && weight <= 90) || (age !== undefined && age <= 6)) return { key: 'fattening', label: 'Engorda' }
  return { key: 'breeders', label: 'Reprodutores' }
}

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

    pipeline.push({ $sort: { updatedAt: -1 } })
    pipeline.push({ $limit: limit })
    pipeline.push({
      $project: {
        _id: 0,
        id: '$_id',
        name: '$name',
        date: '$updatedAt',
        region: '$location',
        weight: 1,
        price: 1,
        pricePerKg: 1,
        age: 1,
        categoryKey: 1
      }
    })

    const docs = await (Product as any).aggregate(pipeline)
    const data = (docs as any[]).map((d: any) => {
      const value = unit === 'kg' ? (d.pricePerKg ?? null) : (d.price ?? null)
      return {
        id: String(d.id),
        name: d.name,
        date: d.date,
        region: d.region,
        breed: d.breed,
        unit,
        value
      }
    })

    return NextResponse.json(successResponse({ unit, records: data }))
  } catch (error) {
    console.error('Erro em /api/market/records:', error)
    return errorResponse('Erro interno do servidor', 500)
  }
}

